import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInAnonymously,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restaurantProfile, setRestaurantProfile] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);

      // Load restaurant profile if the user is signed in
      if (nextUser) {
        try {
          const profileRef = doc(db, 'users', nextUser.uid);
          const snap = await getDoc(profileRef);
          setRestaurantProfile(snap.exists() ? snap.data() : null);
        } catch (e) {
          console.error('Error loading user profile:', e);
          setRestaurantProfile(null);
        }
      } else {
        setRestaurantProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Customer/guest auth (existing)
  const login = async () => {
    try {
      const result = await signInAnonymously(auth);
      return result.user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  // Restaurant auth (email/password)
  const restaurantSignIn = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  };

  const restaurantSignUp = async ({ email, password, restaurantName, restaurantId }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // 1) Create a restaurant document (owner is the created user)
    // If restaurantId is not provided, default to uid (existing behavior)
    const resolvedRestaurantId = restaurantId || cred.user.uid;

    await setDoc(doc(db, 'restaurants', resolvedRestaurantId), {
      name: restaurantName,
      email,
      createdAt: new Date().toISOString(),
      queuePaused: false,
      minPartySize: 1,
      maxPartySize: 8,
      currentWaitTime: 0,
      queueLength: 0,
      ownerUid: cred.user.uid,
    }, { merge: true });

    // 2) Create a user profile mapping uid -> restaurantId
    await setDoc(doc(db, 'users', cred.user.uid), {
      role: 'restaurant',
      restaurantId: resolvedRestaurantId,
      email,
      restaurantName,
      createdAt: serverTimestamp(),
    }, { merge: true });

    // Refresh local profile state
    setRestaurantProfile({
      role: 'restaurant',
      restaurantId: resolvedRestaurantId,
      email,
      restaurantName,
    });

    return { user: cred.user, restaurantId: resolvedRestaurantId };
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    restaurantProfile,
    login,
    restaurantSignIn,
    restaurantSignUp,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
