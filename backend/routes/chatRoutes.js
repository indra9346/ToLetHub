const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { processChatMessage } = require('../controllers/chatController');
const chatRateLimiter = require('../middleware/rateLimitMiddleware');
const validateChatInput = require('../middleware/validateChatInput');

const router = express.Router();

// Optional JWT authentication middleware for personalized chatbot contexts
const optionalProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'tolethub_jwt_secret_key_2026_production_grade'
    );
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    // Proceed without throwing unauthorized, treating request as unauthenticated
    next();
  }
};

router.post(
  '/',
  chatRateLimiter,       // Limit requests to prevent API overload
  validateChatInput,     // Validate message lengths & format
  optionalProtect,       // Populate req.user if logged in
  processChatMessage     // Execute intent handler
);

module.exports = router;
