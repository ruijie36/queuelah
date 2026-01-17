import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);

  const handleGetStarted = (type) => {
    if (type === 'customer') {
      // Navigate to customer sign in page
      navigate('/customer-signin');
    } else {
      // Navigate to restaurant sign in page
      navigate('/restaurant-signin');
    }
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section bg-gradient-primary text-white">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-10">
              <h1 className="hero-title display-1 fw-bold mb-4" data-aos="fade-up">
                🍽️ Queuelah
              </h1>
              <p className="hero-subtitle display-5 mb-4" data-aos="fade-up" data-aos-delay="100">
                Skip the wait, not the taste
              </p>
              <p className="hero-description lead mb-5" data-aos="fade-up" data-aos-delay="200">
                Singapore's smartest restaurant queue management system.
                Join queues remotely, track your position in real-time,
                and never waste time waiting again.
              </p>
            </div>
          </div>

          {/* Separated CTAs */}
          <div className="row justify-content-center g-4 mb-5" data-aos="fade-up" data-aos-delay="300">
            {/* Customer Section */}
            <div className="col-lg-5 col-md-6">
              <div className="cta-card customer-card shadow-lg">
                <div className="card-icon mb-3">👥</div>
                <h3 className="card-title mb-3">For Diners</h3>
                <p className="card-text mb-4">
                  Browse restaurants, join queues remotely, and track your wait time in real-time
                </p>
                <button 
                  className="btn btn-warning btn-lg w-100 shadow-sm"
                  onClick={() => handleGetStarted('customer')}
                >
                  Customer Sign In ✨
                </button>
              </div>
            </div>

            {/* Restaurant Section */}
            <div className="col-lg-5 col-md-6">
              <div className="cta-card restaurant-card shadow-lg">
                <div className="card-icon mb-3">🏪</div>
                <h3 className="card-title mb-3">For Restaurants</h3>
                <p className="card-text mb-4">
                  Manage queues efficiently, reduce wait times, and improve customer satisfaction
                </p>
                <button 
                  className="btn btn-warning btn-lg w-100 shadow-sm"
                  onClick={() => handleGetStarted('restaurant')}
                >
                  Restaurant Sign In ✨
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="row justify-content-center text-center g-4 mt-5" data-aos="fade-up" data-aos-delay="400">
            <div className="col-md-4">
              <div className="stat-card">
                <div className="stat-number display-4 fw-bold">10,000+</div>
                <div className="stat-label fs-5">Happy Diners</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-card">
                <div className="stat-number display-4 fw-bold">500+</div>
                <div className="stat-label fs-5">Partner Restaurants</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-card">
                <div className="stat-number display-4 fw-bold">30min</div>
                <div className="stat-label fs-5">Avg. Time Saved</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section py-5 bg-light">
        <div className="container">
          <div className="row justify-content-center text-center mb-5">
            <div className="col-lg-8">
              <h2 className="section-title display-4 fw-bold mb-3" data-aos="fade-up">
                Why Choose Queuelah?
              </h2>
            </div>
          </div>
          
          <div className="row g-4">
            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="feature-card card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="feature-icon mb-3">📍</div>
                  <h3 className="h5 mb-3">Find Nearby Restaurants</h3>
                  <p className="text-muted">Browse restaurants near you with real-time queue information and wait times.</p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="feature-card card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="feature-icon mb-3">🔔</div>
                  <h3 className="h5 mb-3">Smart Notifications</h3>
                  <p className="text-muted">Get notified when you're approaching the front of the queue with grace periods.</p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="300">
              <div className="feature-card card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="feature-icon mb-3">⏱️</div>
                  <h3 className="h5 mb-3">Real-Time Updates</h3>
                  <p className="text-muted">Watch your queue position update live as parties are seated.</p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="feature-card card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="feature-icon mb-3">🏃‍♂️</div>
                  <h3 className="h5 mb-3">Join Remotely</h3>
                  <p className="text-muted">Join restaurant queues from anywhere - no need to wait at the venue.</p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="feature-card card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="feature-icon mb-3">📊</div>
                  <h3 className="h5 mb-3">Queue Intensity</h3>
                  <p className="text-muted">See peak hours and queue intensity to plan your dining time better.</p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="300">
              <div className="feature-card card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="feature-icon mb-3">🇸🇬</div>
                  <h3 className="h5 mb-3">Built for Singapore</h3>
                  <p className="text-muted">Optimized for lunch and dinner peak hours in Singapore timezone.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works-section py-5">
        <div className="container">
          <div className="row justify-content-center text-center mb-5">
            <div className="col-lg-8">
              <h2 className="section-title display-4 fw-bold mb-3" data-aos="fade-up">
                How It Works
              </h2>
            </div>
          </div>
          
          <div className="row justify-content-center align-items-center">
            <div className="col-lg-10">
              <div className="row g-4">
                <div className="col-md-3 col-6" data-aos="fade-right" data-aos-delay="100">
                  <div className="step-card text-center">
                    <div className="step-number mx-auto mb-3">1</div>
                    <h5 className="mb-2">Browse & Select</h5>
                    <p className="text-muted small">Find your favorite restaurant</p>
                  </div>
                </div>

                <div className="col-md-3 col-6" data-aos="fade-right" data-aos-delay="200">
                  <div className="step-card text-center">
                    <div className="step-number mx-auto mb-3">2</div>
                    <h5 className="mb-2">Join Queue</h5>
                    <p className="text-muted small">Enter your details remotely</p>
                  </div>
                </div>

                <div className="col-md-3 col-6" data-aos="fade-right" data-aos-delay="300">
                  <div className="step-card text-center">
                    <div className="step-number mx-auto mb-3">3</div>
                    <h5 className="mb-2">Track Position</h5>
                    <p className="text-muted small">Monitor in real-time</p>
                  </div>
                </div>

                <div className="col-md-3 col-6" data-aos="fade-right" data-aos-delay="400">
                  <div className="step-card text-center">
                    <div className="step-number mx-auto mb-3">4</div>
                    <h5 className="mb-2">Get Notified</h5>
                    <p className="text-muted small">Alert when it's your turn</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Restaurant CTA Section */}
      <section className="restaurant-cta-section bg-gradient-primary text-white py-5">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8" data-aos="zoom-in">
              <h2 className="display-4 fw-bold mb-4">Are You a Restaurant Owner?</h2>
              <p className="lead mb-4">Manage your queues efficiently with our powerful dashboard</p>
              <ul className="list-unstyled mb-5 text-start d-inline-block">
                <li className="mb-2">✓ Unified queue for walk-ins and online diners</li>
                <li className="mb-2">✓ Real-time queue management and notifications</li>
                <li className="mb-2">✓ Pause/resume queues during busy periods</li>
                <li className="mb-2">✓ Set party size limits and manage capacity</li>
                <li className="mb-2">✓ Track peak hours and queue intensity</li>
              </ul>
              <br />
              <button 
                className="btn btn-light btn-lg px-5 shadow"
                onClick={() => {
                  setAuthType('restaurant');
                  setAuthMode('register');
                  setShowAuthModal(true);
                }}
              >
                Register Your Restaurant 🚀
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer bg-dark text-white py-4">
        <div className="container text-center">
          <p className="mb-0">&copy; 2026 Queuelah. Making dining in Singapore better, one queue at a time.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
