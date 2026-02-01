const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Test route to verify the router is working
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Uploads router is working' });
});

// Ensure uploads directory exists
const ensureUploadsDir = (folderPath) => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const targetDir = path.join(uploadsDir, folderPath);
  
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
    const folderPath = req.query.folderPath || 'general';
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

      const folderPath = req.query.folderPath || 'general';
      const fileName = req.file.filename;
      const originalName = req.file.originalname;
      const fileSize = req.file.size;
      const mimeType = req.file.mimetype;

      // Create relative path for database storage (normalize to forward slashes for URLs)
      const relativePath = path.join(folderPath, fileName).replace(/\\/g, '/');
      
      // Create full URL path for frontend access
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const fileUrl = `${baseUrl}/uploads/${relativePath}`;

      res.status(200).json({
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
      const fullPath = path.join(uploadsDir, filePath.replace(/\//g, path.sep));

      // Debug logging
      console.log('Delete file request:', {
        originalPath: req.params.filePath,
        decodedPath: filePath,
        fullPath: fullPath,
        exists: fs.existsSync(fullPath)
      });

      // Check if file exists
      if (!fs.existsSync(fullPath)) {
        // Try alternative path formats
        const altPath1 = path.join(uploadsDir, filePath);
        const altPath2 = path.join(uploadsDir, ...filePath.split('/'));
        
        console.log('Trying alternative paths:', {
          altPath1: altPath1,
          altPath1Exists: fs.existsSync(altPath1),
          altPath2: altPath2,
          altPath2Exists: fs.existsSync(altPath2)
        });

        if (fs.existsSync(altPath1)) {
          fs.unlinkSync(altPath1);
          return res.status(200).json({
            success: true,
            message: 'File deleted successfully'
          });
        }

        if (fs.existsSync(altPath2)) {
          fs.unlinkSync(altPath2);
          return res.status(200).json({
            success: true,
            message: 'File deleted successfully'
          });
        }

        return res.status(404).json({
          success: false,
          message: 'File not found',
          debug: {
            requestedPath: filePath,
            fullPath: fullPath,
            uploadsDir: uploadsDir
          }
        });
      }

      // Delete file
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
