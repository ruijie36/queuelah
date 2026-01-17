import { useState, useEffect } from 'react';
import { getNearbyRestaurants } from '../services/restaurantService';
import RestaurantCard from './RestaurantCard';
import './RestaurantList.css';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use default location (San Francisco) if user denies location
          setUserLocation({ lat: 37.7749, lng: -122.4194 });
        }
      );
    } else {
      // Use default location if geolocation is not supported
      setUserLocation({ lat: 37.7749, lng: -122.4194 });
    }
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchRestaurants();
    }
  }, [userLocation]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const data = await getNearbyRestaurants(userLocation.lat, userLocation.lng, 10);
      setRestaurants(data);
      setError(null);
    } catch (err) {
      setError('Failed to load restaurants. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="restaurant-list">
        <h2>Nearby Restaurants</h2>
        <div className="loading">Loading restaurants...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="restaurant-list">
        <h2>Nearby Restaurants</h2>
        <div className="error">{error}</div>
        <button onClick={fetchRestaurants}>Retry</button>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="restaurant-list">
        <h2>Nearby Restaurants</h2>
        <p>No restaurants found nearby.</p>
      </div>
    );
  }

  return (
    <div className="restaurant-list">
      <h2>Nearby Restaurants</h2>
      <div className="restaurant-grid">
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
};

export default RestaurantList;
