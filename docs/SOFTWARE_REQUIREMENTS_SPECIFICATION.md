# FreshFarm - Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Project Overview
FreshFarm is a direct-to-consumer (D2C) delivery platform that connects farmers directly with urban consumers, enabling the sale of fresh agricultural products while ensuring quality, speed, and transparency.

### 1.2 Project Vision
To revolutionize urban agriculture supply by eliminating intermediaries and creating a direct connection between farmers and consumers, ensuring:
- Fresh products directly from farms to doorstep
- Fair pricing for farmers
- Affordable fresh produce for urban consumers
- Quick delivery within 24-48 hours

### 1.3 Scope
The platform consists of three main modules:
1. **Farmer Module** - Manage inventory, receive orders, track deliveries
2. **Delivery Partner Module** - Manage deliveries, route optimization
3. **Consumer/Customer Module** - Browse products, place orders, track delivery
4. **Admin Dashboard** - Monitor platform analytics, manage users, handle disputes

---

## 2. User Requirements

### 2.1 Farmer Actors
**FR-F1**: Users must be able to register with email, phone, farm details, and location
**FR-F2**: Farmers can add products with details (name, description, price, quantity, image)
**FR-F3**: Farmers can manage inventory (add/edit/delete products)
**FR-F4**: Farmers can view incoming orders in real-time
**FR-F5**: Farmers can mark orders as ready for delivery
**FR-F6**: Farmers can view earnings and transaction history
**FR-F7**: Farmers can manage profile and delivery zones
**FR-F8**: Farmers can view delivery partner assigned to their order
**FR-F9**: Farmers can rate/review delivery partners
**FR-F10**: Farmers receive notifications for new orders

### 2.2 Delivery Partner Actors
**FR-D1**: Users must be able to register with ID, vehicle details, location
**FR-D2**: Delivery partners can view available orders to accept
**FR-D3**: Delivery partners can accept/reject orders
**FR-D4**: Delivery partners can track route and optimize delivery path
**FR-D5**: Delivery partners can update delivery status (picked up, in transit, delivered)
**FR-D6**: Delivery partners can view earnings and trip history
**FR-D7**: Delivery partners can manage availability status
**FR-D8**: Delivery partners can receive notifications for new deliveries
**FR-D9**: Delivery partners can view customer details and farmer details
**FR-D10**: Real-time location tracking for orders

### 2.3 Consumer/Customer Actors
**FR-C1**: Users must be able to register with email, phone, address details
**FR-C2**: Consumers can browse products by category and farmer
**FR-C3**: Consumers can search and filter products (price, freshness, ratings)
**FR-C4**: Consumers can view product details (price, quantity, farmer, delivery time)
**FR-C5**: Consumers can add items to cart and manage cart
**FR-C6**: Consumers can place orders with delivery address and time preference
**FR-C7**: Consumers can track order status in real-time
**FR-C8**: Consumers can view farmer and delivery partner details
**FR-C9**: Consumers can rate and review products and service
**FR-C10**: Consumers can view order history and receipts
**FR-C11**: Consumers can manage multiple delivery addresses
**FR-C12**: Payment integration (online payment methods)

### 2.4 Admin Actors
**FR-A1**: Admin can view all users (farmers, delivery partners, consumers)
**FR-A2**: Admin can verify/approve new farmers
**FR-A3**: Admin can view platform analytics and reports
**FR-A4**: Admin can view order metrics and trends
**FR-A5**: Admin can manage delivery zones
**FR-A6**: Admin can handle complaints and disputes
**FR-A7**: Admin can suspend/deactivate users
**FR-A8**: Admin can manage commissions and payouts
**FR-A9**: Admin can view real-time dashboard with KPIs
**FR-A10**: Admin can generate reports (PDF/Excel)

---

## 3. Non-Functional Requirements

### 3.1 Performance
- **NFR-P1**: Page load time < 2 seconds
- **NFR-P2**: API response time < 500ms
- **NFR-P3**: Support 10,000 concurrent users
- **NFR-P4**: Real-time location updates every 10 seconds

### 3.2 Security
- **NFR-S1**: HTTPS/SSL encryption for all transactions
- **NFR-S2**: Password hashing using bcrypt
- **NFR-S3**: JWT-based authentication
- **NFR-S4**: PCI DSS compliance for payments
- **NFR-S5**: Data validation on client and server side
- **NFR-S6**: Rate limiting on API endpoints

### 3.3 Availability
- **NFR-A1**: 99.5% uptime SLA
- **NFR-A2**: Automatic backup daily
- **NFR-A3**: Disaster recovery plan in place

### 3.4 Usability
- **NFR-U1**: Intuitive UI/UX design
- **NFR-U2**: Mobile-responsive design
- **NFR-U3**: Multi-language support (optional future)
- **NFR-U4**: Accessibility compliance (WCAG)

---

## 4. System Architecture

### 4.1 Technology Stack
- **Frontend**: React JS, Tailwind CSS, Redux/Context API
- **Backend**: Node.js, Express JS
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)
- **Payment Gateway**: Stripe/Razorpay
- **Maps**: Google Maps API
- **Cloud Storage**: AWS S3 / Firebase
- **Real-time**: Socket.io for notifications

### 4.2 System Components
1. **User Service** - Registration, Authentication, Profile Management
2. **Product Service** - Product Catalog, Inventory Management
3. **Order Service** - Order Processing, Order Tracking
4. **Payment Service** - Payment Processing, Transaction Management
5. **Notification Service** - Email, SMS, Push Notifications
6. **Analytics Service** - Dashboard Metrics, Reports
7. **Location Service** - Real-time Location Tracking, Route Optimization

---

## 5. Data Requirements

### 5.1 Data to be Stored
- User profiles (Farmers, Delivery Partners, Consumers, Admins)
- Product information
- Order details
- Transaction records
- Ratings and reviews
- Location history
- Payment information (encrypted)

### 5.2 Data Security
- All sensitive data encrypted
- Regular backup and archival
- Data retention policies
- GDPR compliance

---

## 6. Interface Requirements

### 6.1 User Interfaces
- **Farmer Web Portal** - Product management, order management, analytics
- **Delivery Partner App** - Order acceptance, route tracking, delivery updates
- **Consumer Web/App** - Product browsing, ordering, tracking, reviews
- **Admin Dashboard** - Complete platform management and analytics

### 6.2 API Interfaces
- RESTful APIs for all operations
- WebSocket for real-time updates
- Webhook support for external integrations

---

## 7. Constraints and Assumptions

### 7.1 Constraints
- Delivery limited to urban areas initially
- Order minimum value to be defined
- Delivery time window 7 AM - 9 PM
- Payment must be completed before order confirmation

### 7.2 Assumptions
- Users have valid email and phone numbers
- Farmers have government-issued ID proof
- Delivery partners have valid driver's license
- Users have stable internet connection
- GPS availability on delivery devices

---

## 8. Success Criteria

- Platform operational with all three user types
- 99.5% delivery success rate
- Average delivery time < 24 hours
- Customer satisfaction score > 4.5/5
- Zero payment fraud instances
- Admin can generate insights in < 1 second

---

## 9. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-26 | Development Team | Initial SRS Document |

