import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  getDoc,
  onSnapshot,
  orderBy,
  where
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Get all restaurants
 */
export const getRestaurants = async () => {
  try {
    const restaurantsRef = collection(db, 'restaurants');
    const q = query(restaurantsRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    throw error;
  }
};

/**
 * Get nearby restaurants based on user location
 */
export const getNearbyRestaurants = async (userLat, userLng, radiusKm = 10) => {
  try {
    // For MVP, we'll get all restaurants and filter client-side
    // In production, use geohashing or Firebase GeoFire for better performance
    const restaurants = await getRestaurants();
    
    return restaurants.filter(restaurant => {
      const distance = calculateDistance(
        userLat, 
        userLng, 
        restaurant.location.lat, 
        restaurant.location.lng
      );
      return distance <= radiusKm;
    });
  } catch (error) {
    console.error('Error fetching nearby restaurants:', error);
    throw error;
  }
};

/**
 * Get a single restaurant by ID
 */
export const getRestaurantById = async (restaurantId) => {
  try {
    const restaurantRef = doc(db, 'restaurants', restaurantId);
    const restaurantDoc = await getDoc(restaurantRef);
    
    if (restaurantDoc.exists()) {
      return {
        id: restaurantDoc.id,
        ...restaurantDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time restaurant updates
 */
export const subscribeToRestaurant = (restaurantId, callback) => {
  const restaurantRef = doc(db, 'restaurants', restaurantId);
  
  return onSnapshot(restaurantRef, (doc) => {
    if (doc.exists()) {
      callback({
        id: doc.id,
        ...doc.data()
      });
    }
  });
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};
