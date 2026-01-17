import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  subscribeToRestaurantQueue,
  subscribeToMissedQueue,
  callNextParty, 
  removeFromQueue, 
  markAsSeated,
  toggleQueuePause,
  isPeakHours,
  calculateQueueIntensity,
  markAsSkipped
} from '../services/queueService';
import { subscribeToRestaurant } from '../services/restaurantService';
import './Dashboard.css';

const Dashboard = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [queue, setQueue] = useState([]);
  const [timers, setTimers] = useState({}); // Track timers for each party
  const [missedQueue, setMissedQueue] = useState([]); // Parties that missed their turn
  const [error, setError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Close settings dropdown when clicking outside
  useEffect(() => {
    if (!settingsOpen) return;
    const onDocClick = (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.closest('.settings-menu')) return;
      setSettingsOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [settingsOpen]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/restaurant-signin', { replace: true });
    } catch (e) {
      console.error('Logout failed:', e);
      alert('Failed to log out. Please try again.');
    }
  };

  // Check if user is authenticated and owns this restaurant
  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? user.uid : 'No user');
      
      if (!user) {
        console.log('No user logged in, redirecting to sign in');
        navigate('/restaurant-signin', { replace: true });
        return;
      }

      setCurrentUser(user);

      if (user.uid !== restaurantId) {
        console.log('User ID mismatch. User:', user.uid, 'URL:', restaurantId);
        console.log('Redirecting to correct dashboard');
        navigate(`/dashboard/${user.uid}`, { replace: true });
        return;
      }

      console.log('Auth check passed, user owns this restaurant');
      setAuthChecked(true);
    }, (error) => {
      console.error('Auth state error:', error);
      // On error, still set authChecked to prevent infinite loading
      setAuthChecked(true);
    });

    return () => {
      console.log('Cleaning up auth listener');
      unsubscribe();
    };
  }, [restaurantId, navigate]);

  useEffect(() => {
    if (!authChecked) return; // Wait for auth check
    
    if (!restaurantId) {
      setError('No restaurant ID provided');
      return;
    }

    console.log('Dashboard mounted for restaurant:', restaurantId);
    
    // Subscribe to restaurant updates (real-time, no initial fetch needed)
    const unsubscribeRestaurant = subscribeToRestaurant(restaurantId, (data) => {
      console.log('Restaurant data received:', data);
      if (data) {
        setRestaurant(data);
        setError(null);
      } else {
        setError('Restaurant not found');
      }
    });
    
    // Subscribe to queue updates
    const unsubscribeQueue = subscribeToRestaurantQueue(restaurantId, (queueData) => {
      console.log('Queue data received:', queueData.length, 'entries');
      setQueue(queueData);
    });

    const unsubscribeMissed = subscribeToMissedQueue(restaurantId, (missed) => {
      setMissedQueue(missed.map((m) => ({
        ...m,
        missedAt: m.skippedAt || m.missedAt || null,
      })));
    });

    return () => {
      console.log('Dashboard unmounting, cleaning up subscriptions');
      unsubscribeRestaurant();
      unsubscribeQueue();
      unsubscribeMissed();
    };
  }, [restaurantId, authChecked]);

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

  const handleMissedParty = async (entry) => {
    // Add to local Missed Queue list
    setMissedQueue(prev => [...prev, { ...entry, missedAt: new Date() }]);

    // Clear timer UI
    setTimers(prev => {
      const newTimers = { ...prev };
      delete newTimers[entry.id];
      return newTimers;
    });

    // Persist: mark as skipped so it disappears from active waiting list
    try {
      await markAsSkipped(entry.id);
    } catch (e) {
      console.error('Error marking party as skipped:', e);
    }
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

  // Estimated queue time: 0 when empty, grows with queue length (minutes per party)
  const minutesPerParty = restaurant?.avgMinutesPerParty || 8;
  const estimatedQueueTime = totalWaiting === 0 ? 0 : totalWaiting * minutesPerParty;

  // Show loading while checking authentication
  if (!authChecked) {
    return (
      <div className="dashboard">
        <div style={{ 
          maxWidth: '600px', 
          margin: '4rem auto', 
          padding: '3rem', 
          textAlign: 'center'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #d2d2d7',
            borderTopColor: '#5db075',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1.5rem'
          }}></div>
          <p style={{ color: '#6e6e73', fontSize: '1.125rem' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error if restaurant not found
  if (error) {
    return (
      <div className="dashboard">
        <div style={{ 
          maxWidth: '600px', 
          margin: '4rem auto', 
          padding: '2rem', 
          background: '#fff5f5', 
          borderRadius: '12px',
          border: '1px solid #ffdddd',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#dc3545', marginBottom: '1rem' }}>⚠️ Error</h2>
          <p style={{ color: '#6e6e73', marginBottom: '1.5rem' }}>{error}</p>
          <button 
            onClick={() => navigate('/restaurant-signin')}
            style={{
              padding: '0.75rem 2rem',
              background: '#5db075',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  const isPeak = isPeakHours();
  const frontQueue = queue.slice(0, 3); // Only show first 3 parties

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header" data-aos="fade-down">
        <div className="header-content">
          <h1>{restaurant?.name || 'Loading...'}</h1>
          <p className="subtitle">Queue Management</p>
        </div>
        <div className="header-actions">
          <button 
            className={`pause-toggle ${restaurant?.queuePaused ? 'paused' : ''}`}
            onClick={handleTogglePause}
          >
            {restaurant?.queuePaused ? 'Resume Queue' : 'Pause Queue'}
          </button>

          <div className={`settings-menu ${settingsOpen ? 'open' : ''}`}>
            <button
              className="settings-btn"
              onClick={() => setSettingsOpen((v) => !v)}
              title="Settings"
              aria-haspopup="menu"
              aria-expanded={settingsOpen}
              type="button"
            >
              ⚙️
            </button>

            {settingsOpen && (
              <div className="settings-dropdown" role="menu">
                <button
                  className="settings-dropdown-item"
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    setSettingsOpen(false);
                    navigate(`/dashboard/${restaurantId}/settings`);
                  }}
                >
                  Restaurant Settings
                </button>

                <button
                  className="settings-dropdown-item danger"
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    setSettingsOpen(false);
                    handleLogout();
                  }}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
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
            <div className="stat-value">{estimatedQueueTime}</div>
            <div className="stat-label">Estimated Queue Time</div>
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

        {queue.length > 3 && (
          <button 
            className="view-all-btn"
            onClick={navigateToQueueDetails}
          >
            View All {queue.length} Parties →
          </button>
        )}
      </div>

      {/* Missed Queue Section (always visible below Front of Queue) */}
      <div className="section-container missed-section" data-aos="fade-up" data-aos-delay="400">
        <div className="section-header">
          <h2>Missed Queue</h2>
          <p className="section-subtitle">Parties that missed their time window</p>
        </div>

        {missedQueue.length === 0 ? (
          <div className="empty-state">
            <p>No missed parties</p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default Dashboard;
