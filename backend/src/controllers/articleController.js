const articleService = require('../services/articleService');
const { validationResult } = require('express-validator');

// Get all articles
const getAllArticles = async (req, res) => {
  try {
    const filters = {};
    
    // If user is Viewer, only show published articles
    if (req.user.role.name === 'VIEWER') {
      filters.status = 'published';
    }
    
    // Allow filtering by status for Manager/SuperAdmin
    if (req.query.status && 
        (req.user.role.name === 'MANAGER' || req.user.role.name === 'SUPERADMIN')) {
      filters.status = req.query.status;
    }

    // Allow filtering by author
    if (req.query.author) {
      filters.author = req.query.author;
    }

    const articles = await articleService.getAllArticles(filters);
    res.json({
      success: true,
      data: { articles },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch articles',
      error: error.message,
    });
  }
};

// Get article by ID
const getArticleById = async (req, res) => {
  try {
    const article = await articleService.getArticleById(req.params.id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    // Viewer can only see published articles
    if (req.user.role.name === 'VIEWER' && article.status !== 'published') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Article is not published',
      });
    }

    res.json({
      success: true,
      data: { article },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch article',
      error: error.message,
    });
  }
};

// Create new article
const createArticle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array(),
      });
    }

    const articleData = {
      title: req.body.title,
      body: req.body.body,
      author: req.user._id,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      status: req.body.status || 'unpublished',
    };

    const article = await articleService.createArticle(articleData);
    await article.populate('author', 'fullName email profilePhoto');

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: { article },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create article',
      error: error.message,
    });
  }
};

// Update article
const updateArticle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array(),
      });
    }

    const updateData = {
      ...req.body,
    };

    // If new image uploaded, update image path
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const article = await articleService.updateArticle(
      req.params.id,
      updateData,
      req.user._id,
      req.user.role
    );

    res.json({
      success: true,
      message: 'Article updated successfully',
      data: { article },
    });
  } catch (error) {
    if (error.message === 'Article not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message.includes('Not authorized')) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update article',
      error: error.message,
    });
  }
};

// Delete article
const deleteArticle = async (req, res) => {
  try {
    await articleService.deleteArticle(
      req.params.id,
      req.user._id,
      req.user.role
    );

    res.json({
      success: true,
      message: 'Article deleted successfully',
    });
  } catch (error) {
    if (error.message === 'Article not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message.includes('Not authorized')) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to delete article',
      error: error.message,
    });
  }
};

// Publish article
const publishArticle = async (req, res) => {
  try {
    const article = await articleService.publishArticle(req.params.id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    res.json({
      success: true,
      message: 'Article published successfully',
      data: { article },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to publish article',
      error: error.message,
    });
  }
};

// Unpublish article
const unpublishArticle = async (req, res) => {
  try {
    const article = await articleService.unpublishArticle(req.params.id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    res.json({
      success: true,
      message: 'Article unpublished successfully',
      data: { article },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to unpublish article',
      error: error.message,
    });
  }
};

module.exports = {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  publishArticle,
  unpublishArticle,
};
