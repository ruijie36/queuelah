import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import AOS from 'aos';
import './RestaurantSignIn.css';

const RestaurantSignIn = () => {
  const navigate = useNavigate();
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

    try {
      if (isSignUp) {
        // Sign up new restaurant
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Create restaurant document in Firestore
        await setDoc(doc(db, 'restaurants', userCredential.user.uid), {
          name: restaurantName,
          email: email,
          createdAt: new Date().toISOString(),
          queuePaused: false,
          minPartySize: 1,
          maxPartySize: 8,
        });
        
        // Redirect to dashboard
        navigate(`/dashboard/${userCredential.user.uid}`);
      } else {
        // Sign in existing restaurant
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Redirect to dashboard
        navigate(`/dashboard/${userCredential.user.uid}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="restaurant-signin-page">
      <div className="signin-container">
        <div className="signin-header" data-aos="fade-down">
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
