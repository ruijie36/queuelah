import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * MyDashboard - Redirects to the authenticated user's dashboard
 * Use this as a bookmark/shortcut to always go to YOUR dashboard
 */
const MyDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('MyDashboard: Checking auth...');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('MyDashboard: Redirecting to dashboard for user:', user.uid);
        navigate(`/dashboard/${user.uid}`, { replace: true });
      } else {
        console.log('MyDashboard: No user, redirecting to sign in');
        navigate('/restaurant-signin', { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f7'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '4px solid #d2d2d7',
        borderTopColor: '#5db075',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
    </div>
  );
};

export default MyDashboard;
