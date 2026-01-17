import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRestaurantById, subscribeToRestaurant } from '../services/restaurantService';
import { joinQueue } from '../services/queueService';
import './RestaurantDetail.css';

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    partySize: 2,
    phone: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRestaurant();
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToRestaurant(id, (data) => {
      setRestaurant(data);
    });

    return () => unsubscribe();
  }, [id]);

  const loadRestaurant = async () => {
    try {
      const data = await getRestaurantById(id);
      setRestaurant(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to load restaurant');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      setError('Please fill in all fields');
      return;
    }

    if (restaurant.queuePaused) {
      setError('Queue is currently paused. Please try again later.');
      return;
    }

    const partySize = parseInt(formData.partySize);
    if (restaurant.maxPartySize && partySize > restaurant.maxPartySize) {
      setError(`Maximum party size is ${restaurant.maxPartySize} people`);
      return;
    }
    if (restaurant.minPartySize && partySize < restaurant.minPartySize) {
      setError(`Minimum party size is ${restaurant.minPartySize} people`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const queueId = await joinQueue(
        id,
        formData.name,
        partySize,
        formData.phone
      );
      
      // Navigate to queue status page
      navigate(`/queue/${queueId}`);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to join queue. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="restaurant-detail"><div className="loading">Loading...</div></div>;
  }

  if (!restaurant) {
    return <div className="restaurant-detail"><div className="error">Restaurant not found</div></div>;
  }

  return (
    <div className="restaurant-detail">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Back to Restaurants
      </button>

      <div className="restaurant-header">
        {restaurant.imageUrl && (
          <img src={restaurant.imageUrl} alt={restaurant.name} className="restaurant-banner" />
        )}
        <h1>{restaurant.name}</h1>
        <p className="cuisine">{restaurant.cuisine}</p>
        <p className="address">{restaurant.address}</p>
        <p className="phone">{restaurant.phone}</p>
      </div>

      <div className="queue-info">
        <h2>Current Queue Status</h2>
        {restaurant.queuePaused && (
          <div className="queue-paused-notice">
            ⏸️ Queue is currently paused
          </div>
        )}
        <div className="wait-stats">
          <div className="stat-box">
            <div className="stat-value">{restaurant.currentWaitTime || 0}</div>
            <div className="stat-label">Avg Wait (min)</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{restaurant.queueLength || 0}</div>
            <div className="stat-label">Parties Ahead</div>
          </div>
        </div>
        {restaurant.minPartySize || restaurant.maxPartySize ? (
          <div className="party-size-info">
            Party size: {restaurant.minPartySize || 1} - {restaurant.maxPartySize || 20} people
          </div>
        ) : null}
      </div>

      <div className="join-queue-form">
        <h2>Join the Queue</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="partySize">Party Size *</label>
            <select
              id="partySize"
              name="partySize"
              value={formData.partySize}
              onChange={handleInputChange}
              required
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(size => (
                <option key={size} value={size}>{size} {size === 1 ? 'person' : 'people'}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="(555) 123-4567"
              required
            />
          </div>

          <button type="submit" className="submit-button" disabled={submitting || restaurant.status === 'closed' || restaurant.queuePaused}>
            {submitting ? 'Joining...' : restaurant.queuePaused ? 'Queue Paused' : 'Join Queue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RestaurantDetail;
