import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  subscribeToRestaurantQueue, 
  callNextParty, 
  removeFromQueue, 
  markAsSeated,
  toggleQueuePause,
  isPeakHours,
  calculateQueueIntensity
} from '../services/queueService';
import { getRestaurantById, subscribeToRestaurant } from '../services/restaurantService';
import './Dashboard.css';

const Dashboard = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timers, setTimers] = useState({}); // Track timers for each party
  const [missedQueue, setMissedQueue] = useState([]); // Parties that missed their turn

  useEffect(() => {
    loadRestaurant();
    
    // Subscribe to restaurant updates
    const unsubscribeRestaurant = subscribeToRestaurant(restaurantId, (data) => {
      setRestaurant(data);
    });
    
    // Subscribe to queue updates
    const unsubscribeQueue = subscribeToRestaurantQueue(restaurantId, (queueData) => {
      setQueue(queueData);
      setLoading(false);
    });

    return () => {
      unsubscribeRestaurant();
      unsubscribeQueue();
    };
  }, [restaurantId]);

  const loadRestaurant = async () => {
    try {
      const data = await getRestaurantById(restaurantId);
      setRestaurant(data);
    } catch (error) {
      console.error('Error loading restaurant:', error);
    }
  };

  const handleAdmit = async (entryId) => {
    try {
      await markAsSeated(entryId);
    } catch (error) {
      console.error('Error admitting party:', error);
      alert('Failed to admit party');
    }
  };

  const handleStartTimer = (entry) => {
    const timerDuration = restaurant?.notificationTimer || 10; // Default 10 minutes
    const expiryTime = Date.now() + (timerDuration * 60 * 1000);
    
    setTimers(prev => ({
      ...prev,
      [entry.id]: {
        expiryTime,
        duration: timerDuration
      }
    }));

    // Set timeout to move to missed queue
    setTimeout(() => {
      handleMissedParty(entry);
    }, timerDuration * 60 * 1000);
  };

  const handleMissedParty = (entry) => {
    setMissedQueue(prev => [...prev, { ...entry, missedAt: new Date() }]);
    setTimers(prev => {
      const newTimers = { ...prev };
      delete newTimers[entry.id];
      return newTimers;
    });
  };

  const handleCancelTimer = (entryId) => {
    setTimers(prev => {
      const newTimers = { ...prev };
      delete newTimers[entryId];
      return newTimers;
    });
  };

  const handleRemoveFromMissed = async (entryId) => {
    try {
      await removeFromQueue(entryId);
      setMissedQueue(prev => prev.filter(p => p.id !== entryId));
    } catch (error) {
      console.error('Error removing from missed queue:', error);
    }
  };

  const handleTogglePause = async () => {
    try {
      await toggleQueuePause(restaurantId, !restaurant?.queuePaused);
    } catch (error) {
      console.error('Error toggling pause:', error);
      alert('Failed to toggle queue pause');
    }
  };

  const navigateToQueueDetails = () => {
    navigate(`/dashboard/${restaurantId}/queue`);
  };

  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60); // minutes
    
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff} min ago`;
    const hours = Math.floor(diff / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  };

  const getRemainingTime = (entryId) => {
    const timer = timers[entryId];
    if (!timer) return null;
    
    const remaining = Math.max(0, Math.floor((timer.expiryTime - Date.now()) / 1000 / 60));
    return remaining;
  };

  // Calculate total people waiting
  const totalWaiting = queue.length;
  const avgWaitTime = restaurant?.currentWaitTime || 0;

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const isPeak = isPeakHours();
  const frontQueue = queue.slice(0, 5); // First 5 parties for quick view

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header" data-aos="fade-down">
        <div className="header-content">
          <h1>{restaurant?.name}</h1>
          <p className="subtitle">Queue Management</p>
        </div>
        <button 
          className={`pause-toggle ${restaurant?.queuePaused ? 'paused' : ''}`}
          onClick={handleTogglePause}
        >
          {restaurant?.queuePaused ? 'Resume Queue' : 'Pause Queue'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" data-aos="fade-up" data-aos-delay="100">
        <div className="stat-card" onClick={navigateToQueueDetails} data-aos="fade-up" data-aos-delay="150">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{totalWaiting}</div>
            <div className="stat-label">People in Queue</div>
          </div>
          <div className="stat-arrow">→</div>
        </div>
        
        <div className="stat-card" data-aos="fade-up" data-aos-delay="200">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-value">{avgWaitTime}</div>
            <div className="stat-label">Avg Wait Time (min)</div>
          </div>
        </div>
        
        <div className="stat-card" data-aos="fade-up" data-aos-delay="250">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{queue.filter(q => q.status === 'waiting').length}</div>
            <div className="stat-label">Currently Waiting</div>
          </div>
        </div>
      </div>

      {/* Paused Notice */}
      {restaurant?.queuePaused && (
        <div className="paused-notice" data-aos="fade-in">
          ⏸️ Queue is currently paused
        </div>
      )}

      {/* Front of Queue Section */}
      <div className="section-container" data-aos="fade-up" data-aos-delay="300">
        <div className="section-header">
          <h2>Front of Queue</h2>
          <p className="section-subtitle">Parties ready to be seated</p>
        </div>

        {frontQueue.length === 0 ? (
          <div className="empty-state">
            <p>No parties in queue</p>
          </div>
        ) : (
          <div className="queue-list">
            {frontQueue.map((entry, index) => {
              const hasTimer = timers[entry.id];
              const remainingTime = getRemainingTime(entry.id);
              
              return (
                <div 
                  key={entry.id} 
                  className={`queue-item ${hasTimer ? 'timer-active' : ''}`}
                  data-aos="fade-up"
                  data-aos-delay={Math.min(index * 50, 300)}
                >
                  <div className="queue-item-left">
                    <div className="position-number">#{entry.position}</div>
                    <div className="party-info">
                      <h3>{entry.customerName}</h3>
                      <div className="party-details">
                        <span>👥 {entry.partySize} {entry.partySize === 1 ? 'person' : 'people'}</span>
                        <span>⏱️ {formatTime(entry.joinedAt)}</span>
                        {entry.phoneNumber && <span>📱 {entry.phoneNumber}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="queue-item-right">
                    {hasTimer ? (
                      <div className="timer-container">
                        <div className="timer-display">
                          <span className="timer-icon">⏰</span>
                          <span className="timer-value">{remainingTime} min</span>
                        </div>
                        <button 
                          className="btn-secondary btn-small"
                          onClick={() => handleCancelTimer(entry.id)}
                        >
                          Cancel Timer
                        </button>
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <button 
                          className="btn-primary"
                          onClick={() => handleAdmit(entry.id)}
                        >
                          Admit
                        </button>
                        <button 
                          className="btn-secondary"
                          onClick={() => handleStartTimer(entry)}
                        >
                          Start Timer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {queue.length > 5 && (
          <button 
            className="view-all-btn"
            onClick={navigateToQueueDetails}
          >
            View All {queue.length} Parties →
          </button>
        )}
      </div>

      {/* Missed Queue Section */}
      {missedQueue.length > 0 && (
        <div className="section-container missed-section" data-aos="fade-up" data-aos-delay="400">
          <div className="section-header">
            <h2>Missed Queue</h2>
            <p className="section-subtitle">Parties that didn't show up</p>
          </div>

          <div className="queue-list">
            {missedQueue.map((entry, index) => (
              <div 
                key={entry.id} 
                className="queue-item missed"
                data-aos="fade-up"
                data-aos-delay={Math.min(index * 50, 200)}
              >
                <div className="queue-item-left">
                  <div className="position-number missed-badge">✕</div>
                  <div className="party-info">
                    <h3>{entry.customerName}</h3>
                    <div className="party-details">
                      <span>👥 {entry.partySize}</span>
                      <span>⏰ Missed {formatTime(entry.missedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="queue-item-right">
                  <button 
                    className="btn-danger btn-small"
                    onClick={() => handleRemoveFromMissed(entry.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
