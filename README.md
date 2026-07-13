# ToLetHub — AI-Powered Rental & PG Discovery Platform

ToLetHub is a premium, full-stack rental discovery platform designed to connect seekers with verified PGs, rooms, and houses across India directly, bypassing third-party broker platforms and fees.

---

## ⚠️ Problem Statement
Finding rental accommodation in major Indian cities is often a highly stressful, manual chore. Seekers are forced to spend days walking door-to-door, speaking with local brokers, paying steep brokerage fees, and dealing with fragmented listings. Property owners also struggle to list their properties dynamically and manage occupants without relying on third-party broker platforms.

ToLetHub solves this by providing a unified portal where owners can list, toggle availability, and manage properties, while seekers can search, filter, and compare rentals, view interactive spatial maps, and consult an AI assistant.

> [!NOTE]
> **Fictional Data Disclaimer**: All property listings, addresses, coordinates, phone numbers, email addresses, and owner details utilized in this codebase are strictly fictional demo data generated for testing and demonstration purposes.

---

## 🌟 Feature List

* **Failsafe Splash Screen**: A beautiful midnight opening screen drawing a house outline using SVG vectors and scaling a gold-glowing ToLetHub logo. Automatically fades away after 2.5s using failsafe pure-CSS fallback animations.
* **Cinematic Hero Video**: Plays a high-quality looping sunset city skyline background video (`hero-bg-1.mp4`) muted and playsinline. Features particle elements and dark read overlays.
* **User Authentication**: Register/login as either `seeker` or `owner` with role selection. State persists after browser refreshes using LocalStorage. Password hashes are saved securely via `bcryptjs`.
* **Faceted Seeker Filtering**: Filter listings by budget (rent range), property category (PG, Room, House), gender preference, food inclusion, furnishing status, amenities checklist, and available date.
* **Proximity Distance Calculations**: Requests browser location coordinates. Calculates and displays the distance in kilometers from the user to the property. Automatically falls back to city/locality text filters if location access is denied.
* **Leaflet Maps Integration**: Renders stays on an interactive map. Clicking map markers launches location popups. Features a **"Get Directions"** button redirecting the user to Google Maps directions routing in a new tab.
* **Card-Map Highlight Sync**: Hovering over any result card on the Explore page automatically triggers the Leaflet Map popup marker for that property, synchronizing list and map states.
* **Comparison Matrix**: Seekers can add up to 3 stays to their favorites list and compare their pricing, amenities, furnishing, food, and distance side-by-side. Dynamically highlights the best value stays (lowest rent cost and nearest distance).
* **Owner 4-Step Wizard Form**: Guides landlords step-by-step to input details (Basic Info ➔ Pricing ➔ Amenities/Media ➔ Location/Confirm) with validation locks and a local draft autosave feature.
* **AI Chat Assistant Widget**: A floating chatbot widget visible across all public pages. Supports Gemini-powered contextual searches, suggested chips, typing states, and clear conversation triggers.

---

## 💻 Tech Stack
* **Frontend**: Angular 18+ (Standalone component architecture, Signals for state management, Reactive Forms validation, Route Guards, and HTTP JWT Interceptors).
* **Styling**: Vanilla SCSS featuring custom midnight-navy color system, glassmorphism cards, micro-animations, and skeleton loading templates.
* **Map Integration**: Interactive maps using **Leaflet.js** (via OpenStreetMap tiles, requiring no paid API keys).
* **Backend**: Node.js + Express (CORS, JWT middleware, rate-limiting protection, request schema validation, and centralized error handling).
* **Database**: MongoDB with Mongoose object modeling. Listing schemas use a `2dsphere` spatial coordinates index supporting Haversine distance offset sorting.
* **AI Assistant**: Google Gemini API integration (`gemini-1.5-flash`) executing server-side intent analysis, MongoDB context injection, and rule-based mock fallbacks.

---

## 📐 Architecture Overview
The application follows a clean three-tier system:
```
[ Angular Standalone App ] <---> [ Express API Backend ] <---> [ MongoDB (Mongoose) ]
                                            |
                                            v
                                     [ Gemini API ]
```
The chatbot uses a **data-aware orchestration pattern**:
1. User types query (e.g. *"find PGs in Koramangala under 10000"*).
2. Backend middleware checks rate-limiting and validates input size.
3. Backend controller parses filters and pre-queries MongoDB.
4. Matching results (up to 5) are injected into the Gemini prompt as context.
5. Gemini structures a concise response based on the MongoDB "source of truth".
6. JSON returns the reply text, matching database cards, and suggested prompts to the client.

---

## 📂 Folder Structure
```
tolethub/
├── backend/
│   ├── config/
│   │   └── db.js                 # Mongoose connection
│   ├── controllers/
│   │   ├── authController.js     # Register / Login / Me handlers
│   │   ├── listingController.js  # CRUD & search filters
│   │   ├── favoriteController.js # Wishlist toggling
│   │   └── chatController.js     # Chatbot intent matching
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT & role validations
│   │   ├── errorMiddleware.js    # Global JSON errors
│   │   ├── rateLimitMiddleware.js # Chat limit protection
│   │   └── validateChatInput.js  # Message payload checking
│   ├── models/
│   │   ├── User.js               # User Schema (hashing, roles)
│   │   ├── Listing.js            # Listing Schema (2dsphere index)
│   │   └── Favorite.js           # Favorite Schema (compound index)
│   ├── routes/
│   │   ├── authRoutes.js         # Auth routes
│   │   ├── listingRoutes.js      # Listings CRUD routes
│   │   ├── favoriteRoutes.js     # Favorites routes
│   │   └── chatRoutes.js         # Chatbot route
│   ├── seed/
│   │   └── seed.js               # Database seeder (11 listings)
│   ├── services/
│   │   └── aiChatService.js      # Gemini / Mock orchestrator
│   ├── .env.example              # Env template
│   └── server.js                 # Entry point
├── frontend/
│   ├── public/                   # Static assets
│   │   ├── assets/
│   │   │   ├── branding/         # Logos & favicons
│   │   │   └── videos/           # Hero background video
│   │   ├── _redirects            # SPA rewrites for Netlify
│   │   ├── robots.txt            # Crawler controls
│   │   └── sitemap.xml           # XML Sitemap
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/       # Navbar, Footer, Chatbot
│   │   │   ├── pages/            # Home, Explore, Details, Favorites, Dashboard, Forms
│   │   │   ├── services/         # API & Geolocation services
│   │   │   ├── guards/           # Auth and Role guards
│   │   │   ├── interceptors/     # JWT HTTP headers injection
│   │   │   ├── models/           # TS Interfaces
│   │   │   ├── app.config.ts     # Bootstrapping settings
│   │   │   └── app.routes.ts     # Application routing
│   │   ├── index.html            # Core layout with SEO tags
│   │   └── styles.scss           # Design system tokens & global SCSS
│   ├── proxy.conf.json           # Dev reverse proxy
│   ├── vercel.json               # SPA rewrites for Vercel
│   ├── angular.json              # Angular CLI budget & build options
│   └── package.json              # Frontend scripts & dependencies
└── README.md                     # Documentation
```

---

## 🚀 Local Setup Instructions

### 1. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create your `.env` configuration file:
   ```bash
   cp .env.example .env
   ```
3. Set your environment variables in `.env` (refer to [Environment Variables](#-environment-variables) below).
4. Install dependencies:
   ```bash
   npm install
   ```
5. Seed the database with fictional listings:
   ```bash
   npm run seed
   ```
6. Start the Express server:
   ```bash
   npm start
   ```
   *(Server starts on http://localhost:3000)*

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install Angular packages and dependencies:
   ```bash
   npm install
   ```
3. Run the development build:
   ```bash
   npm start
   ```
   *(Runs on http://localhost:4200. Automatically proxies API requests from `/api` to port `3000`)*

---

## 📝 Environment Variables

### Backend `.env` Options
Create a `backend/.env` file with:
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/tolethub
JWT_SECRET=tolethub_jwt_secret_key_2026_production_grade
JWT_EXPIRES_IN=7d

# Gemini API Key. Leave empty to activate Mock Fallback Mode
AI_PROVIDER_API_KEY=

# Allowed CORS client URL for production deployment
FRONTEND_URL=http://localhost:4200
```

### Frontend Environment Setup
Development configurations are mapped inside `frontend/src/environments/environment.ts` and swapped dynamically during production compilation using `environment.prod.ts`. 

Swap `https://tolethub-api.onrender.com/api` inside `frontend/src/environments/environment.prod.ts` with your actual deployed backend base URL.

---

## 📜 API Endpoint Summary

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register a new user (`seeker` or `owner`) | No |
| **POST** | `/api/auth/login` | Authenticate credentials and return JWT token | No |
| **GET** | `/api/auth/me` | Fetch active user data from token header | Yes |
| **GET** | `/api/listings` | Fetch property listings (owner filter optional) | No |
| **GET** | `/api/listings/search` | Search stays using faceted filters & radius parameters | No |
| **GET** | `/api/listings/:id` | Fetch detailed page info for a single listing | No |
| **POST** | `/api/listings` | Create a new listing stay | Yes (Owner only) |
| **PUT** | `/api/listings/:id` | Update listing stays parameters | Yes (Owner only) |
| **DELETE** | `/api/listings/:id` | Permanently delete listing stays | Yes (Owner only) |
| **GET** | `/api/favorites` | Fetch user's bookmarked stays | Yes (Seeker only) |
| **POST** | `/api/favorites` | Toggle bookmark status for a stay | Yes (Seeker only) |
| **POST** | `/api/chat` | Send message query to AI Chat Assistant | No |

---

## 🌐 Production Deployment Guide

Follow this guide to deploy the project online for public testing.

### 1. Database Configuration (MongoDB Atlas)
1. Register/Login to a free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Shared M0 Cluster. Select your provider/region.
3. Under **Database Access**, create a user with read/write access. Record the password.
4. Under **Network Access**, whitelist connection IP addresses (use `0.0.0.0/0` to allow serverless hosts like Render to connect).
5. In your cluster dashboard, click **Connect** ➔ **Drivers** to fetch your MongoDB URI string (looks like `mongodb+srv://<username>:<password>@cluster.mongodb.net/tolethub`).

### 2. Backend Deployment (Render or Railway)
1. Create a free account on [Render](https://render.com). Select **New Web Service**.
2. Connect your GitHub repository and point to the `backend/` directory.
3. Configure settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add the following **Environment Variables** in the Web Service dashboard:
   - `PORT`: `3000`
   - `MONGODB_URI`: *[Your MongoDB Atlas URI string]*
   - `JWT_SECRET`: *[A custom secret password phrase]*
   - `JWT_EXPIRES_IN`: `7d`
   - `FRONTEND_URL`: *[Your deployed frontend URL e.g. https://tolethub.vercel.app]*
   - `AI_PROVIDER_API_KEY`: *[Optional Gemini API Key. If empty, Mock mode will run]*

### 3. Frontend Deployment (Vercel or Netlify)
1. Update `frontend/src/environments/environment.prod.ts` with your deployed Render backend domain URL (e.g. `https://tolethub-backend.onrender.com/api`).
2. Create a free account on [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
3. Import your GitHub repository and point to the `frontend/` directory.
4. Configure settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/frontend/browser`
5. Deploy.
6. Copy the deployed URL and update the backend Web Service `FRONTEND_URL` environment variable to link CORS validation.

---

## 🤖 AI Tools & Manual Review Disclosures

### AI Tools Used
* **Antigravity / Gemini 3.5**: Utilized for architecture layout, code structure boilerplate, stylesheet systems, and automated QA.

### Where AI Helped
* **Boilerplate**: Created Mongoose model files and Angular standalone templates.
* **UI Ideation**: Assisted in defining glassmorphism CSS properties, shadows, sunset color systems, and shimmer styles.
* **Debugging**: Resolved Esbuild compilation bugs regarding style budget configurations in `angular.json` and nested template properties.
* **Documentation**: Synthesized schema models into comprehensive markdown README files.

### What I Personally Implemented / Reviewed
* **Design Redesigns**: Built custom failsafe session-based splash overlay animations, interactive search bar filters routing, and best-value highlight matrices.
* **CORS Security**: Customized Express CORS whitelist validations to allow local development hosts alongside production domains.
* **Environment Swaps**: Created Angular environment files and configured CLI builder targets file replacements.
* **Autoplay Failsafes**: Configured Angular programmatic video autoplay triggers to bypass strict mobile browser restrictions on page reload.
* **SPA Routing**: Added `vercel.json` and Netlify redirects (`_redirects`) to prevent 404 errors on direct path refreshes.

---

## 💥 Challenges Faced
* **SPA Redirections**: Static hosts return 404 errors on direct routing requests. Resolved by mapping root fallback redirects targeting `index.html`.
* **Angular Component Style Budgets**: Standard limits throw errors if component SCSS styling sheets grow large. Overrode limits inside `angular.json` build targets.

---

## 🎨 Asset Attributions
* **Hero Background Video**: Looping cityscape night sunset sunset sunset skyline downloaded from [Pixabay](https://pixabay.com/videos/city-night-street-lights-171365/). License: Free for commercial and non-commercial use, no attribution required.
