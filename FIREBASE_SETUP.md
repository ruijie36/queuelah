# Queuelah - Sample Firebase Data

This document shows you how to manually add sample data to your Firebase Firestore database to test the application.

## Adding Sample Restaurants

Go to your Firebase Console > Firestore Database and create a new collection called `restaurants`. Add these sample documents:

### Restaurant 1

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
  "currentWaitTime": 15,
  "queueLength": 3,
  "status": "open",
  "imageUrl": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400"
}
```

### Restaurant 2

```json
{
  "name": "Sushi Central",
  "address": "789 Mission St, San Francisco, CA 94103",
  "phone": "(555) 234-5678",
  "cuisine": "Japanese",
  "location": {
    "lat": 37.7849,
    "lng": -122.4094
  },
  "currentWaitTime": 25,
  "queueLength": 5,
  "status": "busy",
  "imageUrl": "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400"
}
```

### Restaurant 3

```json
{
  "name": "Burger Haven",
  "address": "321 Castro St, San Francisco, CA 94114",
  "phone": "(555) 345-6789",
  "cuisine": "American",
  "location": {
    "lat": 37.7649,
    "lng": -122.4294
  },
  "currentWaitTime": 10,
  "queueLength": 2,
  "status": "open",
  "imageUrl": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400"
}
```

### Restaurant 4

```json
{
  "name": "Taco Fiesta",
  "address": "654 Valencia St, San Francisco, CA 94110",
  "phone": "(555) 456-7890",
  "cuisine": "Mexican",
  "location": {
    "lat": 37.7599,
    "lng": -122.4211
  },
  "currentWaitTime": 0,
  "queueLength": 0,
  "status": "open",
  "imageUrl": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400"
}
```

### Restaurant 5

```json
{
  "name": "Golden Dragon",
  "address": "987 Grant Ave, San Francisco, CA 94108",
  "phone": "(555) 567-8901",
  "cuisine": "Chinese",
  "location": {
    "lat": 37.795,
    "lng": -122.4058
  },
  "currentWaitTime": 20,
  "queueLength": 4,
  "status": "open",
  "imageUrl": "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400"
}
```

## Notes

- The `queue` collection will be automatically created when users join queues
- Copy the restaurant document ID after creating it - you'll need it to access the dashboard at `/dashboard/{restaurantId}`
- Images are from Unsplash - you can use your own image URLs
- Adjust the `location` coordinates to match your testing location for better results with the "nearby" feature
