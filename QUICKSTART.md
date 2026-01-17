# Queuelah - Quick Start Guide

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies

The dependencies are already installed! ✅

### 2. Set up Firebase

1. Go to https://console.firebase.google.com/
2. Click "Add project" or use an existing project
3. Enable **Firestore Database**:
   - Click "Firestore Database" → "Create database"
   - Choose "Start in test mode" → Click "Next" → "Enable"

4. Enable **Authentication**:
   - Click "Authentication" → "Get started"
   - Click "Anonymous" → Toggle "Enable" → "Save"

5. Get your Firebase config:
   - Click the gear icon ⚙️ → "Project settings"
   - Scroll down to "Your apps" section
   - Click the web icon `</>` to create a web app
   - Register app (name: "Queuelah")
   - Copy the `firebaseConfig` object

### 3. Configure Your App

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and paste your Firebase config values:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   VITE_FIREBASE_MEASUREMENT_ID=G-ABCD1234
   ```

### 4. Add Sample Data

In your Firebase Console, go to **Firestore Database**:

1. Click "Start collection" → Enter collection ID: `restaurants`
2. Add a document with auto-generated ID:

```json
{
  "name": "Pasta Paradise",
  "address": "456 Market St, San Francisco, CA 94102",
  "phone": "(555) 123-4567",
  "cuisine": "Italian",
  "location": {
    "lat": 37.7749,
    "lng": -122.4194
  },
  "currentWaitTime": 0,
  "queueLength": 0,
  "status": "open"
}
```

3. **IMPORTANT**: Copy the auto-generated Document ID (you'll need this for the dashboard)

### 5. Start the App

The development server is already running at **http://localhost:5173** 🎉

If it's not running:

```bash
npm run dev
```

### 6. Test the App

#### Customer View:

1. Open http://localhost:5173
2. Click on "Pasta Paradise"
3. Fill in your name, party size, and phone
4. Click "Join Queue"
5. You'll see your position and wait time

#### Staff Dashboard:

1. Copy your restaurant's document ID from Firestore
2. Go to http://localhost:5173/dashboard/YOUR_RESTAURANT_ID
3. See the queue in real-time
4. Click "Call Next Party" to notify customers
5. Mark parties as "Seated" or "Remove" them

## 📱 Features to Try

- Join multiple queues with different names
- Watch real-time position updates
- Test the "Call Next Party" feature
- Try canceling from the queue
- Add more restaurants to see the list grow

## 🔧 Troubleshooting

**Can't see restaurants?**

- Make sure you added restaurant data to Firestore
- Check that your `.env` file has the correct Firebase credentials
- Look at the browser console for errors

**Build errors?**

- Make sure you ran `npm install`
- Check that all `.jsx` files (not `.tsx`) exist

**Firebase errors?**

- Verify Firestore and Authentication are enabled
- Check your Firebase security rules allow read/write

## 📚 More Info

- Full documentation: See README.md
- Sample data: See FIREBASE_SETUP.md
- Firebase setup: https://firebase.google.com/docs/web/setup

Enjoy your queue management system! 🍽️
