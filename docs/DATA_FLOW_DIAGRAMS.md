# FreshFarm - Data Flow Diagrams (DFD)

## DFD Level 0 (Context Diagram)

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  [Farmer]                    [FreshFarm Platform]        [Consumer] │
│     │                              ▲▼                         │    │
│     │  Product Info                │                          │    │
│     │  Orders                      │                          │    │
│     └─────────────────────────────>│                          │    │
│                                    │                    Browsing   │
│                            Product  │  Delivery Info       Order    │
│                            Orders   │                   Tracking    │
│                                    <└──────────────────────────┘    │
│                                    │                              │
│    [Delivery Partner]              │                              │
│         │                          │                              │
│         │ Location Updates │        │                           │
│         │ Pickup/Delivery  │───────>│                           │
│         │                          │                           │
│     [Payment Gateway]              │                           │
│         │                          │                           │
│         │  Payment                 │                           │
│         │<────────────────────────>│                           │
│                                    │                           │
│ [Admin]                            │                           │
│     │                              │                           │
│     │  Reports, Analytics          │                           │
│     │<─────────────────────────────│                           │
│     │  Platform Management         │                           │
│     └─────────────────────────────>│                           │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Major Processes:
1. **User Management** - Registration, Authentication, Profile Management
2. **Product Management** - Add, Update, Delete Products, Inventory
3. **Order Processing** - Order Creation, Order Confirmation
4. **Order Fulfillment** - Delivery Assignment, Tracking, Delivery Completion
5. **Payment Processing** - Payment Processing, Transaction Logging
6. **Analytics & Reporting** - Dashboard, Reports, Metrics

---

## DFD Level 1 (System Overview)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│ ┌─────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐│
│ │ Farmer  │    │  Consumer    │    │   Delivery   │    │    Admin     ││
│ │ Portal  │    │   Mobile/    │    │   Partner    │    │   Dashboard  ││
│ │         │    │    Web       │    │     App      │    │              ││
│ └────┬────┘    └──────┬───────┘    └──────┬───────┘    └──────┬───────┘│
│      │                │                   │                   │        │
│      │                │                   │                   │        │
│      └────────────────┼───────────────────┼───────────────────┘        │
│                       │                   │                            │
│                   ┌───▼───────────────────▼────┐                       │
│                   │     API Gateway             │                      │
│                   │  (Express / Node.js)        │                      │
│                   └───┬───────────────────┬────┘                       │
│                       │                   │                            │
│      ┌────────────────┼───────────────────┼──────────────┐            │
│      │                │                   │              │            │
│  ┌───▼────────┐  ┌───▼────────┐  ┌──────▼──────┐  ┌───▼──────┐      │
│  │   Auth     │  │  Product   │  │   Order     │  │  Payment │      │
│  │  Service   │  │  Service   │  │  Service    │  │  Service │      │
│  └────────────┘  └────────────┘  └─────────────┘  └──────────┘      │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Location    │  │  Analytics   │  │ Notification │              │
│  │  Service     │  │  Service     │  │  Service     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                       │
│      ┌──────────────────────────────────────────────────────────┐   │
│      │        MongoDB Atlas Database                             │   │
│      │  (Users, Products, Orders, Payments, Analytics Data)     │   │
│      └──────────────────────────────────────────────────────────┘   │
│                                                                       │
│      External Services: Google Maps, Stripe/Razorpay, Email/SMS    │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## DFD Level 2 - Detailed Process Flows

### 2.1 User Registration & Authentication Flow

```
User Input (Email, Phone, Password) → Validation → Password Hashing → 
Store in User Database → Send Verification Email → 
User Verification → Account Activation → JWT Token Generation
```

### 2.2 Product Management Flow (Farmer)

```
Farmer Login → View Dashboard → Add Product (Name, Price, Qty, Image) →
Image Upload to Cloud Storage → Store Product in Database → 
Update Inventory → Farmer Dashboard Updated
```

### 2.3 Order Processing Flow

```
Consumer Browse Products → Add to Cart → Checkout → 
Validate Address → Process Payment → Order Confirmation →
Store Order in Database → Notify Farmer → Order Status: Pending
```

### 2.4 Delivery Assignment Flow

```
New Order Created → Check Delivery Partners Available → 
Match by Location/Distance → Send Notification to Delivery Partner →
Partner Accept/Reject → Order Status: Assigned → 
Real-time Location Tracking Activated
```

### 2.5 Payment Processing Flow

```
Consumer Completes Order → Validate Cart & Address → 
Process Payment via Stripe/Razorpay → Payment Gateway Response → 
Update Order Status → Generate Receipt → Send Confirmation Email
```

### 2.6 Analytics & Dashboard Flow

```
Collect Order Data → Aggregate by Date/Category/Farmer → 
Calculate KPIs (Total Orders, Revenue, Delivery Time) →
Generate Graphs & Charts → Store in Analytics Cache → 
Display in Admin Dashboard
```

---

## DFD Level 3 - Detailed Data Flows

### 3.1 Product Management - Data Store Operations

```
┌──────────────────────────────────────────────────────────────┐
│ Farmer Actions: Add/Update/Delete Product                   │
└────────────────────┬─────────────────────────────────────────┘
                     │
          ┌──────────▼──────────┐
          │  Validate Product   │
          │  Data               │
          │  - Name (required)  │
          │  - Price > 0        │
          │  - Quantity >= 0    │
          │  - Image size       │
          └──────────┬──────────┘
                     │
         ┌───────────▼────────────┐
         │  Upload Image to       │
         │  Cloud Storage (S3)    │
         │  Return Image URL      │
         └───────────┬────────────┘
                     │
    ┌────────────────▼──────────────────┐
    │  Write to MongoDB                 │
    │  Collection: products             │
    │  {                                │
    │    _id, farmer_id, name,          │
    │    price, quantity, category,     │
    │    image_url, rating, reviews,    │
    │    created_at, updated_at         │
    │  }                                │
    └────────────────┬───────────────────┘
                     │
          ┌──────────▼──────────┐
          │  Update Inventory   │
          │  in Cache (Redis)   │
          │  for Fast Access    │
          └──────────┬──────────┘
                     │
          ┌──────────▼──────────┐
          │  Notify Consumers   │
          │  via Socket.io      │
          │  New Product Added  │
          └─────────────────────┘
```

### 3.2 Order Processing - Complete Flow

```
Consumer Adds Item to Cart
    │
    ├─ Store in Browser LocalStorage
    │
Consumer Checkout
    │
    ├─ Validate Each Item Still Available
    │  └─ Query Products from MongoDB
    │
    ├─ Calculate Total Price + Tax
    │
    ├─ Validate Delivery Address
    │  └─ Verify with Google Maps API
    │
    ├─ Check Delivery Feasibility
    │  └─ Query Nearby Farmers in Radius
    │
Send to Payment Gateway (Stripe/Razorpay)
    │
    ├─ Process Payment
    │
    ├─ If Payment Success:
    │  ├─ Create Order in MongoDB
    │  │  {
    │  │    order_id, consumer_id, farmer_id,
    │  │    items[], total_price, delivery_address,
    │  │    status: "pending", created_at, delivery_time
    │  │  }
    │  │
    │  ├─ Create Transaction Record
    │  │  { transaction_id, order_id, amount, status: "completed" }
    │  │
    │  ├─ Update Inventory (Reduce Stock)
    │  │  └─ Subtract ordered quantity from products
    │  │
    │  ├─ Notify Farmer
    │  │  └─ Socket.io + Email/SMS
    │  │
    │  ├─ Notify Consumer
    │  │  └─ Order Confirmation Email
    │  │
    │  └─ Set Status: CONFIRMED
    │
    ├─ If Payment Fails:
    │  └─ Clear Cart, Send Retry Notification
    │
Find Delivery Partner
    │
    ├─ Query Available Delivery Partners
    │  └─ location, availability = true, rating > 4
    │
    ├─ Calculate Distance & ETA
    │  └─ Google Maps Distance Matrix API
    │
    ├─ Auto-assign Best Partner or Notify All Available
    │
    ├─ Partner Accepts:
    │  ├─ Update Order Status: ASSIGNED
    │  ├─ Activate Real-time Tracking
    │  └─ Update Field: delivery_partner_id
    │
    └─ Partner Rejects: Try Next Partner

Real-time Tracking
    │
    ├─ Delivery Partner Shares GPS Location Every 10 seconds
    │  └─ Store in Time-series DB for History
    │
    ├─ Consumer Sees Live Map
    │  └─ Socket.io Updates via WebSocket
    │
    ├─ Send Status Updates:
    │  ├─ Picked Up from Farmer
    │  ├─ In Transit
    │  └─ Delivered
    │
    └─ Generate Receipt & Bill

Completion
    │
    ├─ Mark Order Complete
    │  └─ update_at = current_timestamp
    │
    ├─ Send Receipt Email
    │
    └─ Enable Ratings & Reviews
       ├─ Consumer Reviews Farmer & Delivery Partner
       ├─ Delivery Partner Reviews Farmer
       └─ Update Average Ratings
```

### 3.3 Admin Dashboard - Data Aggregation

```
Admin Views Dashboard
    │
    ├─ Query 1: Total Orders (Last 30 Days)
    │  └─ MongoDB Aggregation: count orders where created_at > 30 days ago
    │
    ├─ Query 2: Revenue by Day
    │  └─ Sum transactions where status = completed, group by date
    │
    ├─ Query 3: Top 10 Farmers
    │  └─ Count orders by farmer_id, sort by count desc
    │
    ├─ Query 4: Average Delivery Time
    │  └─ Calculate (delivered_at - assigned_at) for all orders
    │
    ├─ Query 5: Customer Satisfaction
    │  └─ Average rating from reviews, group by category/farmer
    │
    ├─ Query 6: Active Users
    │  └─ Count users with last_login > 7 days
    │
    └─ Query 7: Orders by Status Distribution
       └─ Pie chart: pending, assigned, delivered, cancelled

Cache Layer (Redis):
    ├─ Store Aggregated Results
    ├─ Refresh Every 1 Hour
    └─ Serve Dashboard in < 500ms
```

---

## 3.4 Data Storage Schema Overview

```
MongoDB Collections:

users
├── _id: ObjectId
├── user_type: "farmer" | "delivery_partner" | "consumer" | "admin"
├── email: String (unique)
├── phone: String
├── password_hash: String
├── name: String
├── profile_pic: String (URL)
├── created_at: DateTime
└── updated_at: DateTime

farmers (Extended user)
├── _id: ObjectId
├── user_id: ObjectId (reference)
├── farm_name: String
├── location: GeoJSON Point
├── address: String
├── avg_rating: Number
├── total_orders: Number
├── verification_status: "pending" | "verified" | "rejected"
└── active_zone_radius: Number

products
├── _id: ObjectId
├── farmer_id: ObjectId (reference)
├── name: String
├── description: String
├── price: Number
├── quantity_available: Number
├── unit: String ("kg", "piece", etc)
├── category: String
├── image_url: String
├── rating: Number
├── created_at: DateTime
└── updated_at: DateTime

orders
├── _id: ObjectId
├── consumer_id: ObjectId (reference)
├── farmer_id: ObjectId (reference)
├── delivery_partner_id: ObjectId (reference)
├── items: [{product_id, quantity, price}]
├── total_price: Number
├── tax: Number
├── delivery_address: String
├── status: "pending" | "confirmed" | "assigned" | "in_transit" | "delivered" | "cancelled"
├── estimated_delivery: DateTime
├── actual_delivery: DateTime
├── created_at: DateTime
└── updated_at: DateTime

payments
├── _id: ObjectId
├── order_id: ObjectId (reference)
├── consumer_id: ObjectId (reference)
├── amount: Number
├── payment_method: "credit_card" | "debit_card" | "upi" | "wallet"
├── transaction_id: String (from Stripe/Razorpay)
├── status: "pending" | "completed" | "failed" | "refunded"
├── created_at: DateTime
└── updated_at: DateTime

reviews & ratings
├── _id: ObjectId
├── order_id: ObjectId (reference)
├── reviewer_id: ObjectId (reference)
├── reviewee_type: "farmer" | "delivery_partner"
├── reviewee_id: ObjectId (reference)
├── rating: Number (1-5)
├── comment: String
├── created_at: DateTime
└── updated_at: DateTime

analytics
├── _id: ObjectId
├── date: Date
├── total_orders: Number
├── total_revenue: Number
├── avg_order_value: Number
├── active_farmers: Number
├── active_consumers: Number
├── completed_deliveries: Number
└── avg_delivery_time: Number
```

---

## 4. Data Flow Summary

| Process | Input | Processing | Output | Storage |
|---------|-------|------------|--------|---------|
| Registration | Email, Phone, Password | Validation, Hashing | JWT Token | Users Collection |
| Product Add | Product Details, Image | Validation, Upload | Product ID | Products Collection |
| Order Placement | Cart Items, Address | Calc Total, Validate | Order ID | Orders Collection |
| Payment | Amount, Card Info | Gateway Processing | Receipt | Payments Collection |
| Delivery Tracking | GPS Location | Real-time Update | Location History | Time-series DB |
| Admin Analytics | All Orders/Users | Aggregation | Dashboard Data | Analytics Cache |

