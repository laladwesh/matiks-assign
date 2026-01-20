# Leaderboard Frontend (React Native Expo)

## Features
- Clean, modern UI with dark theme
- Real-time leaderboard display (top 100 users)
- Live search functionality
- Pull-to-refresh
- Responsive design for mobile and web
- Auto-refresh capability

## Setup Instructions

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Update Backend URL
In `App.js`, update the `API_BASE_URL` constant:

- **For Web Development**: `http://localhost:8080`
- **For Android Emulator**: `http://10.0.2.2:8080`
- **For iOS Simulator**: `http://localhost:8080`
- **For Physical Device**: `http://YOUR_COMPUTER_IP:8080`

### 3. Run the App

#### Web
```bash
npm run web
```
Open http://localhost:8081 in your browser

#### iOS Simulator
```bash
npm run ios
```

#### Android Emulator
```bash
npm run android
```

## Deployment

### Deploy to Vercel/Netlify (Web Version)

1. Build the web version:
```bash
npx expo export:web
```

2. Deploy the `web-build` folder to Vercel or Netlify

#### Vercel Deployment:
```bash
npm install -g vercel
vercel --prod
```

#### Netlify Deployment:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=web-build
```

### Build for Production

#### Android APK
```bash
eas build --platform android
```

#### iOS IPA
```bash
eas build --platform ios
```

## Features Demonstrated

1. **Leaderboard Tab**: Shows top 100 players with rank, username, and rating
2. **Search Tab**: Search any username and see live global ranks
3. **Tie Handling**: Users with same rating have same rank
4. **Live Updates**: Backend updates 10 random users every 5 seconds
5. **Responsive UI**: Works on mobile and web

## Screenshots

The app displays:
- Global Rank (with proper tie handling)
- Username
- Rating (100-5000)
- Total users online
- Search results with live ranks

## API Integration

The app connects to the Go backend:
- `GET /api/leaderboard` - Fetch top users
- `GET /api/search?q=username` - Search users
- `POST /api/update` - Update user ratings

## Performance

- Efficient rendering with FlatList
- Debounced search for optimal performance
- Handles 10,000+ users smoothly
- Instant search results
