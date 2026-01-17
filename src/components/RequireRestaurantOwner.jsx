import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

/**
 * Option B route guard:
 * - Requires an authenticated user
 * - Requires that the user is a restaurant account that owns the restaurantId in the URL
 */
export default function RequireRestaurantOwner({ children }) {
  const navigate = useNavigate();
  const { restaurantId } = useParams();
  const { user, restaurantProfile, loading } = useAuth();

  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const effectiveRestaurantId = useMemo(() => {
    return restaurantProfile?.restaurantId || user?.uid || null;
  }, [restaurantProfile?.restaurantId, user?.uid]);

  useEffect(() => {
    if (loading) return;

    // Must be logged in
    if (!user) {
      navigate('/restaurant-signin', { replace: true });
      return;
    }

    // Must have a mapped restaurantId (restaurant account)
    if (!restaurantProfile?.restaurantId) {
      // If they came from older data where restaurant doc id == uid,
      // allow by checking ownerUid on the restaurant document.
      // Otherwise, send them to /my-dashboard so they can land correctly.
      // (You can tighten this later with Firestore rules.)
      setChecking(true);
      (async () => {
        try {
          const restSnap = await getDoc(doc(db, 'restaurants', restaurantId));
          const ownerUid = restSnap.exists() ? restSnap.data()?.ownerUid : null;
          if (!ownerUid) {
            setAuthorized(false);
            navigate('/restaurant-signin', { replace: true });
            return;
          }
          if (ownerUid !== user.uid) {
            setAuthorized(false);
            navigate(`/dashboard/${user.uid}`, { replace: true });
            return;
          }
          setAuthorized(true);
        } finally {
          setChecking(false);
        }
      })();
      return;
    }

    // Ownership: URL must match profile restaurantId
    if (restaurantId !== restaurantProfile.restaurantId) {
      navigate(`/dashboard/${effectiveRestaurantId}`, { replace: true });
      return;
    }

    setAuthorized(true);
    setChecking(false);
  }, [loading, user, restaurantProfile, restaurantId, effectiveRestaurantId, navigate]);

  if (loading || checking) {
    return (
      <div style={{ maxWidth: 600, margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#6e6e73' }}>Checking access…</p>
      </div>
    );
  }

  if (!authorized) return null;

  return children;
}
