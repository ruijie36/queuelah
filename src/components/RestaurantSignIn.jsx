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

    console.log('Form submitted:', { isSignUp, email, restaurantName });

    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setError('Request timed out. Please check your internet connection and try again.');
      setLoading(false);
    }, 15000); // 15 second timeout

    try {
      if (isSignUp) {
        console.log('Starting sign up process...');
        
        // Validate inputs
        if (!restaurantName || restaurantName.trim().length < 2) {
          throw new Error('Restaurant name must be at least 2 characters');
        }
        
        // Sign up new restaurant
        console.log('Creating user with email/password...');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('User created successfully:', userCredential.user.uid);
        
        // Create restaurant document in Firestore
        console.log('Creating Firestore document...');
        await setDoc(doc(db, 'restaurants', userCredential.user.uid), {
          name: restaurantName,
          email: email,
          createdAt: new Date().toISOString(),
          queuePaused: false,
          minPartySize: 1,
          maxPartySize: 8,
          currentWaitTime: 0,
          queueLength: 0,
        });
        console.log('Firestore document created successfully');
        
        clearTimeout(timeout);
        
        // Redirect to dashboard
        console.log('Redirecting to dashboard...');
        navigate(`/dashboard/${userCredential.user.uid}`);
      } else {
        console.log('Starting sign in process...');
        // Sign in existing restaurant
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('User signed in successfully:', userCredential.user.uid);
        
        clearTimeout(timeout);
        
        // Redirect to dashboard
        navigate(`/dashboard/${userCredential.user.uid}`);
      }
    } catch (err) {
      clearTimeout(timeout);
      console.error('Error during authentication:', err);
      
      // Better error messages
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
