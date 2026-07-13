const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a listing title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  propertyType: {
    type: String,
    required: [true, 'Please select a property type'],
    enum: ['PG', 'Room', 'House']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  rent: {
    type: Number,
    required: [true, 'Please add monthly rent/cost']
  },
  deposit: {
    type: Number,
    required: [true, 'Please add security deposit']
  },
  address: {
    type: String,
    required: [true, 'Please add address']
  },
  city: {
    type: String,
    required: [true, 'Please add city'],
    trim: true
  },
  locality: {
    type: String,
    required: [true, 'Please add locality'],
    trim: true
  },
  location: {
    // GeoJSON Point
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  contactName: {
    type: String,
    required: [true, 'Please add owner or contact name']
  },
  contactPhone: {
    type: String,
    required: [true, 'Please add contact phone number']
  },
  availableFrom: {
    type: Date,
    required: [true, 'Please select availability start date']
  },
  images: {
    type: [String],
    default: []
  },
  videoUrl: {
    type: String,
    trim: true
  },
  amenities: {
    type: [String],
    default: []
  },
  foodAvailability: {
    type: Boolean,
    default: false
  },
  furnishing: {
    type: String,
    required: true,
    enum: ['unfurnished', 'semi-furnished', 'fully-furnished'],
    default: 'unfurnished'
  },
  genderPreference: {
    type: String,
    required: true,
    enum: ['boys', 'girls', 'any'],
    default: 'any'
  },
  roomSharingType: {
    type: String,
    required: true,
    enum: ['private', '2-sharing', '3-sharing', '4+-sharing', 'none'],
    default: 'none'
  },
  status: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available'
  }
}, {
  timestamps: true
});

// GeoJSON index for proximity distance calculation
ListingSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Listing', ListingSchema);
