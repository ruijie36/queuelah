import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Verify Firebase config is loaded
console.log('🔥 Firebase Configuration:');
console.log('  ✓ API Key:', firebaseConfig.apiKey ? '✓ Loaded' : '✗ Missing');
console.log('  ✓ Auth Domain:', firebaseConfig.authDomain || '✗ Missing');
console.log('  ✓ Project ID:', firebaseConfig.projectId || '✗ Missing');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log('✓ Firebase App Initialized');

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

console.log('✓ Firebase Auth Initialized');
console.log('✓ Firestore Initialized');

// Set auth persistence to local (survives browser refresh and close)
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('✓ Auth persistence set to LOCAL (survives refresh)');
  })
  .catch((error) => {
    console.error('✗ Error setting auth persistence:', error);
  });

export default app;
