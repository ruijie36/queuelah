import { useState, useEffect } from 'react';
import { getRestaurants } from '../services/restaurantService';
import RestaurantCard from './RestaurantCard';
import './RestaurantList.css';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const data = await getRestaurants();
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
        <h2>All Restaurants</h2>
        <div className="loading">Loading restaurants...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="restaurant-list">
        <h2>All Restaurants</h2>
        <div className="error">{error}</div>
        <button onClick={fetchRestaurants}>Retry</button>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="restaurant-list">
        <h2>All Restaurants</h2>
        <p>No restaurants available yet.</p>
      </div>
    );
  }

  return (
    <div className="restaurant-list">
      <h2>All Restaurants</h2>
      <div className="restaurant-grid">
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
};

export default RestaurantList;
