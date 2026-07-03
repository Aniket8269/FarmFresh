# Distance-Based Delivery Charge Implementation Guide

## Overview
Implement distance-based delivery charges using Google Maps API to calculate distance between farmer's pickup location and consumer's delivery location.

---

## 1. Google Maps API Setup

### Required:
- **Google Maps JavaScript API** (for frontend map UI)
- **Google Maps Distance Matrix API** (for calculating distances)
- **Google Geocoding API** (for converting addresses to coordinates)

### Steps:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable these APIs:
   - Maps JavaScript API
   - Distance Matrix API
   - Geocoding API
4. Create an API Key (Unrestricted or with restrictions)
5. Create a second API Key for backend (with HTTP referrer restrictions)

### Cost:
- First $200 free per month
- Then $7 per 1000 requests for Distance Matrix API
- Geocoding API: $5 per 1000 requests

---

## 2. Backend Changes

### A. Add Google Maps Configuration
**File:** `backend/src/config/googleMaps.js` (NEW)
```javascript
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const DELIVERY_CHARGE_PER_KM = process.env.DELIVERY_CHARGE_PER_KM || 5; // ₹ per km
const MIN_DELIVERY_CHARGE = process.env.MIN_DELIVERY_CHARGE || 30; // Minimum charge

module.exports = {
  GOOGLE_MAPS_API_KEY,
  DELIVERY_CHARGE_PER_KM,
  MIN_DELIVERY_CHARGE
};
```

### B. Update Product Model
**File:** `backend/src/models/Product.js`
- Add fields:
  - `farmerPickupLocation` (object with lat, lng, address)
  - `farmerLocationCoordinates` (for easier Distance Matrix API calls)

### C. Create Delivery Utility
**File:** `backend/src/utils/deliveryCalculator.js` (NEW)
```javascript
Function: calculateDeliveryCharge(pickupCoords, deliveryCoords)
- Input: {lat, lng} for both locations
- Use Distance Matrix API to get distance in km
- Calculate: (distance * DELIVERY_CHARGE_PER_KM)
- Return max(calculated_charge, MIN_DELIVERY_CHARGE)
```

### D. Update Order Model
**File:** `backend/src/models/Order.js`
- Add fields:
  - `deliveryLocationCoordinates` (lat, lng from consumer)
  - `deliveryLocationAddress`
  - `pickupLocationCoordinates` (from farmer/product)
  - `pickupLocationAddress`
  - `distanceKm` (calculated distance)
  - `deliveryCharge` (calculated charge)

### E. Update Order Controller
**File:** `backend/src/controllers/orderController.js`
- When creating order:
  1. Get coordinates from consumer's delivery location
  2. Get coordinates from farmer's pickup location
  3. Call `calculateDeliveryCharge(pickupCoords, deliveryCoords)`
  4. Save all data in Order model

### F. Create New Route (Optional)
**File:** `backend/src/routes/deliveryRoutes.js` (NEW)
- Route: `POST /api/delivery/calculate-charge`
  - Input: pickupLocation (lat, lng), deliveryLocation (lat, lng)
  - Output: distance, calculatedCharge
  - Used by frontend for showing charge before order creation

### G. Update .env
```
GOOGLE_MAPS_API_KEY=your_api_key_here
DELIVERY_CHARGE_PER_KM=5
MIN_DELIVERY_CHARGE=30
ENVIRONMENT=production
```

---

## 3. Frontend Changes

### A. Install Google Maps Package
```bash
npm install @react-google-maps/api
```

### B. Create Location Picker Component
**File:** `frontend/src/components/GoogleMapsLocations.jsx` (NEW)
- Component with two map pickers:
  1. **Pickup Location Map** (for Farmers)
     - Show/edit farmer's current location
     - Allow dragging to select location
     - Show selected address
  
  2. **Delivery Location Map** (for Consumers)
     - Show map for consumer to select delivery address
     - Allow search/autocomplete
     - Show selected address

### C. Update Farmer Dashboard
**File:** `frontend/src/pages/farmer/FarmerDashboard.jsx`
- Add location picker for pickup location
- Save location to product when adding product
- Display pickup location on product card

### D. Update Product Upload Form
**File:** `frontend/src/pages/farmer/AddProductForm.jsx`
- Add Google Maps location picker
- Get pickupLocationCoordinates and pickupLocationAddress
- Send with product creation request

### E. Update Cart/Checkout Page
**File:** `frontend/src/pages/CartPage.jsx`
- Add delivery location picker (Google Maps)
- Show estimated delivery charge before checkout
- Call backend `/api/delivery/calculate-charge` to show real-time charge
- Allow address editing

### F. Add Delivery Charge Display
**File:** `frontend/src/components/OrderSummary.jsx` (NEW or update existing)
- Show breakdown:
  - Product Total
  - Delivery Charge (with distance shown)
  - Total with delivery

### G. Update API Utilities
**File:** `frontend/src/utils/api.js`
- Add function: `calculateDeliveryCharge(pickupCoords, deliveryCoords)`
- Add function: `geocodeAddress(address)` (optional, for manual address entry)

---

## 4. Database Schema Updates

### Product Collection - Add:
```javascript
{
  farmerPickupLocation: {
    lat: Number,
    lng: Number,
    address: String
  },
  farmerLocationTimestamp: Date
}
```

### Order Collection - Add:
```javascript
{
  pickupLocation: {
    lat: Number,
    lng: Number,
    address: String
  },
  deliveryLocation: {
    lat: Number,
    lng: Number,
    address: String
  },
  distanceKm: Number,
  deliveryCharge: Number,
  chargeBreakdown: {
    baseCharge: Number,
    distanceCharge: Number,
    discount: Number (if any)
  }
}
```

---

## 5. Implementation Priority

### Phase 1 (Essential):
- [ ] Google Maps API setup
- [ ] Backend: deliveryCalculator.js with Distance Matrix API
- [ ] Update Order model with delivery fields
- [ ] Update orderController to calculate charge

### Phase 2 (Frontend):
- [ ] Google Maps location picker component
- [ ] Update AddProductForm (farmer pickup location)
- [ ] Update CartPage (consumer delivery location)

### Phase 3 (Polish):
- [ ] Real-time charge preview
- [ ] Delivery tracking with maps
- [ ] Distance history/analytics

---

## 6. Key Implementation Details

### Distance Calculation Method:
```
Use Google Maps Distance Matrix API
Input: Origin (lat, lng), Destination (lat, lng)
Output: Distance in meters/km

Formula:
deliveryCharge = MAX(
  (distance_km * DELIVERY_CHARGE_PER_KM),
  MIN_DELIVERY_CHARGE
)
```

### Example:
- Distance: 15 km
- Charge per km: ₹5
- Min charge: ₹30
- **Delivery Charge = ₹75** (15 × 5)

If distance is 4 km:
- Calculated: 4 × 5 = ₹20
- **Delivery Charge = ₹30** (minimum applied)

---

## 7. Frontend Library Options

### Option A (Recommended): @react-google-maps/api
- Easy to use
- Official Google support
- Good for React

### Option B: react-map-gl (Mapbox)
- Lighter weight
- Mapbox API (different from Google)
- More customizable

### Option C: react-leaflet
- Open-source (free)
- Limited distance calculation
- Would need own backend for distance

**Recommendation for your case:** Use Option A (@react-google-maps/api) because you need Google Maps Distance Matrix API anyway.

---

## 8. Testing Checklist

- [ ] Google Maps API calls work
- [ ] Distance calculation returns correct values
- [ ] Delivery charge formula works correctly
- [ ] Farmer can set pickup location
- [ ] Consumer can set delivery location
- [ ] Order displays correct delivery charge
- [ ] Different distances show different charges
- [ ] Minimum charge is applied when needed

---

## 9. Environment Variables Needed

```
# Google Maps
GOOGLE_MAPS_API_KEY=xxx
REACT_APP_GOOGLE_MAPS_API_KEY=xxx (for frontend)

# Delivery Settings
DELIVERY_CHARGE_PER_KM=5
MIN_DELIVERY_CHARGE=30
MAX_DELIVERY_CHARGE=200 (optional, for very long distances)
```

---

## 10. API Endpoints Overview

### New Endpoints to Create:

**POST** `/api/delivery/calculate-charge`
```json
{
  "pickupLocation": { "lat": 28.6139, "lng": 77.2090 },
  "deliveryLocation": { "lat": 28.5244, "lng": 77.1855 }
}
```
Response:
```json
{
  "distance": 15,
  "deliveryCharge": 75,
  "unit": "km"
}
```

**PUT** `/api/products/:id/location`
```json
{
  "pickupLocation": { "lat": 28.6139, "lng": 77.2090, "address": "Delhi" }
}
```

---

## Next Steps:
1. Set up Google Maps API and get API key
2. Create backend utility for distance calculation
3. Update Order model/controller
4. Create frontend location picker component
5. Integrate in AddProductForm and CartPage
6. Test with real addresses

**Let me know if you need clarification on any part!**
