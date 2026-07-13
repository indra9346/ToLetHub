const express = require('express');
const {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  searchListings
} = require('../controllers/listingController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/search', searchListings);

router
  .route('/')
  .get(getListings)
  .post(protect, authorize('owner'), createListing);

router
  .route('/:id')
  .get(getListing)
  .put(protect, authorize('owner'), updateListing)
  .delete(protect, authorize('owner'), deleteListing);

module.exports = router;
