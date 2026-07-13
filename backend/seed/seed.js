const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Favorite = require('../models/Favorite');

// Load env vars
dotenv.config({ path: './.env' });

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tolethub';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    // Clear existing data
    await User.deleteMany();
    await Listing.deleteMany();
    await Favorite.deleteMany();

    console.log('Database cleared. Seeding fictional users...');

    // Create Owner User
    const owner = await User.create({
      name: 'Rajesh Kumar',
      email: 'owner@tolethub.com',
      password: 'password123', // Will be hashed by User pre-save hook
      role: 'owner',
      phone: '+91 98765 43210'
    });

    // Create Seeker User
    const seeker = await User.create({
      name: 'Amit Sharma',
      email: 'seeker@tolethub.com',
      password: 'password123', // Will be hashed
      role: 'seeker',
      phone: '+91 99999 88888'
    });

    console.log('Fictional users seeded. Seeding listings...');

    const listings = [
      {
        owner: owner._id,
        title: 'Cozy 1BHK Room in Koramangala',
        propertyType: 'Room',
        description: 'A cozy, clean, and well-lit 1BHK single room in a peaceful building. Perfect for students and young working professionals. Close to market, cafes, and bus stop.',
        rent: 12000,
        deposit: 30000,
        address: '24, 5th Block, Near Jyoti Nivas College, Koramangala',
        city: 'Bangalore',
        locality: 'Koramangala',
        location: {
          type: 'Point',
          coordinates: [77.6245, 12.9352] // [longitude, latitude]
        },
        contactName: 'Rajesh Kumar',
        contactPhone: '+91 98765 43210',
        availableFrom: new Date('2026-08-01'),
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
        ],
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        amenities: ['WiFi', 'Geyser', 'Parking', 'CCTV'],
        foodAvailability: false,
        furnishing: 'semi-furnished',
        genderPreference: 'any',
        roomSharingType: 'private',
        status: 'available'
      },
      {
        owner: owner._id,
        title: 'Luxury Boys PG near HSR Layout',
        propertyType: 'PG',
        description: 'Premium PG accommodation for boys near HSR Layout Sector 3. Includes 3 times delicious home-style meals, daily cleaning, high-speed WiFi, and power backup.',
        rent: 8500,
        deposit: 10000,
        address: 'Block-D, Plot 412, Sector 3, HSR Layout',
        city: 'Bangalore',
        locality: 'HSR Layout',
        location: {
          type: 'Point',
          coordinates: [77.6411, 12.9141]
        },
        contactName: 'Rajesh Kumar',
        contactPhone: '+91 98765 43210',
        availableFrom: new Date('2026-07-20'),
        images: [
          'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80'
        ],
        videoUrl: '',
        amenities: ['WiFi', 'Geyser', 'CCTV', 'Power Backup', 'Housekeeping', 'Gym'],
        foodAvailability: true,
        furnishing: 'fully-furnished',
        genderPreference: 'boys',
        roomSharingType: '2-sharing',
        status: 'available'
      },
      {
        owner: owner._id,
        title: 'Elegant 3BHK House in Whitefield',
        propertyType: 'House',
        description: 'Beautiful, spacious 3 BHK apartment with private balcony in a gated society. Has round-the-clock security, modular kitchen, and private parking slots. Ideal for families.',
        rent: 35000,
        deposit: 150000,
        address: '105, Prestige Residency, ECC Road, Whitefield',
        city: 'Bangalore',
        locality: 'Whitefield',
        location: {
          type: 'Point',
          coordinates: [77.7500, 12.9698]
        },
        contactName: 'Rajesh Kumar',
        contactPhone: '+91 98765 43210',
        availableFrom: new Date('2026-09-01'),
        images: [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'
        ],
        videoUrl: '',
        amenities: ['Parking', 'CCTV', 'Power Backup', 'Security', 'AC', 'Elevator'],
        foodAvailability: false,
        furnishing: 'semi-furnished',
        genderPreference: 'any',
        roomSharingType: 'none',
        status: 'available'
      },
      {
        owner: owner._id,
        title: 'Modern Girls PG in Indiranagar',
        propertyType: 'PG',
        description: 'Safe and secure girls-only paying guest house on Indiranagar 100 Feet Road. Fully managed with safety locks, female-only warden, healthy food, and high-speed fiber internet.',
        rent: 9500,
        deposit: 15000,
        address: '67, 12th A Cross, Double Road, Indiranagar',
        city: 'Bangalore',
        locality: 'Indiranagar',
        location: {
          type: 'Point',
          coordinates: [77.6412, 12.9719]
        },
        contactName: 'Sujata Sen (Warden)',
        contactPhone: '+91 98765 88990',
        availableFrom: new Date('2026-07-15'),
        images: [
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80'
        ],
        videoUrl: '',
        amenities: ['WiFi', 'Geyser', 'CCTV', 'Security', 'Housekeeping', 'Washing Machine'],
        foodAvailability: true,
        furnishing: 'fully-furnished',
        genderPreference: 'girls',
        roomSharingType: '3-sharing',
        status: 'available'
      },
      {
        owner: owner._id,
        title: 'Budget Single Room in Koramangala',
        propertyType: 'Room',
        description: 'Unfurnished compact single room for anyone looking for standard budget accommodation. No curfew, direct entry, clean common bathroom. Tenant needs to manage their own bed and utilities.',
        rent: 7000,
        deposit: 15000,
        address: '12B, 1st Block, near Wipro Park, Koramangala',
        city: 'Bangalore',
        locality: 'Koramangala',
        location: {
          type: 'Point',
          coordinates: [77.6310, 12.9300]
        },
        contactName: 'Rajesh Kumar',
        contactPhone: '+91 98765 43210',
        availableFrom: new Date('2026-07-25'),
        images: [
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80'
        ],
        videoUrl: '',
        amenities: ['WiFi', 'Parking'],
        foodAvailability: false,
        furnishing: 'unfurnished',
        genderPreference: 'any',
        roomSharingType: 'private',
        status: 'available'
      },
      {
        owner: owner._id,
        title: 'Furnished 2BHK House in HSR Layout',
        propertyType: 'House',
        description: 'Fully functional semi-furnished 2 BHK independent floor with standard wardrobes, electrical fittings, two bathrooms, and modular setup. Perfect for small families and working couples.',
        rent: 22000,
        deposit: 80000,
        address: '202, Sector 1, HSR Layout, Bangalore',
        city: 'Bangalore',
        locality: 'HSR Layout',
        location: {
          type: 'Point',
          coordinates: [77.6500, 12.9200]
        },
        contactName: 'Rajesh Kumar',
        contactPhone: '+91 98765 43210',
        availableFrom: new Date('2026-08-10'),
        images: [
          'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80'
        ],
        videoUrl: '',
        amenities: ['Parking', 'Geyser', 'CCTV', 'Power Backup'],
        foodAvailability: false,
        furnishing: 'semi-furnished',
        genderPreference: 'any',
        roomSharingType: 'none',
        status: 'available'
      },
      {
        owner: owner._id,
        title: 'Premium Double Sharing Room in MG Road',
        propertyType: 'Room',
        description: 'Fully furnished elegant room available for double sharing in a premium area close to MG Road Metro Station. Perfect location for corporate employees.',
        rent: 11000,
        deposit: 25000,
        address: 'Apartment 3A, Residency Road, near MG Road Metro',
        city: 'Bangalore',
        locality: 'MG Road',
        location: {
          type: 'Point',
          coordinates: [77.6101, 12.9740]
        },
        contactName: 'Rajesh Kumar',
        contactPhone: '+91 98765 43210',
        availableFrom: new Date('2026-08-01'),
        images: [
          'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80'
        ],
        videoUrl: '',
        amenities: ['WiFi', 'Geyser', 'AC', 'CCTV', 'Housekeeping', 'Washing Machine'],
        foodAvailability: false,
        furnishing: 'fully-furnished',
        genderPreference: 'any',
        roomSharingType: '2-sharing',
        status: 'available'
      },
      {
        owner: owner._id,
        title: 'Spacious 4BHK Family House in Whitefield',
        propertyType: 'House',
        description: 'Ultra-luxurious fully furnished 4 BHK villa with private lawn, private study, 4 bathrooms, modular automation, in-house gym equipment, and double parking. Top tier luxury in gated community.',
        rent: 55000,
        deposit: 250000,
        address: 'Villa 12, Prestige Shantiniketan, Whitefield',
        city: 'Bangalore',
        locality: 'Whitefield',
        location: {
          type: 'Point',
          coordinates: [77.7400, 12.9800]
        },
        contactName: 'Rajesh Kumar',
        contactPhone: '+91 98765 43210',
        availableFrom: new Date('2026-08-15'),
        images: [
          'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80'
        ],
        videoUrl: '',
        amenities: ['Parking', 'Geyser', 'AC', 'CCTV', 'Power Backup', 'Security', 'Gym', 'Clubhouse'],
        foodAvailability: false,
        furnishing: 'fully-furnished',
        genderPreference: 'any',
        roomSharingType: 'none',
        status: 'available'
      },
      {
        owner: owner._id,
        title: 'Stanza Living Boys PG in Koramangala',
        propertyType: 'PG',
        description: 'Cozy and spacious single room PG inside a top-rated co-living brand property. Healthy meals served, zero maintenance fees, high speed internet, fully managed by building managers.',
        rent: 14000,
        deposit: 20000,
        address: '88, 4th Block, Koramangala, Bangalore',
        city: 'Bangalore',
        locality: 'Koramangala',
        location: {
          type: 'Point',
          coordinates: [77.6210, 12.9340]
        },
        contactName: 'Manager Rahul',
        contactPhone: '+91 88998 88998',
        availableFrom: new Date('2026-07-20'),
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
        ],
        videoUrl: '',
        amenities: ['WiFi', 'Geyser', 'AC', 'CCTV', 'Housekeeping', 'Power Backup', 'Security'],
        foodAvailability: true,
        furnishing: 'fully-furnished',
        genderPreference: 'boys',
        roomSharingType: 'private',
        status: 'available'
      },
      {
        owner: owner._id,
        title: 'Homely Single Room in Indiranagar',
        propertyType: 'Room',
        description: 'A semi-furnished single room in an independent house on the first floor. Own entry path, separate terrace utility space, very peaceful residential area close to cafes.',
        rent: 9000,
        deposit: 20000,
        address: '10A, 12th Main Road, Indiranagar, Bangalore',
        city: 'Bangalore',
        locality: 'Indiranagar',
        location: {
          type: 'Point',
          coordinates: [77.6380, 12.9700]
        },
        contactName: 'Rajesh Kumar',
        contactPhone: '+91 98765 43210',
        availableFrom: new Date('2026-07-15'),
        images: [
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'
        ],
        videoUrl: '',
        amenities: ['WiFi', 'Geyser', 'Parking'],
        foodAvailability: false,
        furnishing: 'semi-furnished',
        genderPreference: 'any',
        roomSharingType: 'private',
        status: 'available'
      },
      {
        owner: owner._id,
        title: 'Quiet 1BHK House in MG Road',
        propertyType: 'House',
        description: 'Unfurnished compact 1 BHK ground floor house in a traditional residential layout near MG Road Trinity Circle. Safe community, plenty of water supply.',
        rent: 16000,
        deposit: 50000,
        address: '4, Trinity Circle lane, MG Road',
        city: 'Bangalore',
        locality: 'MG Road',
        location: {
          type: 'Point',
          coordinates: [77.6200, 12.9780]
        },
        contactName: 'Rajesh Kumar',
        contactPhone: '+91 98765 43210',
        availableFrom: new Date('2026-07-28'),
        images: [
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'
        ],
        videoUrl: '',
        amenities: ['Parking', 'Security'],
        foodAvailability: false,
        furnishing: 'unfurnished',
        genderPreference: 'any',
        roomSharingType: 'none',
        status: 'available'
      }
    ];

    await Listing.insertMany(listings);
    console.log('11 listings seeded successfully!');

    // Add a default favorite for Seeker
    const sampleListing = await Listing.findOne({ title: 'Cozy 1BHK Room in Koramangala' });
    if (seeker && sampleListing) {
      await Favorite.create({
        user: seeker._id,
        listing: sampleListing._id
      });
      console.log('Seeded initial favorite for Seeker.');
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
