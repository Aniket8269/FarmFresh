# FreshFarm - Database Schema & Relations Diagram

## Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────┐
│         USERS                   │
├─────────────────────────────────┤
│ _id (PK)                        │
│ user_type (enum)                │
│ email (unique)                  │
│ phone                           │
│ password_hash                   │
│ name                            │
│ profile_pic                     │
│ created_at                      │
│ updated_at                      │
└──────────┬──────────┬───────────┘
           │          │
           │          │
      ┌────▼──┐  ┌───▼────────────────────┐
      │       │  │                        │
      │       │  │                        │
┌─────▼───┐  │  │  ┌──────────────────────────────┐
│ FARMERS │  │  │  │   CONSUMERS                  │
├─────────┤  │  │  ├──────────────────────────────┤
│ _id (PK)│  │  │  │ _id (PK)                     │
│user_id  │──┴──┼─ ├─user_id (FK)                  │
│farm_name│     │  │ addresses[]                  │
│location │     │  │ saved_farmers[]              │
│address  │     │  │ created_at                   │
│rating   │     │  │ updated_at                   │
│status   │     │  └──┬────────────────────────────┘
└─────────┘     │     │
                │     │
            ┌───▼──────▼────────────────┐
            │    ORDERS                 │
            ├───────────────────────────┤
            │ _id (PK)                  │
            │ consumer_id (FK) ─────────┼──────────┐
            │ farmer_id (FK)            │          │
            │ delivery_partner_id (FK) ─┼──┐       │
            │ items[] (FK refs)         │  │       │
            │ total_price               │  │       │
            │ tax                       │  │       │
            │ delivery_address          │  │       │
            │ status                    │  │       │
            │ estimated_delivery        │  │       │
            │ actual_delivery           │  │       │
            │ created_at                │  │       │
            │ updated_at                │  │       │
            └───────────────────────────┘  │       │
                                           │       │
                    ┌──────────────────────▼─┐     │
                    │  DELIVERY_PARTNERS     │     │
                    ├──────────────────────────┤   │
                    │ _id (PK)              │   │
                    │ user_id (FK) ─────────┼─────┘
                    │ vehicle_type          │
                    │ vehicle_number        │
                    │ license_number        │
                    │ location              │
                    │ availability          │
                    │ rating                │
                    │ total_deliveries      │
                    │ status                │
                    └─────────────────────────┘

┌─────────────────────────────────┐
│       PRODUCTS                  │
├─────────────────────────────────┤
│ _id (PK)                        │
│ farmer_id (FK) ──────────┐      │
│ name                     │      │
│ description              │      │
│ price                    │      │
│ quantity_available       │      │
│ unit                     │      │
│ category                 │      │
│ image_url                │      │ (Referenced in ORDERS.items[])
│ rating                   │      │
│ total_reviews            │      │
│ created_at               │      │
│ updated_at               │      │
└─────────────────────────────────┘

┌────────────────────────────────────┐
│        PAYMENTS                    │
├────────────────────────────────────┤
│ _id (PK)                           │
│ order_id (FK) ──────────┐          │
│ consumer_id (FK)        │          │
│ amount                  │          │
│ payment_method          │          │
│ transaction_id          │          │
│ status                  │          │
│ created_at              │          │
│ updated_at              │          │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│      REVIEWS_RATINGS               │
├────────────────────────────────────┤
│ _id (PK)                           │
│ order_id (FK)                      │
│ reviewer_id (FK)                   │
│ reviewee_type (enum)               │
│ reviewee_id (FK)                   │
│ rating (1-5)                       │
│ comment                            │
│ created_at                         │
│ updated_at                         │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│      NOTIFICATIONS                 │
├────────────────────────────────────┤
│ _id (PK)                           │
│ user_id (FK)                       │
│ type                               │
│ title                              │
│ message                            │
│ is_read                            │
│ created_at                         │
│ updated_at                         │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│      ANALYTICS_DAILY               │
├────────────────────────────────────┤
│ _id (PK)                           │
│ date                               │
│ total_orders                       │
│ total_revenue                      │
│ avg_order_value                    │
│ active_farmers                     │
│ active_consumers                   │
│ completed_deliveries               │
│ avg_delivery_time                  │
│ customer_satisfaction              │
│ created_at                         │
└────────────────────────────────────┘
```

---

## Detailed Collection Schemas

### 1. Users Collection

```json
{
  "_id": ObjectId,
  "user_type": "farmer|delivery_partner|consumer|admin",
  "email": "user@example.com",
  "phone": "+91XXXXXXXXXX",
  "password_hash": "bcrypt_hashed_password",
  "name": "John Doe",
  "profile_pic": "https://s3.amazonaws.com/...",
  "is_active": true,
  "is_verified": false,
  "last_login": ISODate("2026-02-26T10:30:00Z"),
  "created_at": ISODate("2026-02-20T08:00:00Z"),
  "updated_at": ISODate("2026-02-26T10:30:00Z")
}
```

### 2. Farmers Collection (extends Users)

```json
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "farm_name": "Green Valley Farm",
  "farm_size": 50,
  "location": {
    "type": "Point",
    "coordinates": [77.5946, 12.9716]  // [longitude, latitude]
  },
  "address": "123 Farm Road, Bangalore, Karnataka 560001",
  "state": "Karnataka",
  "city": "Bangalore",
  "pincode": "560001",
  "avg_rating": 4.5,
  "total_orders": 125,
  "total_revenue": 45000,
  "bank_account": {
    "account_number": "encrypted",
    "ifsc_code": "XXXX0000000",
    "account_holder": "Name",
    "bank_name": "Bank Name"
  },
  "documents": {
    "aadhar": "verified",
    "pan": "verified",
    "farm_license": "verified"
  },
  "delivery_zones": [
    {
      "radius_km": 15,
      "city": "Bangalore"
    }
  ],
  "verification_status": "verified|pending|rejected",
  "verification_date": ISODate("2026-02-21T09:00:00Z"),
  "is_active": true,
  "created_at": ISODate("2026-02-20T08:00:00Z"),
  "updated_at": ISODate("2026-02-26T10:30:00Z")
}
```

### 3. Consumers Collection (extends Users)

```json
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "addresses": [
    {
      "_id": ObjectId,
      "label": "Home|Work|Other",
      "street": "123 Main Street",
      "city": "Bangalore",
      "state": "Karnataka",
      "pincode": "560001",
      "location": {
        "type": "Point",
        "coordinates": [77.5946, 12.9716]
      },
      "is_default": true,
      "created_at": ISODate()
    }
  ],
  "saved_farmers": [ObjectId],
  "favorite_products": [ObjectId],
  "total_orders": 15,
  "total_spent": 5000,
  "avg_rating_given": 4.3,
  "preferences": {
    "notifications_enabled": true,
    "delivery_time_preference": "morning|afternoon|evening",
    "dietary_preferences": ["organic", "pesticide_free"]
  },
  "created_at": ISODate("2026-02-20T08:00:00Z"),
  "updated_at": ISODate("2026-02-26T10:30:00Z")
}
```

### 4. Delivery Partners Collection (extends Users)

```json
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "vehicle_type": "bike|car|van",
  "vehicle_number": "KA-01-XY-1234",
  "vehicle_color": "White",
  "license_number": "DL-XXXXXXXXXX",
  "license_expiry": ISODate("2030-12-31"),
  "location": {
    "type": "Point",
    "coordinates": [77.5946, 12.9716]
  },
  "current_zone": "Bangalore",
  "availability_status": "available|busy|offline",
  "is_available": true,
  "rating": 4.6,
  "total_deliveries": 342,
  "successful_deliveries": 335,
  "cancelled_deliveries": 7,
  "total_reviews": 85,
  "bank_account": {
    "account_number": "encrypted",
    "ifsc_code": "XXXX0000000"
  },
  "documents": {
    "driving_license": "verified",
    "aadhar": "verified",
    "vehicle_rc": "verified"
  },
  "verification_status": "verified|pending|rejected",
  "created_at": ISODate("2026-02-20T08:00:00Z"),
  "updated_at": ISODate("2026-02-26T10:30:00Z")
}
```

### 5. Products Collection

```json
{
  "_id": ObjectId,
  "farmer_id": ObjectId,
  "name": "Fresh Tomato",
  "description": "Locally grown organic tomatoes",
  "category": "Vegetables",
  "subcategory": "Tomato",
  "price": 50,
  "unit": "kg",
  "quantity_available": 100,
  "quantity_sold": 45,
  "min_order_quantity": 1,
  "max_order_quantity": 50,
  "image_url": "https://s3.amazonaws.com/...",
  "images": [
    "https://s3.amazonaws.com/...",
    "https://s3.amazonaws.com/..."
  ],
  "is_organic": true,
  "is_seasonal": false,
  "harvest_date": ISODate("2026-02-25T00:00:00Z"),
  "expiry_date": ISODate("2026-03-02T00:00:00Z"),
  "rating": 4.7,
  "total_reviews": 23,
  "total_orders": 67,
  "is_active": true,
  "created_at": ISODate("2026-02-20T08:00:00Z"),
  "updated_at": ISODate("2026-02-26T10:30:00Z")
}
```

### 6. Orders Collection

```json
{
  "_id": ObjectId,
  "order_number": "ORD-2026-02-26-001",
  "consumer_id": ObjectId,
  "farmer_id": ObjectId,
  "delivery_partner_id": ObjectId,
  "items": [
    {
      "_id": ObjectId,
      "product_id": ObjectId,
      "product_name": "Fresh Tomato",
      "quantity": 2,
      "unit": "kg",
      "unit_price": 50,
      "total_price": 100
    }
  ],
  "subtotal": 250,
  "tax": 45,
  "delivery_charge": 20,
  "total_price": 315,
  "payment_method": "credit_card|debit_card|upi|wallet",
  "payment_status": "pending|completed|failed|refunded",
  "delivery_address": {
    "street": "123 Main Street",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001",
    "location": {
      "type": "Point",
      "coordinates": [77.5946, 12.9716]
    }
  },
  "order_status": "pending|confirmed|assigned|picked_up|in_transit|delivered|cancelled",
  "estimated_delivery": ISODate("2026-02-27T08:00:00Z"),
  "actual_delivery": ISODate("2026-02-27T07:45:00Z"),
  "notes": "Ring doorbell twice",
  "tracking_history": [
    {
      "status": "confirmed",
      "timestamp": ISODate("2026-02-26T10:35:00Z")
    },
    {
      "status": "assigned",
      "timestamp": ISODate("2026-02-26T10:40:00Z")
    }
  ],
  "created_at": ISODate("2026-02-26T10:30:00Z"),
  "updated_at": ISODate("2026-02-26T10:45:00Z")
}
```

### 7. Payments Collection

```json
{
  "_id": ObjectId,
  "order_id": ObjectId,
  "consumer_id": ObjectId,
  "amount": 315,
  "currency": "INR",
  "payment_method": "credit_card|debit_card|upi|wallet",
  "payment_gateway": "stripe|razorpay",
  "transaction_id": "txn_XXXXXXXXX",
  "gateway_response": {
    "id": "ch_XXXXX",
    "status": "succeeded",
    "error": null
  },
  "card_details": {
    "last4": "4242",
    "brand": "visa",
    "exp_month": 12,
    "exp_year": 2026
  },
  "status": "pending|completed|failed|refunded|cancelled",
  "refund_amount": 0,
  "refund_date": null,
  "refund_reason": null,
  "created_at": ISODate("2026-02-26T10:30:00Z"),
  "updated_at": ISODate("2026-02-26T10:35:00Z")
}
```

### 8. Reviews & Ratings Collection

```json
{
  "_id": ObjectId,
  "order_id": ObjectId,
  "reviewer_id": ObjectId,
  "reviewer_type": "consumer|delivery_partner|farmer",
  "reviewee_type": "farmer|product|delivery_partner",
  "reviewee_id": ObjectId,
  "rating": 4,
  "title": "Fresh and high quality",
  "comment": "Excellent quality tomatoes, delivered fresh. Highly recommended!",
  "verified_purchase": true,
  "helpful_count": 12,
  "images": [
    "https://s3.amazonaws.com/..."
  ],
  "created_at": ISODate("2026-02-27T10:30:00Z"),
  "updated_at": ISODate("2026-02-27T10:30:00Z")
}
```

### 9. Notifications Collection

```json
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "type": "order|payment|delivery|review|promotion",
  "title": "Order Confirmed",
  "message": "Your order #ORD-2026-02-26-001 has been confirmed",
  "order_id": ObjectId,
  "reference_type": "order|product|delivery",
  "reference_id": ObjectId,
  "is_read": false,
  "notification_tags": ["order", "confirmation"],
  "created_at": ISODate("2026-02-26T10:35:00Z"),
  "read_at": null
}
```

### 10. Analytics Daily Collection

```json
{
  "_id": ObjectId,
  "date": ISODate("2026-02-26T00:00:00Z"),
  "total_orders": 1250,
  "completed_orders": 1180,
  "pending_orders": 50,
  "cancelled_orders": 20,
  "total_revenue": 375000,
  "avg_order_value": 300,
  "tax_collected": 67500,
  "active_farmers": 450,
  "new_farmers": 12,
  "active_consumers": 8500,
  "new_consumers": 250,
  "active_delivery_partners": 1200,
  "completed_deliveries": 1180,
  "failed_deliveries": 20,
  "avg_delivery_time_minutes": 35,
  "customer_satisfaction_avg": 4.6,
  "top_products": [
    {
      "product_id": ObjectId,
      "name": "Tomato",
      "quantity_sold": 450,
      "revenue": 22500
    }
  ],
  "created_at": ISODate("2026-02-26T23:59:59Z")
}
```

---

## Indexes for Performance

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ phone: 1 }, { unique: true })
db.users.createIndex({ user_type: 1 })
db.users.createIndex({ created_at: -1 })

// Farmers
db.farmers.createIndex({ user_id: 1 })
db.farmers.createIndex({ "location": "2dsphere" })  // Geospatial
db.farmers.createIndex({ verification_status: 1 })
db.farmers.createIndex({ avg_rating: -1 })

// Products
db.products.createIndex({ farmer_id: 1 })
db.products.createIndex({ category: 1 })
db.products.createIndex({ name: "text" })  // Text search
db.products.createIndex({ created_at: -1 })

// Orders
db.orders.createIndex({ consumer_id: 1 })
db.orders.createIndex({ farmer_id: 1 })
db.orders.createIndex({ delivery_partner_id: 1 })
db.orders.createIndex({ order_status: 1 })
db.orders.createIndex({ created_at: -1 })
db.orders.createIndex({ "delivery_address.location": "2dsphere" })

// Payments
db.payments.createIndex({ order_id: 1 })
db.payments.createIndex({ consumer_id: 1 })
db.payments.createIndex({ status: 1 })
db.payments.createIndex({ created_at: -1 })

// Reviews
db.reviews.createIndex({ order_id: 1 })
db.reviews.createIndex({ reviewee_id: 1 })
db.reviews.createIndex({ created_at: -1 })

// Analytics
db.analytics.createIndex({ date: -1 })
```

---

## MongoDB Connection & Initialization

```javascript
// Connection String Format
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database_name>

// Example Indexes Creation Script
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ phone: 1 }, { unique: true })
// ... (all indexes as shown above)
```

