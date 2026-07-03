/**
 * Google Maps Location Picker Component
 * Allows users to select location on a map or search by address
 */

import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker, Autocomplete, useLoadScript } from '@react-google-maps/api';
import toast from 'react-hot-toast';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
  border: '1px solid #5eead4'
};

const defaultCenter = {
  lat: 19.0760,
  lng: 72.8777 // Default: Mumbai, India
};

const GoogleMapsLocationPicker = ({
  onLocationSelect,
  initialLocation = null,
  placeholder = 'Search location...',
  showAddress = true,
  readOnly = false
}) => {
  const [location, setLocation] = useState(initialLocation || defaultCenter);
  const [address, setAddress] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places', 'geocoding']
  });

  // Initialize reverse geocoding on mount or when location changes
  useEffect(() => {
    if (location && isLoaded) {
      reverseGeocodeLocation(location);
    }
  }, [location, isLoaded]);

  // Reverse geocode coordinates to get address
  const reverseGeocodeLocation = async (coords) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const formattedAddress = data.results[0].formatted_address;
        setAddress(formattedAddress);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  // Handle map click to set location
  const handleMapClick = (e) => {
    if (readOnly) return;

    const newLocation = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    setLocation(newLocation);

    if (onLocationSelect) {
      onLocationSelect({
        lat: newLocation.lat,
        lng: newLocation.lng,
        address
      });
    }
  };

  // Handle autocomplete place selection
  const handlePlaceSelect = () => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();

    if (!place.geometry) {
      toast.error('Please select a valid location');
      return;
    }

    const newLocation = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    };

    setLocation(newLocation);
    setAddress(place.formatted_address || '');
    setSearchInput('');

    if (onLocationSelect) {
      onLocationSelect({
        lat: newLocation.lat,
        lng: newLocation.lng,
        address: place.formatted_address
      });
    }

    // Pan map to the new location
    if (mapRef.current) {
      mapRef.current.panTo(newLocation);
    }
  };

  // Handle current location button
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setLocation(newLocation);

        if (onLocationSelect) {
          onLocationSelect({
            lat: newLocation.lat,
            lng: newLocation.lng,
            address
          });
        }

        toast.success('Location updated');
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Failed to get current location');
      }
    );
  };

  if (loadError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">
          Error loading Google Maps. Please check your API key configuration.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg h-96 flex items-center justify-center">
        <p className="text-gray-600">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Search Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Location
        </label>
        <div className="flex gap-2">
          <Autocomplete
            onLoad={(autocomplete) => {
              autocompleteRef.current = autocomplete;
            }}
            onPlaceChanged={handlePlaceSelect}
            options={{
              componentRestrictions: { country: 'in' } // Restrict to India
            }}
          >
            <input
              type="text"
              placeholder={placeholder}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={readOnly}
            />
          </Autocomplete>
          {!readOnly && (
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              title="Use current location"
            >
              📍
            </button>
          )}
        </div>
      </div>

      {/* Map */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={13}
        center={location}
        onClick={handleMapClick}
        onLoad={(map) => {
          mapRef.current = map;
        }}
        options={{
          restriction: {
            latLngBounds: {
              north: 35.5,
              south: 5.0,
              east: 101.0,
              west: 60.0
            }
          }
        }}
      >
        <Marker position={location} draggable={!readOnly} onDragEnd={handleMapClick} />
      </GoogleMap>

      {/* Display selected address */}
      {showAddress && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 font-medium">Selected Address:</p>
          <p className="text-gray-900">{address || 'No address selected'}</p>
          <p className="text-xs text-gray-500 mt-2">
            Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
          </p>
        </div>
      )}
    </div>
  );
};

export default GoogleMapsLocationPicker;
