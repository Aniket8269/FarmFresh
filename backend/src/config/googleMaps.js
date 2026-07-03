/**
 * Google Maps Configuration
 * Handles all Google Maps API settings and delivery charge calculations
 */

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

// Delivery charge configuration
const DELIVERY_CONFIG = {
  chargePerKm: parseFloat(process.env.DELIVERY_CHARGE_PER_KM) || 5, // ₹ per km
  minimumCharge: parseFloat(process.env.MIN_DELIVERY_CHARGE) || 30, // Minimum charge in ₹
  maximumCharge: parseFloat(process.env.MAX_DELIVERY_CHARGE) || 300, // Maximum charge in ₹
  freeDeliveryAbove: parseFloat(process.env.FREE_DELIVERY_ABOVE) || 0, // Free delivery for orders above this amount (0 = disabled)
};

// Google Maps API endpoints
const API_ENDPOINTS = {
  DISTANCE_MATRIX: 'https://maps.googleapis.com/maps/api/distancematrix/json',
  GEOCODING: 'https://maps.googleapis.com/maps/api/geocode/json',
  PLACES_AUTOCOMPLETE: 'https://maps.googleapis.com/maps/api/place/autocomplete/json',
};

module.exports = {
  GOOGLE_MAPS_API_KEY,
  DELIVERY_CONFIG,
  API_ENDPOINTS,
};
