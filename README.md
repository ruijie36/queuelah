# 🍽️ Queuelah

**Skip the wait, not the taste**

Queuelah is a modern web application that allows users to browse nearby restaurants, join virtual queues, and track their wait times in real-time. Restaurant staff can manage their queues efficiently through a dedicated dashboard.

## ✨ Features

### For Customers
- 📍 Browse nearby restaurants with real-time wait times
- �� Join restaurant queues remotely (name, party size, phone number)
- 📊 Track your position in queue with estimated wait time
- 🔔 Get notified when your turn is approaching
- ❌ Cancel queue entry anytime

### For Restaurant Staff
- 📱 Manage queue through dedicated dashboard
- 👥 View all waiting parties with details
- 📞 Call next party when ready
- ✅ Mark parties as seated
- 🗑️ Remove parties from queue

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Firebase account
- npm or yarn

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/queuelah.git
   cd queuelah
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up Firebase**
   
   a. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   
   b. Enable Firestore Database:
      - Go to Firestore Database
      - Click "Create Database"
      - Start in test mode (or production mode with security rules)
   
   c. Enable Authentication:
      - Go to Authentication
      - Enable Anonymous sign-in
   
   d. Get your Firebase configuration:
      - Go to Project Settings
      - Scroll down to "Your apps"
      - Copy your Firebase config object

4. **Configure environment variables**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   
   Edit \`.env\` and add your Firebase credentials:
   \`\`\`env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   \`\`\`

5. **Set up Firestore collections**
   
   Create sample restaurant in Firestore "restaurants" collection:
   \`\`\`json
   {
     "name": "Sample Restaurant",
     "address": "123 Main St, San Francisco, CA",
     "phone": "(555) 123-4567",
     "cuisine": "Italian",
     "location": {
       "lat": 37.7749,
       "lng": -122.4194
     },
     "currentWaitTime": 0,
     "queueLength": 0,
     "status": "open",
     "imageUrl": "https://example.com/image.jpg"
   }
   \`\`\`

6. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

7. **Open your browser**
   Navigate to \`http://localhost:5173\`

## 📱 Usage

### Customer Flow
1. Visit the homepage to see nearby restaurants
2. Click on a restaurant to view details and current wait time
3. Fill in your information (name, party size, phone number)
4. Click "Join Queue"
5. Track your position and estimated wait time
6. Get notified when your table is ready

### Restaurant Staff Flow
1. Navigate to \`/dashboard/{restaurantId}\` (replace with your restaurant ID)
2. View all parties in the queue
3. Click "Call Next Party" when ready for the next group
4. Mark parties as "Seated" or "Remove" them from the queue

## 🏗️ Project Structure

\`\`\`
queuelah/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── Dashboard.jsx        # Restaurant staff dashboard
│   │   ├── RestaurantList.jsx   # List of nearby restaurants
│   │   ├── RestaurantCard.jsx   # Restaurant card component
│   │   ├── RestaurantDetail.jsx # Restaurant details & join queue
│   │   └── QueueStatus.jsx      # Customer queue status view
│   ├── config/
│   │   └── firebase.js          # Firebase configuration
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication context
│   ├── services/
│   │   ├── restaurantService.js # Restaurant-related operations
│   │   └── queueService.js      # Queue management operations
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # App entry point
│   └── index.css        # Global styles
├── .env.example         # Example environment variables
├── package.json
└── README.md
\`\`\`

## 🔥 Firebase Security Rules

Add these security rules to your Firestore:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to restaurants
    match /restaurants/{restaurant} {
      allow read: if true;
      allow write: if false; // Only allow through admin SDK
    }
    
    // Queue entries
    match /queue/{entry} {
      allow read: if true;
      allow create: if true;
      allow update: if true;
      allow delete: if true;
    }
  }
}
\`\`\`

## ��️ Technologies Used

- **Frontend**: React 19, React Router
- **Backend**: Firebase (Firestore, Authentication, Analytics)
- **Build Tool**: Vite
- **Styling**: CSS3 with modern gradients and animations

## 📝 Future Enhancements

- [ ] SMS notifications using Twilio or Firebase Cloud Messaging
- [ ] User accounts and queue history
- [ ] Restaurant registration and management
- [ ] Advanced geolocation with GeoFire
- [ ] Push notifications for mobile
- [ ] Analytics dashboard for restaurant owners
- [ ] Multi-language support
- [ ] Dark mode

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ for better restaurant experiences

---

**Note**: This is an MVP (Minimum Viable Product). For production use, implement proper authentication, security rules, and error handling.
