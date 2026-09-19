# VROOMY — MongoDB-backed hackathon build

## What changed
This version converts the original localStorage/demo data flow into a real web app flow:

Frontend -> Express REST API -> Mongoose -> MongoDB Atlas

Implemented:
- MongoDB Atlas connection
- Mongoose models for users, vehicles, bookings, agreements, reviews and rides
- Registration/login with bcrypt + JWT
- Vehicle listing/search/detail/create/delete
- Rental booking with server-side price calculation and overlap protection
- Demo payment and agreement endpoints
- MongoDB-backed shared rides
- Admin summary APIs
- Existing HTML/CSS UI preserved as much as possible

## Setup

1. Copy `.env.example` to `.env`.
2. Put your MongoDB Atlas URI in `MONGODB_URI`.
3. Set a private `JWT_SECRET`.
4. Optional: add `RESEND_API_KEY` and `TEST_EMAIL` to test email delivery through
   the protected `POST /api/email/test` endpoint. The endpoint sends only to the
   configured test address.
4. In the project root:

```bash
npm install
npm run seed
npm start
```

Open http://localhost:5000

The seed command creates demo vehicles and a demo owner:
- Email: demo.owner@vroomy.local
- Password: Demo@12345

## Important
Do not commit `.env` or share MongoDB/JWT secrets in GitHub.

The rental booking uses the MongoDB ObjectId from the vehicle returned by `/api/vehicles` and the authenticated user's ObjectId from the JWT. This avoids the previous `Valid userId and vehicleId are required` issue caused by local numeric demo IDs.
