import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { auth } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import './RestaurantSettings.css';

function RestaurantSettings() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [restaurantName, setRestaurantName] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [notificationTimer, setNotificationTimer] = useState(10);
  const [maxPartySize, setMaxPartySize] = useState(8);
  const [minPartySize, setMinPartySize] = useState(1);

  const cuisineOptions = [
    'Chinese',
    'Japanese',
    'Korean',
    'Italian',
    'Western',
    'Indian',
    'Thai',
    'Local',
    'Fusion',
    'Fast Food',
    'Cafe',
    'Dessert'
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user || user.uid !== restaurantId) {
        navigate('/restaurant-signin');
        return;
      }

      try {
        const restaurantRef = doc(db, 'restaurants', restaurantId);
        const restaurantDoc = await getDoc(restaurantRef);

        if (restaurantDoc.exists()) {
          const data = restaurantDoc.data();
          setRestaurantName(data.name || '');
          setCuisine(data.cuisine || '');
          setNotificationTimer(data.notificationTimer || 10);
          setMaxPartySize(data.maxPartySize || 8);
          setMinPartySize(data.minPartySize || 1);
        }
      } catch (err) {
        console.error('Error loading restaurant:', err);
        setError('Failed to load restaurant settings');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [restaurantId, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    // Validation
    if (!restaurantName.trim()) {
      setError('Restaurant name is required');
      setSaving(false);
      return;
    }

    if (!cuisine) {
      setError('Please select a cuisine type');
      setSaving(false);
      return;
    }

    if (notificationTimer < 1 || notificationTimer > 60) {
      setError('Timer must be between 1 and 60 minutes');
      setSaving(false);
      return;
    }

    if (minPartySize < 1 || minPartySize > maxPartySize) {
      setError('Invalid party size settings');
      setSaving(false);
      return;
    }

    try {
      const restaurantRef = doc(db, 'restaurants', restaurantId);
      await updateDoc(restaurantRef, {
        name: restaurantName.trim(),
        cuisine: cuisine,
        notificationTimer: notificationTimer,
        maxPartySize: maxPartySize,
        minPartySize: minPartySize
      });

      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-loading">
        <div className="loading-spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="restaurant-settings">
      <div className="settings-header">
        <button 
          className="back-btn"
          onClick={() => navigate(`/dashboard/${restaurantId}`)}
        >
          ← Back to Dashboard
        </button>
        <h1>Restaurant Settings</h1>
      </div>

      <div className="settings-container">
        <form onSubmit={handleSave}>
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              {success}
            </div>
          )}

          {/* Restaurant Name */}
          <div className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-group">
              <label htmlFor="restaurantName">
                Restaurant Name <span className="required">*</span>
              </label>
              <input
                id="restaurantName"
                type="text"
                className="form-input"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                placeholder="Enter restaurant name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cuisine">
                Cuisine Type <span className="required">*</span>
              </label>
              <select
                id="cuisine"
                className="form-select"
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
              >
                <option value="">Select a cuisine type</option>
                {cuisineOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <p className="help-text">
                This helps customers find your restaurant when filtering by cuisine
              </p>
            </div>
          </div>

          {/* Timer Settings */}
          <div className="form-section">
            <h2>Queue Management</h2>
            
            <div className="form-group">
              <label htmlFor="notificationTimer">
                Grace Period Timer (minutes) <span className="required">*</span>
              </label>
              <div className="timer-input-group">
                <input
                  id="notificationTimer"
                  type="number"
                  className="form-input timer-input"
                  value={notificationTimer}
                  onChange={(e) => setNotificationTimer(parseInt(e.target.value) || 0)}
                  min="1"
                  max="60"
                />
                <span className="timer-unit">minutes</span>
              </div>
              <p className="help-text">
                Time customers have to arrive after being called. If they don't arrive within this time, they'll be moved to the missed queue.
              </p>
            </div>

            <div className="timer-presets">
              <p className="presets-label">Quick presets:</p>
              <div className="preset-buttons">
                <button
                  type="button"
                  className={`preset-btn ${notificationTimer === 5 ? 'active' : ''}`}
                  onClick={() => setNotificationTimer(5)}
                >
                  5 min
                </button>
                <button
                  type="button"
                  className={`preset-btn ${notificationTimer === 10 ? 'active' : ''}`}
                  onClick={() => setNotificationTimer(10)}
                >
                  10 min
                </button>
                <button
                  type="button"
                  className={`preset-btn ${notificationTimer === 15 ? 'active' : ''}`}
                  onClick={() => setNotificationTimer(15)}
                >
                  15 min
                </button>
                <button
                  type="button"
                  className={`preset-btn ${notificationTimer === 20 ? 'active' : ''}`}
                  onClick={() => setNotificationTimer(20)}
                >
                  20 min
                </button>
              </div>
            </div>
          </div>

          {/* Party Size Settings */}
          <div className="form-section">
            <h2>Party Size Limits</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="minPartySize">
                  Minimum Party Size <span className="required">*</span>
                </label>
                <input
                  id="minPartySize"
                  type="number"
                  className="form-input"
                  value={minPartySize}
                  onChange={(e) => setMinPartySize(parseInt(e.target.value) || 1)}
                  min="1"
                  max={maxPartySize}
                />
              </div>

              <div className="form-group">
                <label htmlFor="maxPartySize">
                  Maximum Party Size <span className="required">*</span>
                </label>
                <input
                  id="maxPartySize"
                  type="number"
                  className="form-input"
                  value={maxPartySize}
                  onChange={(e) => setMaxPartySize(parseInt(e.target.value) || 1)}
                  min={minPartySize}
                  max="50"
                />
              </div>
            </div>

            <p className="help-text">
              Set the minimum and maximum number of people per party. Maximum seats available per sitting.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate(`/dashboard/${restaurantId}`)}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-btn"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RestaurantSettings;
