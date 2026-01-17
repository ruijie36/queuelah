import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Timestamp,
  increment,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Join a restaurant queue (online diners)
 */
export const joinQueue = async (restaurantId, customerName, partySize, phoneNumber) => {
  try {
    // Check restaurant queue status
    const restaurantRef = doc(db, 'restaurants', restaurantId);
    const restaurantDoc = await getDoc(restaurantRef);
    const restaurantData = restaurantDoc.data();
    
    // Check if queue is paused
    if (restaurantData?.queuePaused) {
      throw new Error('Queue is currently paused. Please try again later.');
    }
    
    // Check party size limits
    if (restaurantData?.maxPartySize && partySize > restaurantData.maxPartySize) {
      throw new Error(`Maximum party size is ${restaurantData.maxPartySize}`);
    }
    if (restaurantData?.minPartySize && partySize < restaurantData.minPartySize) {
      throw new Error(`Minimum party size is ${restaurantData.minPartySize}`);
    }
    
    // Get current queue length for position
    const currentQueue = await getRestaurantQueue(restaurantId);
    const position = currentQueue.length + 1;
    
    // Calculate estimated wait time range (8-12 minutes per party)
    const minWait = position * 8;
    const maxWait = position * 12;
    const estimatedWaitTime = Math.round((minWait + maxWait) / 2);
    
    const queueEntry = {
      restaurantId,
      customerName,
      partySize,
      phoneNumber,
      position,
      estimatedWaitTime,
      waitTimeRange: { min: minWait, max: maxWait },
      status: 'waiting',
      isWalkIn: false,
      joinedAt: Timestamp.now(),
      notificationSent: false,
      readyToReturn: false,
      gracePeriodExpiry: null,
    };
    
    const docRef = await addDoc(collection(db, 'queue'), queueEntry);
    
    // Update restaurant queue length
    await updateDoc(restaurantRef, {
      queueLength: increment(1),
      currentWaitTime: estimatedWaitTime
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error joining queue:', error);
    throw error;
  }
};

/**
 * Get all queue entries for a restaurant
 */
export const getRestaurantQueue = async (restaurantId) => {
  try {
    const queueRef = collection(db, 'queue');
    const q = query(
      queueRef,
      where('restaurantId', '==', restaurantId),
      where('status', '==', 'waiting'),
      orderBy('position')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      joinedAt: doc.data().joinedAt?.toDate()
    }));
  } catch (error) {
    console.error('Error fetching queue:', error);
    throw error;
  }
};

/**
 * Get queue entry by ID
 */
export const getQueueEntry = async (entryId) => {
  try {
    const entryRef = doc(db, 'queue', entryId);
    const entryDoc = await getDoc(entryRef);
    
    if (entryDoc.exists()) {
      return {
        id: entryDoc.id,
        ...entryDoc.data(),
        joinedAt: entryDoc.data().joinedAt?.toDate()
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching queue entry:', error);
    throw error;
  }
};

/**
 * Subscribe to queue updates for a restaurant
 */
export const subscribeToRestaurantQueue = (restaurantId, callback) => {
  const queueRef = collection(db, 'queue');
  const q = query(
    queueRef,
    where('restaurantId', '==', restaurantId),
    where('status', '==', 'waiting'),
    orderBy('position')
  );
  
  return onSnapshot(q, (snapshot) => {
    const queue = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      joinedAt: doc.data().joinedAt?.toDate()
    }));
    callback(queue);
  }, (error) => {
    console.error('Error in queue subscription:', error);
    // Return empty queue on error to prevent UI breaking
    callback([]);
  });
};

/**
 * Subscribe to a specific queue entry
 */
export const subscribeToQueueEntry = (entryId, callback) => {
  const entryRef = doc(db, 'queue', entryId);
  
  return onSnapshot(entryRef, (doc) => {
    if (doc.exists()) {
      callback({
        id: doc.id,
        ...doc.data(),
        joinedAt: doc.data().joinedAt?.toDate()
      });
    } else {
      callback(null);
    }
  });
};

/**
 * Call next party in queue (restaurant staff)
 */
export const callNextParty = async (restaurantId) => {
  try {
    const queue = await getRestaurantQueue(restaurantId);
    if (queue.length === 0) {
      throw new Error('Queue is empty');
    }
    
    const nextEntry = queue[0];
    const entryRef = doc(db, 'queue', nextEntry.id);
    
    await updateDoc(entryRef, {
      status: 'called',
      notifiedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error calling next party:', error);
    throw error;
  }
};

/**
 * Remove party from queue
 */
export const removeFromQueue = async (entryId) => {
  try {
    const entry = await getQueueEntry(entryId);
    if (!entry) {
      throw new Error('Queue entry not found');
    }
    
    await deleteDoc(doc(db, 'queue', entryId));
    
    // Update positions for remaining entries
    await reorderQueue(entry.restaurantId);
    
    // Update restaurant queue length
    const restaurantRef = doc(db, 'restaurants', entry.restaurantId);
    await updateDoc(restaurantRef, {
      queueLength: increment(-1)
    });
  } catch (error) {
    console.error('Error removing from queue:', error);
    throw error;
  }
};

/**
 * Mark party as seated
 */
export const markAsSeated = async (entryId) => {
  try {
    const entry = await getQueueEntry(entryId);
    if (!entry) {
      throw new Error('Queue entry not found');
    }
    
    const entryRef = doc(db, 'queue', entryId);
    await updateDoc(entryRef, {
      status: 'seated'
    });
    
    // Update positions for remaining entries
    await reorderQueue(entry.restaurantId);
    
    // Update restaurant queue length
    const restaurantRef = doc(db, 'restaurants', entry.restaurantId);
    await updateDoc(restaurantRef, {
      queueLength: increment(-1)
    });
  } catch (error) {
    console.error('Error marking as seated:', error);
    throw error;
  }
};

/**
 * Reorder queue positions after removal
 */
const reorderQueue = async (restaurantId) => {
  const queue = await getRestaurantQueue(restaurantId);
  
  const updatePromises = queue.map((entry, index) => {
    const newPosition = index + 1;
    const newWaitTime = newPosition * 10;
    
    return updateDoc(doc(db, 'queue', entry.id), {
      position: newPosition,
      estimatedWaitTime: newWaitTime
    });
  });
  
  await Promise.all(updatePromises);
};

/**
 * Cancel queue entry (customer)
 */
export const cancelQueueEntry = async (entryId) => {
  try {
    const entry = await getQueueEntry(entryId);
    if (!entry) {
      throw new Error('Queue entry not found');
    }
    
    const entryRef = doc(db, 'queue', entryId);
    await updateDoc(entryRef, {
      status: 'cancelled'
    });
    
    await removeFromQueue(entryId);
  } catch (error) {
    console.error('Error cancelling queue entry:', error);
    throw error;
  }
};

/**
 * Add walk-in diner to queue (restaurant staff)
 */
export const addWalkIn = async (restaurantId, customerName, partySize, phoneNumber = '') => {
  try {
    const currentQueue = await getRestaurantQueue(restaurantId);
    const position = currentQueue.length + 1;
    
    const minWait = position * 8;
    const maxWait = position * 12;
    const estimatedWaitTime = Math.round((minWait + maxWait) / 2);
    
    const queueEntry = {
      restaurantId,
      customerName,
      partySize,
      phoneNumber,
      position,
      estimatedWaitTime,
      waitTimeRange: { min: minWait, max: maxWait },
      status: 'waiting',
      isWalkIn: true,
      joinedAt: Timestamp.now(),
      notificationSent: true, // Walk-ins are already present
      readyToReturn: true,
    };
    
    const docRef = await addDoc(collection(db, 'queue'), queueEntry);
    
    const restaurantRef = doc(db, 'restaurants', restaurantId);
    await updateDoc(restaurantRef, {
      queueLength: increment(1),
      currentWaitTime: estimatedWaitTime
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding walk-in:', error);
    throw error;
  }
};

/**
 * Mark diner as ready to return (when approaching front)
 */
export const markReadyToReturn = async (entryId) => {
  try {
    const entryRef = doc(db, 'queue', entryId);
    const gracePeriodMinutes = 10; // 10 minute grace period
    const gracePeriodExpiry = new Date(Date.now() + gracePeriodMinutes * 60 * 1000);
    
    await updateDoc(entryRef, {
      readyToReturn: true,
      notificationSent: true,
      gracePeriodExpiry: Timestamp.fromDate(gracePeriodExpiry),
    });
  } catch (error) {
    console.error('Error marking ready to return:', error);
    throw error;
  }
};

/**
 * Skip party (grace period expired or not ready)
 */
export const skipParty = async (entryId) => {
  try {
    const entry = await getQueueEntry(entryId);
    if (!entry) {
      throw new Error('Queue entry not found');
    }
    
    const entryRef = doc(db, 'queue', entryId);
    await updateDoc(entryRef, {
      status: 'skipped',
    });
    
    await removeFromQueue(entryId);
  } catch (error) {
    console.error('Error skipping party:', error);
    throw error;
  }
};

/**
 * Toggle queue pause status
 */
export const toggleQueuePause = async (restaurantId, isPaused) => {
  try {
    const restaurantRef = doc(db, 'restaurants', restaurantId);
    await updateDoc(restaurantRef, {
      queuePaused: isPaused,
      lastPausedAt: isPaused ? Timestamp.now() : null,
    });
  } catch (error) {
    console.error('Error toggling queue pause:', error);
    throw error;
  }
};

/**
 * Update party size limits
 */
export const updatePartySizeLimits = async (restaurantId, minSize, maxSize) => {
  try {
    const restaurantRef = doc(db, 'restaurants', restaurantId);
    await updateDoc(restaurantRef, {
      minPartySize: minSize || 1,
      maxPartySize: maxSize || 20,
    });
  } catch (error) {
    console.error('Error updating party size limits:', error);
    throw error;
  }
};

/**
 * Check if it's peak hours in Singapore (11:30-14:00 or 18:00-21:00 SGT)
 */
export const isPeakHours = () => {
  const now = new Date();
  const sgTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Singapore' }));
  const hour = sgTime.getHours();
  const minute = sgTime.getMinutes();
  const timeInMinutes = hour * 60 + minute;
  
  // Lunch: 11:30 - 14:00
  const lunchStart = 11 * 60 + 30;
  const lunchEnd = 14 * 60;
  
  // Dinner: 18:00 - 21:00
  const dinnerStart = 18 * 60;
  const dinnerEnd = 21 * 60;
  
  return (timeInMinutes >= lunchStart && timeInMinutes <= lunchEnd) ||
         (timeInMinutes >= dinnerStart && timeInMinutes <= dinnerEnd);
};

/**
 * Calculate queue intensity (0-100)
 */
export const calculateQueueIntensity = (queueLength, averageWaitTime) => {
  // Intensity based on queue length and wait time
  const lengthScore = Math.min(queueLength * 10, 50); // Max 50 points
  const waitScore = Math.min(averageWaitTime / 2, 50); // Max 50 points
  return Math.min(lengthScore + waitScore, 100);
};
