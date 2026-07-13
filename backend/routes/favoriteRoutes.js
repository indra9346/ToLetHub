const express = require('express');
const { getFavorites, addFavorite, removeFavorite } = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All favorites routes require authentication

router.route('/')
  .get(getFavorites)
  .post(addFavorite);

router.route('/:listingId')
  .delete(removeFavorite);

module.exports = router;
