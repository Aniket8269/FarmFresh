/**
 * Delivery Charge Calculator
 * Calculates distance-based delivery charges using Google Maps Distance Matrix API
 */

const axios = require('axios');
const { GOOGLE_MAPS_API_KEY, DELIVERY_CONFIG, API_ENDPOINTS } = require('../config/googleMaps');

/**
 * Calculate delivery charge based on distance
 * @param {Object} pickupLocation - {lat: number, lng: number}
 * @param {Object} deliveryLocation - {lat: number, lng: number}
 * @returns {Promise<Object>} {distance: number (km), deliveryCharge: number (₹)}
 */
async function calculateDeliveryCharge(pickupLocation, deliveryLocation) {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('GOOGLE_MAPS_API_KEY not configured. Add it to .env file');
    }

    // Validate coordinates
    if (!pickupLocation?.lat || !pickupLocation?.lng || !deliveryLocation?.lat || !deliveryLocation?.lng) {
      throw new Error('Invalid coordinates: Both pickup and delivery locations must have lat and lng');
    }

    // Call Google Maps Distance Matrix API
    const response = await axios.get(API_ENDPOINTS.DISTANCE_MATRIX, {
      params: {
        origins: `${pickupLocation.lat},${pickupLocation.lng}`,
        destinations: `${deliveryLocation.lat},${deliveryLocation.lng}`,
        key: GOOGLE_MAPS_API_KEY,
        units: 'metric', // Returns distance in kilometers
      },
      timeout: 5000,
    });

    // Check for API errors
    if (response.data.status !== 'OK') {
      console.error('Google Maps API Error:', response.data);
      throw new Error(`Google Maps API error: ${response.data.status}`);
    }

    if (!response.data.rows[0] || !response.data.rows[0].elements[0]) {
      throw new Error('No route found between pickup and delivery locations');
    }

    const element = response.data.rows[0].elements[0];

    // Check if route exists
    if (element.status !== 'OK') {
      console.error('Route status:', element.status);
      throw new Error(`Cannot calculate route: ${element.status}`);
    }

    // Extract distance in kilometers
    const distanceInMeters = element.distance.value;
    const distanceInKm = distanceInMeters / 1000;

    // Calculate delivery charge
    const charge = calculateCharge(distanceInKm);

    return {
      success: true,
      distance: parseFloat(distanceInKm.toFixed(2)), // Round to 2 decimals
      distanceInMeters,
      deliveryCharge: charge.amount,
      chargeBreakdown: charge.breakdown,
      estimatedTime: element.duration.text,
    };
  } catch (error) {
    console.error('Delivery charge calculation error:', error.message);
    return {
      success: false,
      error: error.message,
      distance: null,
      deliveryCharge: null,
    };
  }
}

/**
 * Calculate charge based on distance
 * @param {number} distanceKm - Distance in kilometers
 * @returns {Object} {amount: number, breakdown: Object}
 */
function calculateCharge(distanceKm) {
  const { chargePerKm, minimumCharge, maximumCharge } = DELIVERY_CONFIG;

  // Calculate base charge
  let charge = distanceKm * chargePerKm;

  // Apply minimum charge
  if (charge < minimumCharge) {
    charge = minimumCharge;
  }

  // Apply maximum charge cap (if needed for very long distances)
  if (charge > maximumCharge) {
    charge = maximumCharge;
  }

  return {
    amount: Math.round(charge), // Round to nearest rupee
    breakdown: {
      baseCost: distanceKm * chargePerKm,
      minimumChargeApplied: charge === minimumCharge,
      maximumChargeApplied: charge === maximumCharge,
      finalAmount: Math.round(charge),
    },
  };
}

/**
 * Geocode address to coordinates
 * @param {string} address - Address to geocode
 * @returns {Promise<Object>} {lat: number, lng: number, formattedAddress: string}
 */
async function geocodeAddress(address) {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('GOOGLE_MAPS_API_KEY not configured');
    }

    const response = await axios.get(API_ENDPOINTS.GEOCODING, {
      params: {
        address,
        key: GOOGLE_MAPS_API_KEY,
      },
      timeout: 5000,
    });

    if (response.data.status !== 'OK' || response.data.results.length === 0) {
      throw new Error(`Cannot find address: ${address}`);
    }

    const result = response.data.results[0];
    return {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      formattedAddress: result.formatted_address,
      placeId: result.place_id,
    };
  } catch (error) {
    console.error('Geocoding error:', error.message);
    throw error;
  }
}

/**
 * Reverse geocode coordinates to address
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} {address: string, ...details}
 */
async function reverseGeocodeCoordinates(lat, lng) {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('GOOGLE_MAPS_API_KEY not configured');
    }

    const response = await axios.get(API_ENDPOINTS.GEOCODING, {
      params: {
        latlng: `${lat},${lng}`,
        key: GOOGLE_MAPS_API_KEY,
      },
      timeout: 5000,
    });

    if (response.data.status !== 'OK' || response.data.results.length === 0) {
      throw new Error('Cannot find address for given coordinates');
    }

    const result = response.data.results[0];
    return {
      address: result.formatted_address,
      placeId: result.place_id,
      addressComponents: result.address_components,
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error.message);
    throw error;
  }
}

module.exports = {
  calculateDeliveryCharge,
  calculateCharge,
  geocodeAddress,
  reverseGeocodeCoordinates,
};
