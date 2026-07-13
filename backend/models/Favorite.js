const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  }
}, {
  timestamps: true
});

// Ensure a user can only favorite a listing once
FavoriteSchema.index({ user: 1, listing: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);
