import { useNavigate } from 'react-router-dom';
import { calculateQueueIntensity, isPeakHours } from '../services/queueService';
import './RestaurantCard.css';

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();

  const getStatusColor = () => {
    if (restaurant.queuePaused) return '#757575';
    switch (restaurant.status) {
      case 'open': return '#4caf50';
      case 'busy': return '#ff9800';
      case 'closed': return '#f44336';
      default: return '#757575';
    }
  };

  const getIntensityColor = (intensity) => {
    if (intensity < 30) return '#4caf50'; // Low - Green
    if (intensity < 60) return '#ff9800'; // Medium - Orange
    return '#f44336'; // High - Red
  };

  const getIntensityLabel = (intensity) => {
    if (intensity < 30) return 'Low';
    if (intensity < 60) return 'Moderate';
    return 'High';
  };

  const handleClick = () => {
    navigate(`/restaurant/${restaurant.id}`);
  };

  const intensity = calculateQueueIntensity(restaurant.queueLength || 0, restaurant.currentWaitTime || 0);
  const isPeak = isPeakHours();

  return (
    <div className="restaurant-card" onClick={handleClick}>
      {restaurant.imageUrl && (
        <div className="restaurant-image">
          <img src={restaurant.imageUrl} alt={restaurant.name} />
          {isPeak && (
            <div className="peak-badge">🔥 Peak Hours</div>
          )}
        </div>
      )}
      <div className="restaurant-info">
        <h3>{restaurant.name}</h3>
        <p className="cuisine">{restaurant.cuisine}</p>
        <p className="address">{restaurant.address}</p>
        
        <div className="restaurant-stats">
          <div className="stat">
            <span className="label">Wait Time:</span>
            <span className="value">
              {restaurant.currentWaitTime 
                ? `${restaurant.currentWaitTime} min` 
                : 'No wait'}
            </span>
          </div>
          <div className="stat">
            <span className="label">Queue:</span>
            <span className="value">{restaurant.queueLength || 0} parties</span>
          </div>
        </div>

        <div className="queue-intensity">
          <div className="intensity-label">Queue Intensity</div>
          <div className="intensity-bar">
            <div 
              className="intensity-fill" 
              style={{ 
                width: `${intensity}%`,
                backgroundColor: getIntensityColor(intensity)
              }}
            />
          </div>
          <div className="intensity-text" style={{ color: getIntensityColor(intensity) }}>
            {getIntensityLabel(intensity)}
          </div>
        </div>

        <div className="restaurant-status" style={{ backgroundColor: getStatusColor() }}>
          {restaurant.queuePaused ? 'QUEUE PAUSED' : restaurant.status.toUpperCase()}
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
