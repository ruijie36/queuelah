import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import CustomerSignIn from './components/CustomerSignIn';
import RestaurantSignIn from './components/RestaurantSignIn';
import RestaurantList from './components/RestaurantList';
import RestaurantDetail from './components/RestaurantDetail';
import QueueStatus from './components/QueueStatus';
import Dashboard from './components/Dashboard';
import QueueDetails from './components/QueueDetails';
import MyDashboard from './components/MyDashboard';
import CustomerDashboard from './components/CustomerDashboard';
import CustomerRestaurantDetail from './components/CustomerRestaurantDetail';
import RestaurantSettings from './components/RestaurantSettings';
import RequireRestaurantOwner from './components/RequireRestaurantOwner';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Landing page - standalone */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth pages - standalone */}
          <Route path="/customer-signin" element={<CustomerSignIn />} />
          <Route path="/restaurant-signin" element={<RestaurantSignIn />} />
          
          {/* Customer Dashboard - standalone */}
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/restaurant/:restaurantId" element={<CustomerRestaurantDetail />} />
          
          {/* My Dashboard - auto-redirects to logged-in user's dashboard */}
          <Route path="/my-dashboard" element={<MyDashboard />} />
          
          {/* Dashboard pages - protected (Option B) */}
          <Route
            path="/dashboard/:restaurantId"
            element={
              <RequireRestaurantOwner>
                <Dashboard />
              </RequireRestaurantOwner>
            }
          />
          <Route
            path="/dashboard/:restaurantId/queue"
            element={
              <RequireRestaurantOwner>
                <QueueDetails />
              </RequireRestaurantOwner>
            }
          />
          <Route
            path="/dashboard/:restaurantId/settings"
            element={
              <RequireRestaurantOwner>
                <RestaurantSettings />
              </RequireRestaurantOwner>
            }
          />
          
          {/* App routes with header/footer */}
          <Route path="/*" element={
            <div className="app">
              <header className="app-header">
                <h1>🍽️ Queuelah</h1>
                <p>Skip the wait, not the taste</p>
              </header>
              
              <main className="app-main">
                <Routes>
                  <Route path="/restaurants" element={<RestaurantList />} />
                  <Route path="/restaurant/:id" element={<RestaurantDetail />} />
                  <Route path="/queue/:id" element={<QueueStatus />} />
                </Routes>
              </main>

              <footer className="app-footer">
                <p>&copy; 2026 Queuelah. All rights reserved.</p>
              </footer>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

