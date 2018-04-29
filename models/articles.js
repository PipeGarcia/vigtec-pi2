const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

const ArticleSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  keywords: {
    type: Array,
    required: true
  }
});

const Article = module.exports = mongoose.model('Article', ArticleSchema);

module.exports.addArticle = function(article, callback) {
  article.save(callback);
}

module.exports.getArticles = function(word, callback) {
  const query = {keywords: {$all:word}}
  Article.find(query, callback);
}

