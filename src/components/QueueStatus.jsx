import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { subscribeToQueueEntry, cancelQueueEntry } from '../services/queueService';
import { getRestaurantById } from '../services/restaurantService';
import './QueueStatus.css';

const QueueStatus = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [queueEntry, setQueueEntry] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to queue entry updates
    const unsubscribe = subscribeToQueueEntry(id, async (entry) => {
      setQueueEntry(entry);
      
      if (entry && !restaurant) {
        // Load restaurant info
        const restaurantData = await getRestaurantById(entry.restaurantId);
        setRestaurant(restaurantData);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to leave the queue?')) {
      try {
        await cancelQueueEntry(id);
        navigate('/');
      } catch (error) {
        console.error('Error cancelling queue entry:', error);
        alert('Failed to cancel. Please try again.');
      }
    }
  };

  const getStatusMessage = () => {
    if (!queueEntry) return '';
    
    switch (queueEntry.status) {
      case 'waiting':
        if (queueEntry.readyToReturn) {
          return '🔔 Please return to the restaurant now! You are approaching the front of the queue.';
        }
        if (queueEntry.position <= 3) {
          return "You're almost there! Please be ready to return soon.";
        }
        return 'Please wait for your turn.';
      case 'called':
        return '🔔 Your table is ready! Please proceed to the host stand NOW.';
      case 'seated':
        return 'Enjoy your meal!';
      case 'cancelled':
        return 'Your queue entry has been cancelled.';
      case 'skipped':
        return 'You were skipped for not returning in time. Please join the queue again.';
      default:
        return '';
    }
  };

  const getStatusClass = () => {
    if (!queueEntry) return '';
    
    switch (queueEntry.status) {
      case 'called':
        return 'status-called';
      case 'waiting':
        if (queueEntry.readyToReturn) return 'status-ready-return';
        return queueEntry.position <= 3 ? 'status-almost-ready' : 'status-waiting';
      default:
        return '';
    }
  };

  const getGracePeriodRemaining = () => {
    if (!queueEntry?.gracePeriodExpiry) return null;
    const expiry = new Date(queueEntry.gracePeriodExpiry.seconds * 1000);
    const now = new Date();
    const remaining = Math.max(0, Math.floor((expiry - now) / 1000 / 60));
    return remaining;
  };

  if (loading) {
    return (
      <div className="queue-status">
        <div className="loading">Loading your queue status...</div>
      </div>
    );
  }

  if (!queueEntry) {
    return (
      <div className="queue-status">
        <div className="error">Queue entry not found</div>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="queue-status">
      <div className="queue-header">
        <h1>{restaurant?.name}</h1>
        <p className="restaurant-address">{restaurant?.address}</p>
      </div>

      <div className={`status-card ${getStatusClass()}`}>
        <div className="status-message">
          {getStatusMessage()}
        </div>

        {queueEntry.readyToReturn && queueEntry.status === 'waiting' && (
          <div className="return-notice">
            <div className="notice-icon">🏃‍♂️</div>
            <div className="notice-text">Please return within {getGracePeriodRemaining()} minutes</div>
            <div className="notice-subtext">or you may be skipped</div>
          </div>
        )}

        <div className="queue-details">
          <div className="detail-row">
            <span className="label">Name:</span>
            <span className="value">{queueEntry.customerName}</span>
          </div>
          <div className="detail-row">
            <span className="label">Party Size:</span>
            <span className="value">{queueEntry.partySize}</span>
          </div>
          <div className="detail-row">
            <span className="label">Phone:</span>
            <span className="value">{queueEntry.phoneNumber}</span>
          </div>
          {queueEntry.isWalkIn && (
            <div className="detail-row">
              <span className="label">Type:</span>
              <span className="value walk-in-label">Walk-In</span>
            </div>
          )}
        </div>

        {queueEntry.status === 'waiting' && (
          <>
            <div className="position-display">
              <div className="position-number">{queueEntry.position}</div>
              <div className="position-label">Position in Queue</div>
            </div>

            <div className="wait-time">
              <span className="wait-time-value">
                {queueEntry.waitTimeRange 
                  ? `${queueEntry.waitTimeRange.min}-${queueEntry.waitTimeRange.max}`
                  : queueEntry.estimatedWaitTime}
              </span>
              <span className="wait-time-label">minutes estimated wait</span>
            </div>
          </>
        )}

        {queueEntry.status === 'called' && (
          <div className="called-notice">
            <div className="notice-icon">🔔</div>
            <div className="notice-text">Please head to the restaurant!</div>
          </div>
        )}
      </div>

      <div className="queue-actions">
        {queueEntry.status === 'waiting' && (
          <button className="cancel-button" onClick={handleCancel}>
            Leave Queue
          </button>
        )}
        <button className="home-button" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default QueueStatus;
