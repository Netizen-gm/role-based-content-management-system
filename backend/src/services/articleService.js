const Article = require('../models/Article');

// Get all articles (with optional filters)
const getAllArticles = async (filters = {}) => {
  const query = {};
  
  // If user is not Manager/SuperAdmin, only show published articles
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.author) {
    query.author = filters.author;
  }

  return await Article.find(query)
    .populate('author', 'fullName email profilePhoto')
    .sort({ createdAt: -1 });
};

// Get article by ID
const getArticleById = async (articleId) => {
  return await Article.findById(articleId)
    .populate('author', 'fullName email profilePhoto');
};

// Create new article
const createArticle = async (articleData) => {
  const article = new Article(articleData);
  return await article.save();
};

// Update article
const updateArticle = async (articleId, updateData, userId, userRole) => {
  const article = await Article.findById(articleId);
  
  if (!article) {
    throw new Error('Article not found');
  }

  // Only author, Manager, or SuperAdmin can edit
  const isAuthor = article.author.toString() === userId.toString();
  const canEdit = isAuthor || 
                  userRole.name === 'MANAGER' || 
                  userRole.name === 'SUPERADMIN';

  if (!canEdit) {
    throw new Error('Not authorized to edit this article');
  }

  // If publishing, set publishedAt
  if (updateData.status === 'published' && article.status !== 'published') {
    updateData.publishedAt = new Date();
  }

  // If unpublishing, clear publishedAt
  if (updateData.status === 'unpublished' && article.status === 'published') {
    updateData.publishedAt = null;
  }

  return await Article.findByIdAndUpdate(
    articleId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate('author', 'fullName email profilePhoto');
};

// Delete article
const deleteArticle = async (articleId, userId, userRole) => {
  const article = await Article.findById(articleId);
  
  if (!article) {
    throw new Error('Article not found');
  }

  // Only author, Manager, or SuperAdmin can delete
  const isAuthor = article.author.toString() === userId.toString();
  const canDelete = isAuthor || 
                    userRole.name === 'MANAGER' || 
                    userRole.name === 'SUPERADMIN';

  if (!canDelete) {
    throw new Error('Not authorized to delete this article');
  }

  return await Article.findByIdAndDelete(articleId);
};

// Publish article
const publishArticle = async (articleId) => {
  return await Article.findByIdAndUpdate(
    articleId,
    { 
      $set: { 
        status: 'published',
        publishedAt: new Date(),
      } 
    },
    { new: true, runValidators: true }
  ).populate('author', 'fullName email profilePhoto');
};

// Unpublish article
const unpublishArticle = async (articleId) => {
  return await Article.findByIdAndUpdate(
    articleId,
    { 
      $set: { 
        status: 'unpublished',
        publishedAt: null,
      } 
    },
    { new: true, runValidators: true }
  ).populate('author', 'fullName email profilePhoto');
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
