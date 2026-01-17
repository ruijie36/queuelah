import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRestaurantById, subscribeToRestaurant } from '../services/restaurantService';
import { joinQueue } from '../services/queueService';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './CustomerRestaurantDetail.css';

const CustomerRestaurantDetail = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [partySize, setPartySize] = useState(2);
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Check authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Redirect to sign in if not authenticated
        navigate('/customer-signin');
      } else {
        setCurrentUser(user);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    loadRestaurant();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToRestaurant(restaurantId, (data) => {
      if (data) {
        setRestaurant(data);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [restaurantId]);

  const loadRestaurant = async () => {
    try {
      const data = await getRestaurantById(restaurantId);
      setRestaurant(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading restaurant:', error);
      setLoading(false);
    }
  };

  const handleJoinQueue = () => {
    setShowJoinModal(true);
  };

  const handleConfirmJoin = async () => {
    if (!currentUser) {
      setError('You must be signed in to join the queue');
      return;
    }

    if (!customerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!phoneNumber.trim() || phoneNumber.length < 8) {
      setError('Please enter a valid phone number');
      return;
    }

    if (partySize < (restaurant?.minPartySize || 1) || partySize > (restaurant?.maxPartySize || 10)) {
      setError(`Party size must be between ${restaurant?.minPartySize || 1} and ${restaurant?.maxPartySize || 10}`);
      return;
    }

    try {
      setJoining(true);
      setError('');

      console.log('Current user:', currentUser.uid);
      console.log('Attempting to join queue...');

      const queueId = await joinQueue(restaurantId, customerName, partySize, phoneNumber);
      
      // Show success modal then navigate to queue status
      setShowJoinModal(false);
      alert('✅ Successfully joined the queue!\n\n⚠️ Important: Please be present when your number is called. You will have a 10-minute grace period to return.');
      navigate(`/queue/${queueId}`);
    } catch (err) {
      console.error('Error joining queue:', err);
      setError(err.message);
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="customer-restaurant-detail">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading restaurant...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="customer-restaurant-detail">
        <div className="error-container">
          <h2>Restaurant not found</h2>
          <button onClick={() => navigate('/customer/dashboard')}>
            ← Back to Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-restaurant-detail">
      {/* Header */}
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/customer/dashboard')}>
          ← Back
        </button>
      </div>

      {/* Restaurant Info */}
      <div className="restaurant-info-card">
        <div className="restaurant-header">
          <h1>{restaurant.name}</h1>
          {restaurant.cuisine && (
            <span className="cuisine-badge">{restaurant.cuisine}</span>
          )}
        </div>

        {restaurant.queuePaused && (
          <div className="paused-alert">
            ⏸️ Queue is currently paused. Please check back later.
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <div className="stat-value">{restaurant.currentWaitTime || 0} min</div>
              <div className="stat-label">Estimated Wait Time</div>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-value">{restaurant.queueLength || 0}</div>
              <div className="stat-label">Parties in Queue</div>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon">🍽️</div>
            <div className="stat-content">
              <div className="stat-value">{restaurant.minPartySize || 1} - {restaurant.maxPartySize || 10}</div>
              <div className="stat-label">Party Size</div>
            </div>
          </div>
        </div>

        <button
          className="join-queue-btn"
          onClick={handleJoinQueue}
          disabled={restaurant.queuePaused || joining}
        >
          {restaurant.queuePaused ? 'Queue Paused' : 'Join Queue'}
        </button>
      </div>

      {/* Join Queue Modal */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Join Queue</h2>
              <button className="close-btn" onClick={() => setShowJoinModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="customerName">Your Name *</label>
                <input
                  type="text"
                  id="customerName"
                  className="form-input"
                  placeholder="Enter your name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number *</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  className="form-input"
                  placeholder="e.g., 91234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="partySize">Party Size *</label>
                <input
                  type="number"
                  id="partySize"
                  className="form-input"
                  min={restaurant.minPartySize || 1}
                  max={restaurant.maxPartySize || 10}
                  value={partySize}
                  onChange={(e) => setPartySize(parseInt(e.target.value))}
                  required
                />
                <p className="help-text">
                  Between {restaurant.minPartySize || 1} and {restaurant.maxPartySize || 10} people
                </p>
              </div>

              <div className="warning-box">
                <h4>⚠️ Important Notice</h4>
                <ul>
                  <li>Please be present when your queue number is called</li>
                  <li>You will have a <strong>10-minute grace period</strong> to return</li>
                  <li>If you don't return within 10 minutes, your spot will be forfeited</li>
                </ul>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setShowJoinModal(false)}
                  disabled={joining}
                >
                  Cancel
                </button>
                <button
                  className="confirm-btn"
                  onClick={handleConfirmJoin}
                  disabled={joining}
                >
                  {joining ? 'Joining...' : 'Confirm & Join Queue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerRestaurantDetail;
