const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

function sanitizeRelativePath(relativePath) {
  if (!relativePath || typeof relativePath !== 'string') return '';
  const normalized = path.normalize(relativePath).replace(/\\/g, '/');
  const parts = normalized.split('/').filter(Boolean).filter((p) => p !== '..');
  return parts.join('/');
}

function resolveUploadPath(uploadsDir, relativePath) {
  const safe = sanitizeRelativePath(relativePath);
  const fullPath = safe ? path.join(uploadsDir, ...safe.split('/')) : uploadsDir;
  const resolvedUploads = path.resolve(uploadsDir);
  const resolvedFull = path.resolve(fullPath);
  if (!resolvedFull.startsWith(resolvedUploads + path.sep) && resolvedFull !== resolvedUploads) {
    return null;
  }
  return resolvedFull;
}

// Test route to verify the router is working
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Uploads router is working' });
});

// Ensure uploads directory exists
const ensureUploadsDir = (folderPath) => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const safeFolder = sanitizeRelativePath(folderPath || 'general') || 'general';
  const targetDir = path.join(uploadsDir, ...safeFolder.split('/'));
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  return targetDir;
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = sanitizeRelativePath(req.query.folderPath || 'general') || 'general';
    const targetDir = ensureUploadsDir(folderPath);
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const randomNum = Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
    const filename = `${name}-${timestamp}-${randomNum}${ext}`;
    cb(null, filename);
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Upload file endpoint
router.post('/upload',
  authenticateToken,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const folderPath = sanitizeRelativePath(req.query.folderPath || 'general') || 'general';
      const fileName = req.file.filename;
      const originalName = req.file.originalname;
      const fileSize = req.file.size;
      const mimeType = req.file.mimetype;

      // Create relative path for database storage (normalize to forward slashes for URLs)
      const relativePath = path.join(folderPath, fileName).replace(/\\/g, '/');
      
      // Create full URL path for frontend access
      // Use the host from the request, but ensure we use the correct protocol
      const host = req.get('host');
      const protocol = req.protocol || (req.secure ? 'https' : 'http');
      
      // For production domain, ensure we use the correct host
      let baseUrl = `${protocol}://${host}`;
      
      // If request is from production domain but host doesn't match, use the referer or origin
      const origin = req.get('origin') || req.get('referer');
      if (origin) {
        try {
          const originUrl = new URL(origin);
          // If origin is from webonone.com, use that hostname
          if (originUrl.hostname === 'www.webonone.com' || originUrl.hostname === 'webonone.com') {
            baseUrl = `${originUrl.protocol}//${originUrl.hostname}:5007`;
          }
        } catch (e) {
          // Invalid origin, use default
        }
      }
      
      const fileUrl = `${baseUrl}/uploads/${relativePath}`;

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          fileName: fileName,
          originalName: originalName,
          filePath: relativePath,
          fileUrl: fileUrl,
          fileSize: fileSize,
          mimeType: mimeType,
          folderPath: folderPath
        }
      });
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during file upload'
      });
    }
  })
);

// Delete file endpoint
router.delete('/delete/:filePath(*)',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      let { filePath } = req.params;
      
      if (!filePath) {
        return res.status(400).json({
          success: false,
          message: 'File path is required'
        });
      }

      // Decode URL-encoded path
      filePath = decodeURIComponent(filePath);

      const uploadsDir = path.join(__dirname, '..', 'uploads');
      const fullPath = resolveUploadPath(uploadsDir, filePath);

      if (!fullPath) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file path',
        });
      }

      if (!fs.existsSync(fullPath)) {
        return res.status(404).json({
          success: false,
          message: 'File not found',
        });
      }

      fs.unlinkSync(fullPath);

      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      console.error('File deletion error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during file deletion',
        error: error.message
      });
    }
  })
);

// Get file info endpoint
router.get('/info/:filePath(*)',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      let { filePath } = req.params;
      
      if (!filePath) {
        return res.status(400).json({
          success: false,
          message: 'File path is required'
        });
      }

      // Decode URL-encoded path
      filePath = decodeURIComponent(filePath);

      const uploadsDir = path.join(__dirname, '..', 'uploads');
      const fullPath = path.join(uploadsDir, filePath.replace(/\//g, path.sep));

      // Check if file exists
      if (!fs.existsSync(fullPath)) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      // Get file stats
      const stats = fs.statSync(fullPath);
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const fileUrl = `${baseUrl}/uploads/${filePath}`;

      res.status(200).json({
        success: true,
        data: {
          fileName: path.basename(filePath),
          filePath: filePath,
          fileUrl: fileUrl,
          fileSize: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime
        }
      });
    } catch (error) {
      console.error('Get file info error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while getting file info'
      });
    }
  })
);

module.exports = router;
