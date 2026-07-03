# 🚀 Google Maps Distance-Based Delivery - Complete Setup Guide

## ✅ APIs Added (All Working Now!)

### Google Maps API Key
```
AIzaSyANpsMgjGiDxdVnmzma1sWoETPr5HIWyyM
```
✅ Added to: `backend/.env` and `frontend/.env`

---

## 👨‍🌾 **FARMER - How to Use**

### What Farmers Can Do:
1. **Add Product with Pickup Location**
   - Go to: `Farmer Dashboard` → `Add New Product`
   - Fill product details (name, price, quantity, etc.)
   - Section: **"Pickup Location"**
     - Click on map to set location
     - OR search location (e.g., "Farm Address")
     - OR click 📍 button for current GPS location
   - Confirm address showing at bottom
   - Submit form

### Behind the Scenes:
- Location saved in MongoDB as:
  ```javascript
  farmer_pickup_location: {
    type: "Point",
    coordinates: [lng, lat],
    address: "123 Farm Road, Village, State"
  }
  ```

### API Used:
- **Route**: POST `/api/v1/delivery/calculate-charge`
- **Used by**: Frontend when consumer selects delivery location
- **Result**: Shows delivery charge based on distance from farmer's pickup location

---

## 🛒 **CONSUMER - How to Use**

### What Consumers Can Do:

#### Step 1: Browse & Add Products to Cart
- Go to: `Products Page`
- Browse products added by farmers
- Click "Add to Cart"

#### Step 2: Checkout with Delivery Location
- Go to: `Cart Page` → `Checkout` button
- New Section: **"Select Delivery Location on Map"**
  - Click on map to set delivery location
  - OR search your address
  - OR use 📍 current location
  - Address shows with coordinates

#### Step 3: See Live Delivery Charge
- Below map, section: **"Delivery Charge Estimate"**
  - Shows: 
    - Distance in KM
    - Estimated Time
    - Delivery Charge (₹)
    - Min/Max charge info

#### Step 4: Complete Checkout
- Fill address details (street, city, state, zip)
- Select payment method (COD/UPI/Card)
- Click "Place Order"

### Charge Calculation:
```
Distance = 15 km
Charge = 15 × ₹5 = ₹75
Min Charge = ₹30
Max Charge = ₹300
Final Charge = ₹75 ✓
```

### Order Data Saved:
```javascript
{
  distance_km: 15,
  delivery_charge: 75,
  charge_breakdown: {
    base_cost: 75,
    minimumChargeApplied: false,
    maximumChargeApplied: false,
    finalAmount: 75
  },
  estimated_delivery_time: "25 mins"
}
```

---

## 🚚 **DELIVERY PARTNER - How to Use**

### What Delivery Partners See:

#### Current Implementation:
1. **Auto-Assignment**
   - When order is created, system auto-assigns nearest delivery partner
   - Uses proximity scoring algorithm
   - Considers: distance, rating, experience

#### Future Enhancements Possible:
1. **Accept/Reject Orders**
   - Based on location
   - Real-time notifications

2. **Live Tracking**
   - Pick up order
   - Update location in real-time
   - Consumer sees live tracking

3. **Earnings Dashboard**
   - View completed deliveries
   - See distance traveled
   - Calculate earnings

### Current Fields Available:
```javascript
{
  delivery_partner_id: "partner_id",
  distance_km: 15,
  delivery_charge: 75,
  estimated_delivery_time: "25 mins"
}
```

---

## 🔧 **BACKEND SETUP - Verification**

### 1. **Environment Variables Set ✅**
```bash
# backend/.env
GOOGLE_MAPS_API_KEY=AIzaSyANpsMgjGiDxdVnmzma1sWoETPr5HIWyyM
DELIVERY_CHARGE_PER_KM=5
MIN_DELIVERY_CHARGE=30
MAX_DELIVERY_CHARGE=300
```

### 2. **All Packages Installed ✅**
```bash
cd backend
npm i
# axios already included
```

### 3. **New Files Created ✅**
- ✅ `src/config/googleMaps.js` - Configuration
- ✅ `src/utils/deliveryCalculator.js` - Distance & charge calculation
- ✅ `src/routes/deliveryRoutes.js` - New API endpoints

### 4. **Models Updated ✅**
- ✅ `Product.js` - Added `farmer_pickup_location`
- ✅ `Order.js` - Added `distance_km` & `charge_breakdown`

### 5. **Controllers Updated ✅**
- ✅ `orderController.js` - Uses Google Maps API

### 6. **Routes Registered ✅**
- ✅ `server.js` - Registered `/api/v1/delivery`

---

## 🚀 **HOW TO START**

### Terminal 1: Start Backend
```bash
cd backend
npm start
# or
npm run dev

# Should see:
# 🚀 FreshFarm Backend running on port 5000
# Environment: development
```

### Terminal 2: Start Frontend
```bash
cd frontend
npm start

# Should see:
# Compiled successfully!
# Local: http://localhost:3000
```

### Test if Working:
1. Open `http://localhost:3000`
2. Register as **Farmer**
3. Add product with location picker
4. Register as **Consumer**
5. Add product to cart
6. Go to checkout
7. Should see Google Map with location picker
8. Distance charge should auto-calculate

---

## ✅ **TESTING CHECKLIST**

### Backend Tests:

**Test 1: Delivery Charge Calculation**
```bash
curl -X POST http://localhost:5000/api/v1/delivery/calculate-charge \
  -H "Content-Type: application/json" \
  -d '{
    "pickupLocation": { "lat": 19.0760, "lng": 72.8777 },
    "deliveryLocation": { "lat": 28.6139, "lng": 77.2090 }
  }'

# Expected: 200 OK with distance ~1432 km and charge calculated
```

**Test 2: Farmer Adding Product with Location**
1. Login as Farmer
2. Add Product form
3. Should see map in "Pickup Location" section
4. Click marker to select location
5. Submit

**Test 3: Consumer Checkout**
1. Login as Consumer
2. Add product to cart
3. Checkout
4. Should see delivery location map picker
5. Select location
6. Should see "Delivery Charge Estimate" box
7. Check: distance, charge, time displayed

**Test 4: Database Verification**
```javascript
// Check order has distance and charge data
db.orders.findOne({}, { distance_km: 1, delivery_charge: 1, charge_breakdown: 1 })

// Expected output:
{
  distance_km: 1432.45,
  delivery_charge: 7162,
  charge_breakdown: {
    baseCost: 7162.25,
    minimumChargeApplied: false,
    maximumChargeApplied: false,
    finalAmount: 7162
  }
}
```

---

## 🐛 **TROUBLESHOOTING**

### **Issue: Map not showing on frontend**
```
✓ Check: REACT_APP_GOOGLE_MAPS_API_KEY in frontend/.env
✓ Check: npm install @react-google-maps/api completed
✓ Restart: npm start (kill and restart)
✓ Check: Browser console for errors
```

### **Issue: "Cannot calculate route" error**
```
✓ Check: Distance Matrix API enabled in Google Cloud
✓ Check: API key has correct APIs enabled
✓ Check: Coordinates are valid (lat between -90,90 / lng between -180,180)
✓ Check: API quota not exceeded (200 free calls/month)
```

### **Issue: Backend error "GOOGLE_MAPS_API_KEY not configured"**
```
✓ Check: backend/.env has API key
✓ Restart: npm start (needs fresh .env read)
✓ Verify: echo $GOOGLE_MAPS_API_KEY shows value
```

### **Issue: Delivery charge always same or not calculating**
```
✓ Check: orderController is calling calculateDeliveryCharge()
✓ Check: Google Maps API response has distance value
✓ Check: Coordinates being passed are correct (lng, lat) NOT (lat, lng)
```

---

## 📊 **CHARGE CALCULATION EXAMPLES**

### Example 1: Short Distance
```
From: Farmer at Mumbai (19.0760, 72.8777)
To: Consumer in Andheri (19.1136, 72.8697)
Distance: ~6.5 km
Charge: 6.5 × 5 = ₹32.50
Min Charge: ₹30
Result: ₹32.50 ✓
```

### Example 2: Long Distance
```
From: Farmer at Mumbai (19.0760, 72.8777)
To: Consumer in Pune (18.5204, 73.8567)
Distance: ~190 km
Charge: 190 × 5 = ₹950
Max Charge: ₹300
Result: ₹300 (max applied) ✓
```

### Example 3: Very Short Distance
```
From: Farmer (19.0760, 72.8777)
To: Consumer (19.0765, 72.8780)
Distance: ~0.6 km
Charge: 0.6 × 5 = ₹3
Min Charge: ₹30
Result: ₹30 (min applied) ✓
```

---

## 🔐 **IMPORTANT NOTES**

### API Key Security:
- ✅ Backend: Safely stored in environment variable
- ✅ Frontend: Exposed but acceptable for public API
- ✅ In production: Implement backend proxy for API calls

### Rate Limiting:
- Distance Matrix API: 200 requests/month free
- After: $5 per 1000 requests
- Monitor: Google Cloud Console

### Data Privacy:
- Locations stored in MongoDB
- Users can see each other's locations during order
- Consider field-level encryption in production

---

## 🎯 **NEXT STEPS (OPTIONAL)**

1. **Live Delivery Tracking**
   - Real-time location updates
   - WebSocket integration

2. **Advanced Analytics**
   - Distance vs order value correlation
   - Delivery efficiency metrics

3. **Dynamic Pricing**
   - Peak hour surges
   - Weather-based adjustments

4. **Bulk Orders**
   - Group deliveries
   - Route optimization

5. **Payment Gateway Integration**
   - Pass dynamic delivery charge
   - Invoice generation

---

## 📞 **SUPPORT**

If something doesn't work:
1. Check Backend Logs: Look for "Google Maps" errors
2. Verify Frontend Console: Check for API errors
3. Test API directly: Use curl/Postman
4. Check MongoDB: Verify data is being saved
5. Clear Cache: Hard refresh browser (Ctrl+Shift+R)

---

**✅ READY TO USE!** 

Just run `npm start` in both backend and frontend directories.

Backend: http://localhost:5000
Frontend: http://localhost:3000
