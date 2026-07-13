const Listing = require('../models/Listing');
const Favorite = require('../models/Favorite');
const aiChatService = require('../services/aiChatService');

// Helper function to extract filters using regex from free text queries
const extractFilters = (text) => {
  const filters = {};
  const lowerText = text.toLowerCase();

  // 1. Detect Property Type
  if (lowerText.includes('pg') || lowerText.includes('paying guest')) {
    filters.propertyType = 'PG';
  } else if (lowerText.includes('room') || lowerText.includes('single room') || lowerText.includes('flatmate')) {
    filters.propertyType = 'Room';
  } else if (lowerText.includes('house') || lowerText.includes('flat') || lowerText.includes('apartment') || lowerText.includes('villa')) {
    filters.propertyType = 'House';
  }

  // 2. Detect Rent Budget
  // Matches "under 10000", "below ₹12,000", "under 8k", "max 15000", "budget 20000", "below 15k"
  const budgetRegexes = [
    /under\s*(?:rs\.?|₹)?\s*(\d+(?:,\d+)*)/i,
    /below\s*(?:rs\.?|₹)?\s*(\d+(?:,\d+)*)/i,
    /less\s*than\s*(?:rs\.?|₹)?\s*(\d+(?:,\d+)*)/i,
    /max(?:imum)?\s*(?:rs\.?|₹)?\s*(\d+(?:,\d+)*)/i,
    /budget\s*(?:of)?\s*(?:rs\.?|₹)?\s*(\d+(?:,\d+)*)/i
  ];

  for (const regex of budgetRegexes) {
    const match = lowerText.match(regex);
    if (match) {
      const value = match[1].replace(/,/g, '');
      filters.maxRent = parseInt(value, 10);
      break;
    }
  }

  // Detect "k" notations, e.g. "10k", "15k", "8.5k"
  const kRegex = /(\d+(?:\.\d+)?)\s*k\b/i;
  const kMatch = lowerText.match(kRegex);
  if (kMatch && !filters.maxRent) {
    filters.maxRent = parseFloat(kMatch[1]) * 1000;
  }

  // 3. Detect Locality/City
  // Matches "in Koramangala", "at Andheri", "in Mumbai", "near Indiranagar"
  const locationRegex = /(?:in|at|near|around)\s+([a-zA-Z\s]{3,20})/i;
  const locationMatch = lowerText.match(locationRegex);
  if (locationMatch) {
    const loc = locationMatch[1].trim();
    // Exclude words that could be mistaken as location (e.g. pg, room, house)
    const exclusions = ['pg', 'room', 'house', 'flat', 'apartment', 'rent', 'budget', 'boys', 'girls', 'any', 'food'];
    if (!exclusions.includes(loc.toLowerCase())) {
      filters.locality = loc;
    }
  }

  // 4. Gender preference
  if (lowerText.includes('boys') || lowerText.includes('men') || lowerText.includes('male') || lowerText.includes('boy')) {
    filters.genderPreference = 'boys';
  } else if (lowerText.includes('girls') || lowerText.includes('women') || lowerText.includes('female') || lowerText.includes('girl')) {
    filters.genderPreference = 'girls';
  }

  // 5. Food
  if (lowerText.includes('food') || lowerText.includes('meal') || lowerText.includes('mess') || lowerText.includes('breakfast') || lowerText.includes('dinner')) {
    filters.foodAvailability = true;
  }

  // 6. Furnishing
  if (lowerText.includes('fully furnished') || lowerText.includes('fully-furnished')) {
    filters.furnishing = 'fully-furnished';
  } else if (lowerText.includes('semi furnished') || lowerText.includes('semi-furnished') || lowerText.includes('furnished')) {
    filters.furnishing = 'semi-furnished';
  } else if (lowerText.includes('unfurnished')) {
    filters.furnishing = 'unfurnished';
  }

  return filters;
};

// Helper function to build MongoDB query from extracted filters
const buildMongoQuery = (filters) => {
  const query = { status: 'available' };

  if (filters.propertyType) {
    query.propertyType = filters.propertyType;
  }

  if (filters.maxRent) {
    query.rent = { $lte: filters.maxRent };
  }

  if (filters.locality) {
    query.$or = [
      { city: { $regex: filters.locality, $options: 'i' } },
      { locality: { $regex: filters.locality, $options: 'i' } }
    ];
  }

  if (filters.genderPreference) {
    query.genderPreference = { $in: [filters.genderPreference, 'any'] };
  }

  if (filters.foodAvailability !== undefined) {
    query.foodAvailability = filters.foodAvailability;
  }

  if (filters.furnishing) {
    query.furnishing = filters.furnishing;
  }

  return query;
};

// @desc    Process chatbot message
// @route   POST /api/chat
// @access  Public (Optional auth for personalization)
exports.processChatMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    const isUserLoggedIn = !!req.user;
    const lowerMessage = message.toLowerCase();

    // Context objects to feed to the AI model
    const contextData = {
      listings: [],
      favorites: [],
      extractedFilters: {}
    };

    // 1. Detect Intent
    let intent = 'unsupported';
    
    if (lowerMessage.includes('favorite') || lowerMessage.includes('wishlist') || lowerMessage.includes('save') || lowerMessage.includes('compare')) {
      intent = 'compare_favorites';
    } else if (lowerMessage.includes('list') || lowerMessage.includes('owner') || lowerMessage.includes('how do i list') || lowerMessage.includes('add listing')) {
      intent = 'owner_help';
    } else if (lowerMessage.includes('filter') || lowerMessage.includes('search') || lowerMessage.includes('find') || lowerMessage.includes('pg') || lowerMessage.includes('room') || lowerMessage.includes('house') || lowerMessage.includes('flat') || lowerMessage.includes('near me')) {
      intent = 'find_property';
    } else if (lowerMessage.includes('amenit') || lowerMessage.includes('contact') || lowerMessage.includes('direction') || lowerMessage.includes('rent') || lowerMessage.includes('price')) {
      intent = 'general_platform_help';
    }

    // 2. Intent Action Resolution
    if (intent === 'compare_favorites') {
      // Auth check
      if (!isUserLoggedIn) {
        return res.status(200).json({
          success: true,
          text: 'To view and compare your favorite properties, please log in or register. Once logged in, you can add listings to your favorites and compare their rent, amenities, furnishing status, and food options side-by-side!',
          listings: [],
          suggestions: ['Log In / Register', 'Find PGs near me under ₹10,000']
        });
      }

      // Fetch user favorites
      const favorites = await Favorite.find({ user: req.user.id }).populate('listing');
      contextData.favorites = favorites.filter(fav => fav.listing !== null).map(fav => fav.listing);
    } 
    
    if (intent === 'find_property') {
      // Extract filters and execute MongoDB query
      const filters = extractFilters(message);
      contextData.extractedFilters = filters;
      
      const mongoQuery = buildMongoQuery(filters);
      // Retrieve up to 5 properties to give AI context (it will trim to 3 for final user display)
      contextData.listings = await Listing.find(mongoQuery).limit(5);
    }

    // 3. Delegate to AI service / fallback router
    const result = await aiChatService.getChatResponse(message, contextData, isUserLoggedIn);

    // Sanitize message block to remove any potential raw script tags or HTML
    if (result.text) {
      result.text = result.text.replace(/<[^>]*>/g, ''); // strip HTML tags
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
