import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  subscribeToRestaurantQueue, 
  removeFromQueue 
} from '../services/queueService';
import './QueueDetails.css';

const QueueDetails = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToRestaurantQueue(restaurantId, (queueData) => {
      setQueue(queueData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [restaurantId]);

  const handleRemove = async (entryId, customerName) => {
    if (window.confirm(`Remove ${customerName} from the queue?`)) {
      try {
        await removeFromQueue(entryId);
      } catch (error) {
        console.error('Error removing from queue:', error);
        alert('Failed to remove party');
      }
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60);
    
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff} min ago`;
    const hours = Math.floor(diff / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="queue-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading queue...</p>
      </div>
    );
  }

  return (
    <div className="queue-details">
      <div className="queue-details-header" data-aos="fade-down">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="header-content">
          <h1>All Parties in Queue</h1>
          <p className="subtitle">{queue.length} {queue.length === 1 ? 'party' : 'parties'} waiting</p>
        </div>
      </div>

      <div className="queue-details-container">
        {queue.length === 0 ? (
          <div className="empty-state" data-aos="fade-up">
            <p>No parties in queue</p>
          </div>
        ) : (
          <div className="all-parties-list">
            {queue.map((entry, index) => (
              <div 
                key={entry.id} 
                className={`party-card ${entry.status === 'called' ? 'called' : ''}`}
                data-aos="fade-up"
                data-aos-delay={Math.min(index * 30, 300)}
              >
                <div className="party-card-header">
                  <div className="position-badge">#{entry.position}</div>
                  <div className="party-badges">
                    {entry.isWalkIn ? (
                      <span className="badge walk-in">Walk-In</span>
                    ) : (
                      <span className="badge online">Online</span>
                    )}
                    {entry.status === 'called' && <span className="badge called">Called</span>}
                  </div>
                </div>

                <div className="party-card-body">
                  <h3>{entry.customerName}</h3>
                  
                  <div className="party-meta-grid">
                    <div className="meta-item">
                      <span className="meta-label">Party Size</span>
                      <span className="meta-value">👥 {entry.partySize}</span>
                    </div>
                    
                    {entry.phoneNumber && (
                      <div className="meta-item">
                        <span className="meta-label">Phone</span>
                        <span className="meta-value">📱 {entry.phoneNumber}</span>
                      </div>
                    )}
                    
                    <div className="meta-item">
                      <span className="meta-label">Wait Time</span>
                      <span className="meta-value">
                        ⏱️ {entry.waitTimeRange 
                          ? `${entry.waitTimeRange.min}-${entry.waitTimeRange.max} min`
                          : `${entry.estimatedWaitTime} min`}
                      </span>
                    </div>
                    
                    <div className="meta-item">
                      <span className="meta-label">Joined</span>
                      <span className="meta-value">🕒 {formatTime(entry.joinedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="party-card-footer">
                  <button 
                    className="remove-btn"
                    onClick={() => handleRemove(entry.id, entry.customerName)}
                  >
                    Remove from Queue
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

export default QueueDetails;
