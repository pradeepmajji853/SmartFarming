# SmartFarming Backend

This is the backend API for the SmartFarming application, providing data and services for the React frontend.

## Technology Stack

- Node.js
- Express.js
- MongoDB (mongoose ORM)
- JWT authentication
- RESTful API architecture

## Setup Instructions

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment variables**

Make sure the `.env` file exists in the root directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smartfarming
JWT_SECRET=smartfarmingsecuretoken2025
NODE_ENV=development
WEATHER_API_KEY=412d88c93a1fe047a25f5d909593d5ee
```

3. **Seed the database with initial data**

```bash
# Seed all data (users, crops, and market prices)
npm run seed:all

# Or seed specific collections
npm run seed:users
npm run seed:crops
npm run seed:market
```

4. **Start the server**

For development with auto-reload:
```bash
npm run dev
```

For production:
```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updateprofile` - Update user profile

### Weather

- `GET /api/weather/current/:location` - Get current weather for location
- `GET /api/weather/forecast/:location/:days` - Get forecast for location
- `GET /api/weather/advice/:location/:crop` - Get farming advice based on weather

### Crops

- `GET /api/crops` - Get all crops
- `GET /api/crops/:id` - Get specific crop
- `POST /api/crops` - Create new crop (admin only)
- `PUT /api/crops/:id` - Update crop (admin only)
- `DELETE /api/crops/:id` - Delete crop (admin only)
- `GET /api/crops/recommend` - Get crop recommendations based on conditions

### Pests

- `GET /api/pests` - Get all pests
- `GET /api/pests/:id` - Get specific pest
- `POST /api/pests` - Create new pest (admin only)
- `PUT /api/pests/:id` - Update pest (admin only)
- `DELETE /api/pests/:id` - Delete pest (admin only)
- `GET /api/pests/crop/:cropId` - Get pests affecting a specific crop
- `GET /api/pests/:id/treatments` - Get treatment recommendations for a pest
- `POST /api/pests/identify` - Upload image for pest identification

### Market

- `GET /api/market` - Get all market prices (with optional filters)
- `GET /api/market/trends/:crop` - Get market price trends for a specific crop
- `POST /api/market` - Add a new market price
- `GET /api/market/compare` - Compare market prices between different locations

### Marketplace

- `GET /api/marketplace` - Get all product listings (with optional filters)
- `POST /api/marketplace` - Create new listing
- `GET /api/marketplace/my-listings` - Get listings by current user
- `GET /api/marketplace/:id` - Get specific listing
- `PUT /api/marketplace/:id` - Update listing
- `DELETE /api/marketplace/:id` - Delete listing
- `POST /api/marketplace/:id/offers` - Make an offer on a product listing
- `GET /api/marketplace/:id/offers` - Get all offers for a listing
- `GET /api/marketplace/my-offers` - Get offers made by current user
- `PUT /api/marketplace/offers/:id/respond` - Respond to an offer

### Expert Consultation

- `GET /api/expert` - Get all experts
- `GET /api/expert/:id` - Get expert details
- `POST /api/expert/consultation` - Request a consultation
- `GET /api/expert/consultation` - Get user consultations
- `GET /api/expert/consultation/:id` - Get consultation details
- `PUT /api/expert/consultation/:id/status` - Update consultation status
- `POST /api/expert/consultation/:id/message` - Send message in consultation
- `POST /api/expert/consultation/:id/review` - Rate and review consultation

### Analytics

- `GET /api/analytics/productivity` - Get farm productivity analytics
- `GET /api/analytics/crops/:cropId` - Get crop performance analytics
- `GET /api/analytics/weather-impact` - Get weather impact analytics
- `GET /api/analytics/pests` - Get pest occurrence analysis
- `GET /api/analytics/financial` - Get financial analytics
- `POST /api/analytics/farm-data` - Submit farm data for analytics

## Authentication

All routes except for `/api/auth/register` and `/api/auth/login` require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Test Users

After seeding the database, the following test users will be available:

- Farmer: farmer@example.com / password123
- Expert: expert@example.com / password123
- Admin: admin@example.com / password123

## Running with the Frontend

To run the complete SmartFarming application:

1. Start the backend server (`npm run dev` from the server directory)
2. Start the React frontend (`npm start` from the client directory)
3. Access the application at `http://localhost:3000`