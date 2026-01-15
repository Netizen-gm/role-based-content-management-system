const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const articleController = require('../controllers/articleController');
const { authenticate } = require('../middleware/auth');
const { requirePermission, requireRoleOrPermission } = require('../middleware/permissions');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for article image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'article-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Validation rules
const articleValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters'),
  body('body')
    .trim()
    .notEmpty()
    .withMessage('Body is required')
    .isLength({ min: 10 })
    .withMessage('Body must be at least 10 characters'),
  body('status')
    .optional()
    .isIn(['published', 'unpublished'])
    .withMessage('Status must be either published or unpublished'),
];

// All routes require authentication
router.use(authenticate);

// Get all articles (SuperAdmin, Manager, or view permission required)
router.get('/', requireRoleOrPermission(['SUPERADMIN', 'MANAGER'], ['view']), articleController.getAllArticles);

// Publish article (SuperAdmin, Manager, or publish permission required) - specific routes before parameterized routes
router.patch('/:id/publish', requireRoleOrPermission(['SUPERADMIN', 'MANAGER'], ['publish']), articleController.publishArticle);

// Unpublish article (SuperAdmin, Manager, or publish permission required)
router.patch('/:id/unpublish', requireRoleOrPermission(['SUPERADMIN', 'MANAGER'], ['publish']), articleController.unpublishArticle);

// Get article by ID (SuperAdmin, Manager, or view permission required)
router.get('/:id', requireRoleOrPermission(['SUPERADMIN', 'MANAGER'], ['view']), articleController.getArticleById);

// Create article (SuperAdmin, Manager, or create permission required)
router.post(
  '/',
  requireRoleOrPermission(['SUPERADMIN', 'MANAGER'], ['create']),
  upload.single('image'),
  articleValidation,
  articleController.createArticle
);

// Update article (SuperAdmin, Manager, or edit permission required)
router.put(
  '/:id',
  requireRoleOrPermission(['SUPERADMIN', 'MANAGER'], ['edit']),
  upload.single('image'),
  articleValidation,
  articleController.updateArticle
);

// Delete article (SuperAdmin, Manager, or delete permission required)
router.delete('/:id', requireRoleOrPermission(['SUPERADMIN', 'MANAGER'], ['delete']), articleController.deleteArticle);

module.exports = router;
