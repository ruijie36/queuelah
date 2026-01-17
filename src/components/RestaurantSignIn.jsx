import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import './RestaurantSignIn.css';
import { useAuth } from '../context/AuthContext';

const RestaurantSignIn = () => {
  const navigate = useNavigate();
  const { restaurantSignIn, restaurantSignUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 50,
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setError('Request timed out. Please check your internet connection and try again.');
      setLoading(false);
    }, 15000);

    try {
      if (isSignUp) {
        if (!restaurantName || restaurantName.trim().length < 2) {
          throw new Error('Restaurant name must be at least 2 characters');
        }

        const { restaurantId } = await restaurantSignUp({
          email,
          password,
          restaurantName: restaurantName.trim(),
        });

        clearTimeout(timeout);
        navigate(`/dashboard/${restaurantId}`);
      } else {
        const user = await restaurantSignIn(email, password);
        clearTimeout(timeout);
        navigate(`/dashboard/${user.uid}`);
      }
    } catch (err) {
      clearTimeout(timeout);
      console.error('Error during authentication:', err);

      let errorMessage = err.message;
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please register first.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="restaurant-signin-page">
      <div className="signin-container">
        <div className="signin-header" data-aos="fade-down">
          <div className="signin-topbar">
            <button
              type="button"
              className="back-link"
              onClick={() => navigate('/')}
              aria-label="Back to landing page"
            >
              ← Back
            </button>
          </div>

          <h1 className="signin-logo" onClick={() => navigate('/')}>
            🍽️ Queuelah
          </h1>
          <p className="signin-subtitle">
            {isSignUp ? 'Register your restaurant' : 'Restaurant Portal'}
          </p>
        </div>

        <div className="signin-card" data-aos="fade-up" data-aos-delay="100">
          <form onSubmit={handleSubmit} className="signin-form">
            {isSignUp && (
              <div className="form-group" data-aos="fade-in" data-aos-delay="200">
                <label htmlFor="restaurantName">Restaurant Name</label>
                <input
                  type="text"
                  id="restaurantName"
                  className="form-input"
                  placeholder="Enter your restaurant name"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  required={isSignUp}
                />
              </div>
            )}

            <div className="form-group" data-aos="fade-in" data-aos-delay="250">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" data-aos="fade-in" data-aos-delay="300">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
              />
            </div>

            {error && (
              <div className="error-message" data-aos="shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg w-100"
              disabled={loading}
              data-aos="fade-in" data-aos-delay="350"
            >
              {loading ? 'Please wait...' : (isSignUp ? 'Register Restaurant' : 'Sign In')}
            </button>
          </form>

          <div className="signin-toggle" data-aos="fade-in" data-aos-delay="400">
            <p>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                className="toggle-link"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
              >
                {isSignUp ? 'Sign In' : 'Register'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSignIn;
