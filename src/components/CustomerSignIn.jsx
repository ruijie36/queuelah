import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import AOS from 'aos';
import './CustomerSignIn.css';

const CustomerSignIn = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
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
        // Sign up new user
        await createUserWithEmailAndPassword(auth, email, password);
        // Redirect to customer dashboard
        navigate('/customer/dashboard');
      } else {
        // Sign in existing user
        await signInWithEmailAndPassword(auth, email, password);
        // Redirect to customer dashboard
        navigate('/customer/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-signin-page">
      <div className="signin-container">
        <div className="signin-header" data-aos="fade-down">
          <h1 className="signin-logo" onClick={() => navigate('/')}>
            🍽️ Queuelah
          </h1>
          <p className="signin-subtitle">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        <div className="signin-card" data-aos="fade-up" data-aos-delay="100">
          <form onSubmit={handleSubmit} className="signin-form">
            {isSignUp && (
              <div className="form-group" data-aos="fade-in" data-aos-delay="200">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  className="form-input"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
              {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
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
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSignIn;
