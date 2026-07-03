# FreshFarm - Project Setup & Getting Started Guide

## Quick Start Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your credentials:
# - MongoDB Atlas connection string
# - JWT Secret
# - Stripe/Razorpay keys
# - AWS S3 credentials
# - Email configuration

# Start development server
npm run dev
```

**Backend will run at:** `http://localhost:5000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

**Frontend will open at:** `http://localhost:3000`

### 3. MongoDB Atlas Setup

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create database user with read/write permissions
4. Get connection string
5. Add it to your `.env` file

### 4. Payment Gateway Setup

**For Stripe:**
1. Create account at [Stripe](https://stripe.com)
2. Get API keys from Dashboard
3. Add to `.env`: `STRIPE_SECRET_KEY` and `STRIPE_PUBLIC_KEY`

**For Razorpay (India):**
1. Create account at [Razorpay](https://razorpay.com)
2. Get API keys
3. Add to `.env`: `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`

### 5. AWS S3 Setup

1. Create AWS account at [AWS](https://aws.amazon.com)
2. Create S3 bucket
3. Create IAM user with S3 permissions
4. Add credentials to `.env`:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_S3_BUCKET`

## Project Features Implemented

### ✅ Completed

#### Backend
- ✅ Express server setup with middleware
- ✅ MongoDB connection and configuration
- ✅ User authentication and JWT
- ✅ User, Farmer, Consumer, DeliveryPartner models
- ✅ Product model with full schema
- ✅ Order model with tracking
- ✅ Payment model
- ✅ Review/Rating model
- ✅ Database indexes for performance
- ✅ Error handling middleware
- ✅ CORS configuration
- ✅ Authentication routes

#### Frontend
- ✅ React app with React Router
- ✅ Redux state management
- ✅ Tailwind CSS styling
- ✅ Custom color palette (Zepto/Zomato inspired)
- ✅ Home page with hero section
- ✅ Navigation bar with responsive design
- ✅ Footer with links
- ✅ Authentication pages (Login, Register)
- ✅ Role-based dashboards:
  - Consumer Dashboard with stats
  - Farmer Dashboard with analytics
  - Delivery Partner Dashboard
  - Admin Dashboard with charts (Line, Bar, Pie)
- ✅ Products page
- ✅ Cart page
- ✅ Order tracking page
- ✅ 404 page handling

#### Documentation
- ✅ Software Requirements Specification (SRS)
- ✅ Data Flow Diagrams (DFD Level 0, 1, 2, 3)
- ✅ Complete Database Schema with relationships
- ✅ ER Diagram
- ✅ MongoDB indexes configuration
- ✅ README with project overview

#### Version Control
- ✅ Git initialized
- ✅ .gitignore created

### 🚧 Ready to Implement

#### API Controllers & Routes
- [ ] Product CRUD operations
- [ ] Order creation and management
- [ ] Order tracking
- [ ] Payment processing
- [ ] User profile management
- [ ] Analytics endpoints

#### Features to Add
- [ ] Real-time notifications (Socket.io)
- [ ] Location tracking (Google Maps)
- [ ] Image upload to S3
- [ ] Email notifications
- [ ] Search and filtering
- [ ] Ratings and reviews API
- [ ] Admin analytics aggregation
- [ ] Payment webhook handling

#### Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests

## File Structure Summary

```
project-se-1/
├── backend/
│   ├── src/
│   │   ├── config/database.js      ✅ MongoDB setup
│   │   ├── controllers/
│   │   │   └── authController.js   ✅ Auth logic
│   │   ├── middleware/
│   │   │   └── auth.js             ✅ JWT middleware
│   │   ├── models/
│   │   │   ├── User.js             ✅ User schema
│   │   │   ├── Farmer.js           ✅ Farmer schema
│   │   │   ├── Consumer.js         ✅ Consumer schema
│   │   │   ├── DeliveryPartner.js  ✅ Delivery partner schema
│   │   │   ├── Product.js          ✅ Product schema
│   │   │   ├── Order.js            ✅ Order schema
│   │   │   ├── Payment.js          ✅ Payment schema
│   │   │   └── Review.js           ✅ Review schema
│   │   └── routes/
│   │       └── authRoutes.js       ✅ Auth endpoints
│   ├── server.js                    ✅ Main server
│   ├── .env.example                 ✅ Env template
│   └── package.json                 ✅ Dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           ✅ Navigation
│   │   │   └── Footer.jsx           ✅ Footer
│   │   ├── pages/
│   │   │   ├── HomePage.jsx         ✅ Landing page
│   │   │   ├── ProductsPage.jsx     ✅ Products listing
│   │   │   ├── CartPage.jsx         ✅ Shopping cart
│   │   │   ├── OrderTrackingPage.jsx ✅ Order tracking
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.jsx    ✅ Login form
│   │   │   │   └── RegisterPage.jsx ✅ Registration form
│   │   │   ├── consumer/
│   │   │   │   └── ConsumerDashboard.jsx ✅ Consumer dashboard
│   │   │   ├── farmer/
│   │   │   │   └── FarmerDashboard.jsx   ✅ Farmer dashboard
│   │   │   ├── delivery/
│   │   │   │   └── DeliveryDashboard.jsx ✅ Delivery dashboard
│   │   │   ├── admin/
│   │   │   │   └── AdminDashboard.jsx    ✅ Admin with charts
│   │   │   └── NotFoundPage.jsx   ✅ 404 page
│   │   ├── redux/
│   │   │   ├── store.js            ✅ Redux store
│   │   │   └── slices/
│   │   │       ├── authSlice.js    ✅ Auth state
│   │   │       ├── cartSlice.js    ✅ Cart state
│   │   │       ├── productsSlice.js ✅ Products state
│   │   │       └── ordersSlice.js   ✅ Orders state
│   │   ├── styles/
│   │   │   └── index.css            ✅ Global styles
│   │   ├── App.jsx                  ✅ Main app
│   │   └── index.js                 ✅ Entry point
│   ├── tailwind.config.js           ✅ Tailwind config
│   ├── postcss.config.js            ✅ PostCSS config
│   └── package.json                 ✅ Dependencies
│
└── docs/
    ├── SOFTWARE_REQUIREMENTS_SPECIFICATION.md ✅
    ├── DATA_FLOW_DIAGRAMS.md                   ✅
    └── DATABASE_SCHEMA_AND_RELATIONS.md        ✅
```

## Next Steps

1. **Test Backend Setup:**
   ```bash
   cd backend
   npm install
   npm run dev
   # Visit http://localhost:5000/api/v1/health
   ```

2. **Test Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Add API Endpoints:**
   - Create product controller and routes
   - Create order controller and routes
   - Create payment integration
   - Add analytics endpoints

4. **Connect Frontend to Backend:**
   - Create API client with axios
   - Connect authentication flows
   - Implement product fetching
   - Add form submissions

5. **Add Real-time Features:**
   - Socket.io for notifications
   - Location tracking
   - Order status updates

6. **Deploy:**
   - Backend to Heroku/AWS/Railway
   - Frontend to Vercel/Netlify
   - Database to MongoDB Atlas (already configured)

## Color Palette

The project uses a modern color scheme inspired by Zepto and Zomato:

- **Primary**: Sky Blue (#0ea5e9) - Main actions and highlights
- **Secondary**: Warm Brown (#c39666) - Secondary actions
- **Accent**: Amber (#f59e0b) - Important notifications
- **Neutral**: Gray (#111827 to #f9fafb) - Text and backgrounds

## Key Features by Role

### Consumer
- Browse and search products
- Add to cart and checkout
- Real-time order tracking
- Rate and review sellers
- Order history

### Farmer
- List and manage products
- Manage inventory
- View orders
- Track revenue
- Customer ratings

### Delivery Partner
- View available orders
- Real-time tracking
- Delivery updates
- Earnings management
- Performance metrics

### Admin
- Platform analytics with visualizations
- User management
- Order management
- Revenue tracking
- System configuration

## Important Notes

1. **Environment Variables**: Never commit .env file to Git
2. **Database Indexes**: Already configured for optimal performance
3. **Authentication**: JWT tokens with 7-day expiry
4. **Security**: CORS enabled, helmet middleware active
5. **Scalability**: MongoDB with geospatial indexes for location-based queries

## Support & Questions

Refer to the comprehensive documentation in the `docs/` folder for:
- Detailed requirements
- Database schema
- Data flow diagrams
- System architecture

---

**Happy coding! 🚀**
