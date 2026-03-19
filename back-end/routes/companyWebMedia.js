const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { asyncHandler, validationError } = require('../middleware/errorHandler');
const Joi = require('joi');

const router = express.Router();

const MEDIA_SUBDIR = 'web/media';

function getCompanyMediaRoot(companyId) {
  return path.join(__dirname, '..', 'uploads', 'companies', companyId, 'web', 'media');
}

function sanitizeRelativePath(relativePath) {
  if (!relativePath || typeof relativePath !== 'string') return '';
  const normalized = path.normalize(relativePath).replace(/\\/g, '/');
  const parts = normalized.split('/').filter(Boolean).filter(p => p !== '..');
  return parts.join('/');
}

function getFullPath(companyId, relativePath) {
  const safe = sanitizeRelativePath(relativePath);
  const root = getCompanyMediaRoot(companyId);
  return safe ? path.join(root, safe) : root;
}

function rmRecursive(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dirPath, ent.name);
    if (ent.isDirectory()) rmRecursive(full);
    else fs.unlinkSync(full);
  }
  fs.rmdirSync(dirPath);
}

// List folder contents: GET /api/company-web-media?companyId=xxx&path= (path optional)
router.get('/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { companyId, path: relativePath } = req.query;
    const schema = Joi.object({
      companyId: Joi.string().length(10).required(),
      path: Joi.string().allow('', null).optional(),
    });
    const { error, value } = schema.validate({ companyId, path: relativePath });
    if (error) throw validationError(error.details[0].message);

    const fullDir = getFullPath(value.companyId, value.path || '');
    if (!fs.existsSync(fullDir)) {
      return res.json({
        success: true,
        data: { folders: [], files: [], path: value.path || '' },
      });
    }

    const stat = fs.statSync(fullDir);
    if (!stat.isDirectory()) {
      return res.status(400).json({ success: false, message: 'Path is not a directory' });
    }

    const folders = [];
    const files = [];
    const entries = fs.readdirSync(fullDir, { withFileTypes: true });

    for (const ent of entries) {
      const full = path.join(fullDir, ent.name);
      const rel = (value.path ? value.path + '/' : '') + ent.name;
      if (ent.isDirectory()) {
        folders.push({ name: ent.name, path: rel });
      } else {
        const st = fs.statSync(full);
        const ext = path.extname(ent.name).toLowerCase();
        const isImage = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext);
        files.push({
          name: ent.name,
          path: rel,
          size: st.size,
          isImage,
          modifiedAt: st.mtime,
        });
      }
    }

    folders.sort((a, b) => a.name.localeCompare(b.name));
    files.sort((a, b) => a.name.localeCompare(b.name));

    res.json({
      success: true,
      data: { folders, files, path: value.path || '' },
    });
  })
);

// Create folder: POST /api/company-web-media/folders
const createFolderSchema = Joi.object({
  companyId: Joi.string().length(10).required(),
  path: Joi.string().allow('', null).optional(),
  name: Joi.string().min(1).max(255).required().pattern(/^[^/\\]+$/),
});
router.post('/folders',
  authenticateToken,
  requirePermission('manage_company'),
  asyncHandler(async (req, res) => {
    const { error, value } = createFolderSchema.validate(req.body);
    if (error) throw validationError(error.details[0].message);

    const parentDir = getFullPath(value.companyId, value.path || '');
    const newFolderPath = path.join(parentDir, value.name);

    if (fs.existsSync(newFolderPath)) {
      return res.status(400).json({
        success: false,
        message: 'A folder with this name already exists',
      });
    }

    fs.mkdirSync(newFolderPath, { recursive: true });
    const relativePath = (value.path ? value.path + '/' : '') + value.name;

    res.status(201).json({
      success: true,
      message: 'Folder created',
      data: { name: value.name, path: relativePath },
    });
  })
);

// Upload: POST /api/company-web-media/upload (multipart: companyId, path, file(s))
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const mediaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const companyId = req.query.companyId;
    const relPath = req.query.path || '';
    if (!companyId) return cb(new Error('companyId is required'), null);
    const dir = getFullPath(companyId, relPath);
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const base = path.basename(file.originalname, path.extname(file.originalname)).replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = path.extname(file.originalname) || '';
    const name = `${base}-${Date.now()}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage: mediaStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

router.post('/upload',
  authenticateToken,
  requirePermission('manage_company'),
  upload.array('files', 20),
  asyncHandler(async (req, res) => {
    const companyId = req.query.companyId;
    const relPath = req.query.path || '';
    if (!companyId) throw validationError('companyId is required');

    const uploaded = (req.files || []).map((f) => ({
      name: f.filename,
      originalName: f.originalname,
      path: relPath ? `${relPath}/${f.filename}` : f.filename,
      size: f.size,
      mimeType: f.mimetype,
    }));

    res.status(201).json({
      success: true,
      message: 'Files uploaded',
      data: uploaded,
    });
  })
);

// Delete file or folder: DELETE /api/company-web-media
const deleteSchema = Joi.object({
  companyId: Joi.string().length(10).required(),
  path: Joi.string().min(1).required(),
  type: Joi.string().valid('file', 'folder').required(),
});
router.delete('/',
  authenticateToken,
  requirePermission('manage_company'),
  asyncHandler(async (req, res) => {
    const { error, value } = deleteSchema.validate(req.query);
    if (error) throw validationError(error.details[0].message);

    const full = getFullPath(value.companyId, value.path);
    if (!fs.existsSync(full)) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    const stat = fs.statSync(full);
    if (value.type === 'folder') {
      if (!stat.isDirectory()) {
        return res.status(400).json({ success: false, message: 'Path is not a folder' });
      }
      rmRecursive(full);
    } else {
      if (!stat.isFile()) {
        return res.status(400).json({ success: false, message: 'Path is not a file' });
      }
      fs.unlinkSync(full);
    }

    res.json({ success: true, message: value.type === 'folder' ? 'Folder deleted' : 'File deleted' });
  })
);

module.exports = router;
