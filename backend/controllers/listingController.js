const Listing = require('../models/Listing');

// Helper function to calculate distance in km using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

// @desc    Get all listings (optionally filtered by owner)
// @route   GET /api/listings
// @access  Public
exports.getListings = async (req, res, next) => {
  try {
    let query = {};

    // Filter by owner (e.g., for dashboard)
    if (req.query.owner) {
      query.owner = req.query.owner;
    }

    // Filter by status if requested (default to available for general public)
    if (req.query.status) {
      query.status = req.query.status;
    }

    const listings = await Listing.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single listing
// @route   GET /api/listings/:id
// @access  Public
exports.getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('owner', 'name email phone');

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    res.status(200).json({
      success: true,
      data: listing
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new listing
// @route   POST /api/listings
// @access  Private (Owner only)
exports.createListing = async (req, res, next) => {
  try {
    // Add user to req.body as owner
    req.body.owner = req.user.id;

    // Build GeoJSON location point from latitude and longitude in body
    const { latitude, longitude } = req.body;
    if (latitude !== undefined && longitude !== undefined) {
      req.body.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid latitude and longitude coordinates'
      });
    }

    // Assign default images if none provided
    if (!req.body.images || req.body.images.length === 0) {
      req.body.images = ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'];
    }

    const listing = await Listing.create(req.body);

    res.status(201).json({
      success: true,
      data: listing
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update listing
// @route   PUT /api/listings/:id
// @access  Private (Owner only)
exports.updateListing = async (req, res, next) => {
  try {
    let listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Make sure user is listing owner
    if (listing.owner.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this listing`
      });
    }

    // Update location details if lat/lng are modified
    const { latitude, longitude } = req.body;
    if (latitude !== undefined && longitude !== undefined) {
      req.body.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };
    }

    listing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: listing
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete listing
// @route   DELETE /api/listings/:id
// @access  Private (Owner only)
exports.deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Make sure user is listing owner
    if (listing.owner.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this listing`
      });
    }

    await listing.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search and filter listings
// @route   GET /api/listings/search
// @access  Public
exports.searchListings = async (req, res, next) => {
  try {
    const {
      keyword,
      city,
      locality,
      propertyType,
      minRent,
      maxRent,
      genderPreference,
      foodAvailability,
      furnishing,
      amenities,
      availableDate,
      lat,
      lng,
      radius, // in km, default 5
      sortBy, // 'nearest', 'lowestPrice', 'newest'
      page,
      limit
    } = req.query;

    let query = { status: 'available' };

    // Text keyword search (title, description, address, locality, city)
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { address: { $regex: keyword, $options: 'i' } },
        { locality: { $regex: keyword, $options: 'i' } },
        { city: { $regex: keyword, $options: 'i' } }
      ];
    }

    // Location filters
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }
    if (locality) {
      query.locality = { $regex: locality, $options: 'i' };
    }

    // Property type
    if (propertyType) {
      query.propertyType = propertyType;
    }

    // Budget range
    if (minRent || maxRent) {
      query.rent = {};
      if (minRent) query.rent.$gte = parseInt(minRent);
      if (maxRent) query.rent.$lte = parseInt(maxRent);
    }

    // Gender
    if (genderPreference && genderPreference !== 'any') {
      query.genderPreference = { $in: [genderPreference, 'any'] };
    }

    // Food
    if (foodAvailability) {
      query.foodAvailability = foodAvailability === 'true';
    }

    // Furnishing
    if (furnishing) {
      query.furnishing = furnishing;
    }

    // Amenities
    if (amenities) {
      const amenitiesList = Array.isArray(amenities) ? amenities : amenities.split(',');
      query.amenities = { $all: amenitiesList };
    }

    // Available from date
    if (availableDate) {
      query.availableFrom = { $lte: new Date(availableDate) };
    }

    // Fetch listings matching basic DB criteria
    let listings = await Listing.find(query);

    // Filter by coordinates if provided
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const rad = parseFloat(radius) || 5; // default 5km

    let data = [];

    for (let listing of listings) {
      let distance = null;
      const listingLng = listing.location.coordinates[0];
      const listingLat = listing.location.coordinates[1];

      if (!isNaN(userLat) && !isNaN(userLng)) {
        distance = calculateDistance(userLat, userLng, listingLat, listingLng);
      }

      // Convert mongoose doc to plain object to attach computed distance
      const listingObj = listing.toObject();
      listingObj.distance = distance !== null ? parseFloat(distance.toFixed(2)) : null;

      // Filter out by radius if coordinates and radius are set
      if (!isNaN(userLat) && !isNaN(userLng) && radius) {
        if (distance <= rad) {
          data.push(listingObj);
        }
      } else {
        data.push(listingObj);
      }
    }

    // Sort listings
    if (sortBy === 'nearest' && !isNaN(userLat) && !isNaN(userLng)) {
      data.sort((a, b) => (a.distance || 999999) - (b.distance || 999999));
    } else if (sortBy === 'lowestPrice') {
      data.sort((a, b) => a.rent - b.rent);
    } else {
      // Default to newest
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Pagination
    const pg = parseInt(page) || 1;
    const lm = parseInt(limit) || 10;
    const total = data.length;
    const startIndex = (pg - 1) * lm;
    const paginatedData = data.slice(startIndex, startIndex + lm);

    res.status(200).json({
      success: true,
      count: paginatedData.length,
      total,
      page: pg,
      totalPages: Math.ceil(total / lm),
      data: paginatedData
    });
  } catch (error) {
    next(error);
  }
};
