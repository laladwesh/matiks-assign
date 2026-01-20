# Leaderboard Backend (Golang)

## Features
- Manages 10,000+ users efficiently
- Accurate ranking with tie handling (same rating = same rank)
- Random score updates every 5 seconds (simulates live gameplay)
- Fast user search by username
- Concurrent-safe operations with mutex locks

## API Endpoints

### 1. Get Leaderboard
```
GET /api/leaderboard
```
Returns top 100 users with their ranks, usernames, and ratings.

### 2. Search Users
```
GET /api/search?q=rahul
```
Searches for users by username and returns their global ranks.

### 3. Update User Rating
```
POST /api/update
Content-Type: application/json

{
  "user_id": 123,
  "rating": 4500
}
```

### 4. Health Check
```
GET /health
```

## Running the Backend

```bash
cd backend
go run main.go
```

The server will start on `http://localhost:8080`

## Build for Production

```bash
go build -o leaderboard-server main.go
./leaderboard-server
```

## Performance Notes
- Uses in-memory data structures for O(log n) search
- Mutex locks ensure thread-safe operations
- Efficient sorting algorithm for rank calculation
- Username indexing for fast search queries
