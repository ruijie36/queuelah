# Queuelah - Singapore Restaurant Queue Management (UPDATED)

## 🇸🇬 Enhanced Features for Singapore

### New Features Added

#### 1. **Peak Hours Detection**

- Automatic detection of lunch (11:30-14:00) and dinner (18:00-21:00) peak hours
- Visual indicators showing 🔥 Peak Hours on restaurant cards
- Real-time Singapore timezone (SGT) support

#### 2. **Queue Intensity Tracking**

- Visual queue intensity meter (Low/Moderate/High)
- Color-coded indicators:
  - 🟢 Green: Low intensity (< 30%)
  - 🟠 Orange: Moderate intensity (30-60%)
  - 🔴 Red: High intensity (> 60%)

#### 3. **Unified Queue (Walk-In + Online)**

- Single queue combines both walk-in diners and online joiners
- Walk-ins clearly labeled with badges
- Staff can add walk-ins directly through dashboard

#### 4. **Smart Notifications**

- "Approaching front" notifications when within top 3 positions
- 10-minute grace period for diners to return
- Visual countdown timer showing time remaining
- Status badges: Ready, Grace Period, Called

#### 5. **Queue Controls (Restaurant Staff)**

- **Pause/Resume Queue**: Temporarily stop accepting new diners
- **Party Size Limits**: Set min/max party sizes
- **Skip Function**: Skip parties who don't return in time
- **Notify to Return**: Send return notification to online diners

#### 6. **Enhanced Wait Time Estimates**

- Wait time ranges (e.g., "24-36 min") instead of single estimates
- More accurate 8-12 minutes per party calculation
- Real-time updates as parties are seated

## 📊 Updated Firebase Data Structure

### Restaurant Document

Add these new fields to your restaurant documents:

```json
{
  "name": "Pasta Paradise",
  "address": "123 Orchard Road, Singapore 238858",
  "phone": "+65 6XXX XXXX",
  "cuisine": "Italian",
  "location": {
    "lat": 1.3048,
    "lng": 103.8318
  },
  "currentWaitTime": 25,
  "queueLength": 5,
  "status": "open",

  // NEW FIELDS
  "queuePaused": false,
  "lastPausedAt": null,
  "minPartySize": 1,
  "maxPartySize": 8,
  "imageUrl": "https://example.com/image.jpg"
}
```

### Queue Entry Document

Updated structure includes:

```json
{
  "restaurantId": "abc123",
  "customerName": "John Tan",
  "partySize": 4,
  "phoneNumber": "+65 9XXX XXXX",
  "position": 3,
  "estimatedWaitTime": 30,

  // NEW FIELDS
  "waitTimeRange": {
    "min": 24,
    "max": 36
  },
  "status": "waiting", // "waiting", "called", "seated", "cancelled", "skipped"
  "isWalkIn": false,
  "joinedAt": "timestamp",
  "notificationSent": false,
  "readyToReturn": false,
  "gracePeriodExpiry": null
}
```

## 🎯 Using the New Features

### For Customers

1. **Browse restaurants** - See peak hours indicator and queue intensity
2. **Join queue** - Checks for paused queues and party size limits
3. **Wait** - See position and wait time range
4. **Get notified** - Receive "return now" notification when approaching front
5. **Return within grace period** - 10 minutes to return after notification

### For Restaurant Staff

**Access Dashboard**: `http://localhost:5174/dashboard/{restaurantId}`

#### Managing the Queue

1. **View Queue**
   - See all parties (walk-in + online) in one unified list
   - Walk-ins have blue badges, online have purple badges
   - See position, party size, wait time, and status

2. **Add Walk-In Diners**
   - Click "👥 Add Walk-In" button
   - Enter name, party size, optional phone
   - Walk-in is instantly added to queue

3. **Call Next Party**
   - Click "🔔 Call Next Party"
   - First party in queue gets "Called" status
   - Online diners see "Your table is ready!"

4. **Notify Online Diners**
   - For parties in top 3 positions
   - Click "🔔 Notify to Return"
   - Diner gets 10-minute grace period

5. **Handle Arrivals**
   - Click "✓ Seated" when party arrives
   - Click "⏭️ Skip" if grace period expires
   - Click "✕ Remove" to cancel

6. **Pause Queue**
   - Click "⏸️ Pause Queue" during busy times
   - No new online diners can join
   - Click "▶️ Resume Queue" to reopen

## 🇸🇬 Singapore-Specific Optimizations

### Location Data

Update restaurant coordinates to Singapore locations:

```javascript
{
  "location": {
    "lat": 1.3048,    // Singapore latitude
    "lng": 103.8318   // Singapore longitude
  }
}
```

### Phone Numbers

Use Singapore format:

- `+65 6XXX XXXX` (landline)
- `+65 9XXX XXXX` (mobile)

### Peak Hours (Singapore Time)

- **Lunch**: 11:30 AM - 2:00 PM
- **Dinner**: 6:00 PM - 9:00 PM

System automatically detects SGT timezone.

## 🚀 Quick Start

1. **Start the dev server** (if not running):

   ```bash
   npm run dev
   ```

2. **Add updated restaurant data** in Firebase Console:
   - Go to Firestore Database
   - Update existing restaurants with new fields
   - Or create new restaurants with complete data

3. **Test the features**:
   - Join queue as customer
   - Add walk-ins from dashboard
   - Test pause/resume
   - Try skip functionality
   - Watch real-time updates

## 📱 Key User Flows

### Flow 1: Online Diner During Peak Hours

1. Browse restaurants (sees "🔥 Peak Hours" badge)
2. Select restaurant with high queue intensity
3. Join queue (enters name, party size, phone)
4. Wait and watch position update in real-time
5. Receive "Please return now!" notification (position ≤ 3)
6. See 10-minute countdown timer
7. Return to restaurant within grace period
8. Get called and seated

### Flow 2: Restaurant Staff Managing Mixed Queue

1. Open dashboard
2. See unified queue (3 online + 2 walk-ins)
3. Add new walk-in diner
4. Notify online diner in position #2 to return
5. Call next party (#1 walk-in)
6. Mark as seated when they sit
7. Skip online diner who didn't return in time
8. Continue processing queue

### Flow 3: Managing Busy Period

1. Queue reaches 10+ parties
2. Staff pauses queue temporarily
3. Existing queue members continue waiting
4. New online joiners see "Queue Paused" message
5. Staff processes current queue
6. Resume queue when manageable

## 🔧 Testing Checklist

- [ ] Peak hours indicator shows during 11:30-14:00 and 18:00-21:00 SGT
- [ ] Queue intensity updates correctly
- [ ] Walk-ins can be added from dashboard
- [ ] Online and walk-in diners appear in single queue
- [ ] Pause/resume queue works
- [ ] Party size limits are enforced
- [ ] Notify to return sends notification
- [ ] Grace period countdown displays correctly
- [ ] Skip function removes parties
- [ ] Wait time ranges display properly

## 🎨 Visual Indicators

- **🔥** Peak Hours (orange badge)
- **🟢🟠🔴** Queue Intensity (color bar)
- **👥** Walk-In Badge (blue)
- **🌐** Online Badge (purple)
- **⏸️** Queue Paused (yellow warning)
- **🔔** Notification Sent
- **🏃‍♂️** Return Now (blue alert)

---

All features are now live and ready for Singapore's restaurant scene! 🇸🇬🍽️
