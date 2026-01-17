import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRestaurants } from '../services/restaurantService';
import { auth } from '../config/firebase';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const cuisines = ['All', 'Chinese', 'Japanese', 'Korean', 'Italian', 'Western', 'Indian', 'Thai', 'Local'];

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    filterRestaurants();
  }, [selectedCuisine, searchQuery, restaurants]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const data = await getRestaurants();
      setRestaurants(data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRestaurants = () => {
    let filtered = restaurants;

    // Filter by cuisine
    if (selectedCuisine !== 'All') {
      filtered = filtered.filter(r => r.cuisine === selectedCuisine);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredRestaurants(filtered);
  };

  const handleRestaurantClick = (restaurantId) => {
    navigate(`/customer/restaurant/${restaurantId}`);
  };

  const handleSignOut = async () => {
    await auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="customer-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading restaurants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-dashboard">
      {/* Header */}
      <div className="customer-header">
        <div className="header-content">
          <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>🍽️ Queuelah</h1>
          <p>Browse restaurants and join queues</p>
        </div>
        <button className="sign-out-btn" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search restaurants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Cuisine Filters */}
      <div className="cuisine-filters">
        <h3>Filter by Cuisine</h3>
        <div className="cuisine-buttons">
          {cuisines.map(cuisine => (
            <button
              key={cuisine}
              className={`cuisine-btn ${selectedCuisine === cuisine ? 'active' : ''}`}
              onClick={() => setSelectedCuisine(cuisine)}
            >
              {cuisine}
            </button>
          ))}
        </div>
      </div>

      {/* Restaurant Grid */}
      <div className="restaurants-section">
        <div className="section-header">
          <h2>Available Restaurants</h2>
          <p className="restaurant-count">{filteredRestaurants.length} restaurants found</p>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="empty-state">
            <p>No restaurants found matching your criteria.</p>
          </div>
        ) : (
          <div className="restaurant-grid">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="restaurant-card"
                onClick={() => handleRestaurantClick(restaurant.id)}
              >
                <div className="card-header">
                  <h3>{restaurant.name}</h3>
                  {restaurant.cuisine && (
                    <span className="cuisine-tag">{restaurant.cuisine}</span>
                  )}
                </div>

                <div className="card-body">
                  <div className="info-row">
                    <span className="icon">⏱️</span>
                    <span className="label">Est. Wait:</span>
                    <span className="value">{restaurant.currentWaitTime || 0} min</span>
                  </div>

                  <div className="info-row">
                    <span className="icon">👥</span>
                    <span className="label">In Queue:</span>
                    <span className="value">{restaurant.queueLength || 0} parties</span>
                  </div>

                  {restaurant.queuePaused && (
                    <div className="paused-badge">Queue Paused</div>
                  )}
                </div>

                <div className="card-footer">
                  <button className="view-details-btn">
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
