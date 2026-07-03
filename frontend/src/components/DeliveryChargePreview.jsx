import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const DeliveryChargePreview = ({
  pickupLocation,
  deliveryLocation,
  loading = false
}) => {
  const [chargeData, setChargeData] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState(null);

  // Calculate delivery charge when locations change
  const calculateCharge = useCallback(async () => {
    try {
      setCalculating(true);
      setError(null);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/delivery/calculate-charge`,
        {
          pickupLocation: {
            lat: pickupLocation.lat,
            lng: pickupLocation.lng
          },
          deliveryLocation: {
            lat: deliveryLocation.lat,
            lng: deliveryLocation.lng
          }
        }
      );

      if (response.data.success) {
        setChargeData(response.data.data);
      } else {
        setError(response.data.message || 'Failed to calculate charge');
      }
    } catch (err) {
      console.error('Error calculating delivery charge:', err);
      setError(err.response?.data?.message || 'Error calculating delivery charge');
    } finally {
      setCalculating(false);
    }
  }, [pickupLocation, deliveryLocation]);

  useEffect(() => {
    if (pickupLocation && deliveryLocation) {
      calculateCharge();
    }
  }, [pickupLocation, deliveryLocation, calculateCharge]);

  if (!pickupLocation || !deliveryLocation) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600 text-sm">
          Select both pickup and delivery locations to see estimated delivery charge
        </p>
      </div>
    );
  }

  if (calculating || loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 mr-2"></div>
        <p className="text-gray-600 text-sm">Calculating delivery charge...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-700 text-sm">{error}</p>
        <button
          onClick={calculateCharge}
          className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!chargeData) {
    return null;
  }

  return (
    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
      <div className="flex justify-between items-center mb-3">
        <span className="font-medium text-gray-800">Delivery Charge Estimate</span>
        <span className="text-2xl font-bold text-green-600">₹{chargeData.deliveryCharge}</span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Distance:</span>
          <span className="font-medium">{chargeData.distance} km</span>
        </div>

        {chargeData.estimatedTime && (
          <div className="flex justify-between">
            <span className="text-gray-600">Estimated Time:</span>
            <span className="font-medium">{chargeData.estimatedTime}</span>
          </div>
        )}

        {chargeData.chargeBreakdown && (
          <div className="mt-3 pt-3 border-t border-green-200">
            <p className="text-gray-600 text-xs font-medium mb-2">Charge Breakdown:</p>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Base Cost:</span>
                <span>₹{Math.round(chargeData.chargeBreakdown.baseCost)}</span>
              </div>
              {chargeData.chargeBreakdown.minimumChargeApplied && (
                <div className="text-green-700">
                  <span>Minimum charge applied</span>
                </div>
              )}
              {chargeData.chargeBreakdown.maximumChargeApplied && (
                <div className="text-orange-700">
                  <span>Maximum charge applied</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={calculateCharge}
        className="mt-3 w-full text-green-600 hover:text-green-800 text-xs font-medium"
      >
        Refresh Estimate
      </button>
    </div>
  );
};

export default DeliveryChargePreview;
