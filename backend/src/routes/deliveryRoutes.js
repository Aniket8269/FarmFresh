/**
 * Delivery Routes
 * Handles delivery-related API endpoints like charge calculation
 */

const express = require('express');
const router = express.Router();
const { calculateDeliveryCharge, geocodeAddress, reverseGeocodeCoordinates } = require('../utils/deliveryCalculator');
const { authMiddleware } = require('../middleware/auth');

/**
 * POST /api/delivery/calculate-charge
 * Calculate delivery charge based on pickup and delivery coordinates
 * Public endpoint - can be called before authentication
 */
router.post('/calculate-charge', async (req, res) => {
  try {
    const { pickupLocation, deliveryLocation } = req.body;

    // Validation
    if (!pickupLocation || !deliveryLocation) {
      return res.status(400).json({
        success: false,
        message: 'Both pickupLocation and deliveryLocation are required',
        required: ['pickupLocation { lat, lng }', 'deliveryLocation { lat, lng }']
      });
    }

    if (!pickupLocation.lat || !pickupLocation.lng) {
      return res.status(400).json({
        success: false,
        message: 'Pickup location must have lat and lng'
      });
    }

    if (!deliveryLocation.lat || !deliveryLocation.lng) {
      return res.status(400).json({
        success: false,
        message: 'Delivery location must have lat and lng'
      });
    }

    // Calculate charge
    const result = await calculateDeliveryCharge(pickupLocation, deliveryLocation);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to calculate delivery charge',
        error: result.error
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Delivery charge calculated successfully',
      data: {
        distance: result.distance,
        distanceInMeters: result.distanceInMeters,
        deliveryCharge: result.deliveryCharge,
        estimatedTime: result.estimatedTime,
        chargeBreakdown: result.chargeBreakdown
      }
    });
  } catch (error) {
    console.error('Delivery charge calculation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error calculating delivery charge',
      error: error.message
    });
  }
});

/**
 * POST /api/delivery/geocode
 * Convert address to coordinates
 * Authenticated endpoint
 */
router.post('/geocode', authMiddleware, async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }

    const result = await geocodeAddress(address);

    return res.status(200).json({
      success: true,
      message: 'Address geocoded successfully',
      data: result
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    return res.status(400).json({
      success: false,
      message: 'Error geocoding address',
      error: error.message
    });
  }
});

/**
 * POST /api/delivery/reverse-geocode
 * Convert coordinates to address
 * Authenticated endpoint
 */
router.post('/reverse-geocode', authMiddleware, async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const result = await reverseGeocodeCoordinates(lat, lng);

    return res.status(200).json({
      success: true,
      message: 'Coordinates reverse geocoded successfully',
      data: result
    });
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return res.status(400).json({
      success: false,
      message: 'Error reverse geocoding coordinates',
      error: error.message
    });
  }
});

module.exports = router;
