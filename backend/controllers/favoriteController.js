const Favorite = require('../models/Favorite');
const Listing = require('../models/Listing');

// @desc    Get current user's favorites
// @route   GET /api/favorites
// @access  Private (Seekers / Owners)
exports.getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id }).populate({
      path: 'listing',
      populate: { path: 'owner', select: 'name email phone' }
    });

    // Extract listing detail objects, filtering out any that might have been deleted
    const listings = favorites
      .filter(fav => fav.listing !== null)
      .map(fav => fav.listing);

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a listing to favorites
// @route   POST /api/favorites
// @access  Private (Seekers / Owners)
exports.addFavorite = async (req, res, next) => {
  try {
    const { listingId } = req.body;

    if (!listingId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a listingId'
      });
    }

    // Check if listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Check if already in favorites
    const isAlreadyFavorite = await Favorite.findOne({
      user: req.user.id,
      listing: listingId
    });

    if (isAlreadyFavorite) {
      return res.status(400).json({
        success: false,
        message: 'Listing is already in favorites'
      });
    }

    const favorite = await Favorite.create({
      user: req.user.id,
      listing: listingId
    });

    res.status(201).json({
      success: true,
      data: favorite
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a listing from favorites
// @route   DELETE /api/favorites/:listingId
// @access  Private (Seekers / Owners)
exports.removeFavorite = async (req, res, next) => {
  try {
    const { listingId } = req.params;

    const favorite = await Favorite.findOneAndDelete({
      user: req.user.id,
      listing: listingId
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite entry not found for this listing'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
