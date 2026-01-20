package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"sort"
	"strings"
	"sync"
	"time"
)

// User represents a player in the leaderboard
type User struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Rating   int    `json:"rating"`
	Rank     int    `json:"rank"`
}

// LeaderboardManager handles all leaderboard operations
type LeaderboardManager struct {
	users         map[int]*User
	usersByRating []*User
	usernameIndex map[string][]int
	mu            sync.RWMutex
}

var manager *LeaderboardManager

func init() {
	rand.Seed(time.Now().UnixNano())
}

// NewLeaderboardManager creates a new leaderboard manager
func NewLeaderboardManager() *LeaderboardManager {
	return &LeaderboardManager{
		users:         make(map[int]*User),
		usersByRating: make([]*User, 0),
		usernameIndex: make(map[string][]int),
	}
}

// SeedUsers generates N users with random ratings
func (lm *LeaderboardManager) SeedUsers(count int) {
	lm.mu.Lock()
	defer lm.mu.Unlock()

	firstNames := []string{
		"rahul", "priya", "amit", "sneha", "raj", "pooja", "vikram", "anjali",
		"arjun", "kavya", "rohan", "neha", "aditya", "isha", "karan", "divya",
		"sanjay", "meera", "varun", "riya", "nikhil", "tanya", "ankit", "shreya",
		"harsh", "nisha", "akash", "priyanka", "vishal", "swati", "mohit", "ananya",
		"gaurav", "sakshi", "deepak", "megha", "pankaj", "ritika", "manish", "simran",
		"siddharth", "preeti", "ashish", "komal", "suresh", "aarti", "ramesh", "vandana",
		"mahesh", "jyoti", "rajesh", "sunita", "naveen", "rekha", "dinesh", "usha",
	}

	lastNames := []string{
		"kumar", "sharma", "singh", "patel", "gupta", "verma", "yadav", "reddy",
		"mehta", "joshi", "malhotra", "agarwal", "chopra", "iyer", "nair", "pillai",
		"bhat", "menon", "desai", "shah", "kapoor", "bose", "ghosh", "das",
		"burman", "mathur", "saxena", "tiwari", "mishra", "pandey", "chauhan", "rajput",
		"thakur", "sinha", "chowdhury", "banerjee", "mukherjee", "dutta", "roy", "sen",
		"bhatt", "trivedi", "jain", "soni", "mittal", "goel", "arora", "khanna",
	}

	for i := 1; i <= count; i++ {
		firstName := firstNames[rand.Intn(len(firstNames))]
		lastName := lastNames[rand.Intn(len(lastNames))]
		username := fmt.Sprintf("%s_%s%d", firstName, lastName, i)

		rating := rand.Intn(4901) + 100 // Random rating between 100 and 5000

		user := &User{
			ID:       i,
			Username: username,
			Rating:   rating,
		}

		lm.users[i] = user
		lm.usersByRating = append(lm.usersByRating, user)

		// Index by username prefix for fast search
		lowerUsername := strings.ToLower(username)
		lm.usernameIndex[lowerUsername] = append(lm.usernameIndex[lowerUsername], i)
	}

	lm.calculateRanks()
	log.Printf("Seeded %d users successfully", count)
}

// calculateRanks calculates ranks for all users with tie handling
func (lm *LeaderboardManager) calculateRanks() {
	// Sort users by rating (descending)
	sort.Slice(lm.usersByRating, func(i, j int) bool {
		if lm.usersByRating[i].Rating == lm.usersByRating[j].Rating {
			return lm.usersByRating[i].Username < lm.usersByRating[j].Username
		}
		return lm.usersByRating[i].Rating > lm.usersByRating[j].Rating
	})

	// Assign ranks with tie handling
	currentRank := 1
	for i := 0; i < len(lm.usersByRating); i++ {
		if i > 0 && lm.usersByRating[i].Rating != lm.usersByRating[i-1].Rating {
			currentRank = i + 1
		}
		lm.usersByRating[i].Rank = currentRank
	}
}

// UpdateUserRating updates a user's rating and recalculates ranks
func (lm *LeaderboardManager) UpdateUserRating(userID int, newRating int) error {
	lm.mu.Lock()
	defer lm.mu.Unlock()

	user, exists := lm.users[userID]
	if !exists {
		return fmt.Errorf("user not found")
	}

	user.Rating = newRating
	lm.calculateRanks()

	return nil
}

// GetLeaderboard returns the top N users
func (lm *LeaderboardManager) GetLeaderboard(limit int, offset int) []*User {
	lm.mu.RLock()
	defer lm.mu.RUnlock()

	if offset >= len(lm.usersByRating) {
		return []*User{}
	}

	end := offset + limit
	if end > len(lm.usersByRating) {
		end = len(lm.usersByRating)
	}

	result := make([]*User, end-offset)
	for i := offset; i < end; i++ {
		result[i-offset] = &User{
			ID:       lm.usersByRating[i].ID,
			Username: lm.usersByRating[i].Username,
			Rating:   lm.usersByRating[i].Rating,
			Rank:     lm.usersByRating[i].Rank,
		}
	}

	return result
}

// SearchUsers searches for users by username
func (lm *LeaderboardManager) SearchUsers(query string) []*User {
	lm.mu.RLock()
	defer lm.mu.RUnlock()

	query = strings.ToLower(query)
	results := []*User{}

	// Search through all users
	for _, user := range lm.usersByRating {
		if strings.Contains(strings.ToLower(user.Username), query) {
			results = append(results, &User{
				ID:       user.ID,
				Username: user.Username,
				Rating:   user.Rating,
				Rank:     user.Rank,
			})
		}
	}

	return results
}

// GetTotalUsers returns the total number of users
func (lm *LeaderboardManager) GetTotalUsers() int {
	lm.mu.RLock()
	defer lm.mu.RUnlock()
	return len(lm.users)
}

// SimulateRandomUpdates simulates random score updates
func (lm *LeaderboardManager) SimulateRandomUpdates() {
	ticker := time.NewTicker(5 * time.Second)
	go func() {
		for range ticker.C {
			// Update 10 random users
			for i := 0; i < 10; i++ {
				userID := rand.Intn(len(lm.users)) + 1
				newRating := rand.Intn(4901) + 100
				lm.UpdateUserRating(userID, newRating)
			}
			log.Printf("Updated 10 random user ratings")
		}
	}()
}

// HTTP Handlers

func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

func leaderboardHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	limit := 100
	offset := 0

	users := manager.GetLeaderboard(limit, offset)
	total := manager.GetTotalUsers()

	response := map[string]interface{}{
		"users":  users,
		"total":  total,
		"limit":  limit,
		"offset": offset,
	}

	json.NewEncoder(w).Encode(response)
}

func searchHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	query := r.URL.Query().Get("q")
	if query == "" {
		http.Error(w, "Query parameter 'q' is required", http.StatusBadRequest)
		return
	}

	users := manager.SearchUsers(query)

	response := map[string]interface{}{
		"users": users,
		"count": len(users),
		"query": query,
	}

	json.NewEncoder(w).Encode(response)
}

func updateHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		UserID int `json:"user_id"`
		Rating int `json:"rating"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Rating < 100 || req.Rating > 5000 {
		http.Error(w, "Rating must be between 100 and 5000", http.StatusBadRequest)
		return
	}

	if err := manager.UpdateUserRating(req.UserID, req.Rating); err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	response := map[string]string{
		"status":  "success",
		"message": "User rating updated successfully",
	}

	json.NewEncoder(w).Encode(response)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	response := map[string]interface{}{
		"status":    "healthy",
		"users":     manager.GetTotalUsers(),
		"timestamp": time.Now().Unix(),
	}
	json.NewEncoder(w).Encode(response)
}

func main() {
	// Initialize leaderboard manager
	manager = NewLeaderboardManager()

	// Seed 10,000 users
	log.Println("Seeding users...")
	manager.SeedUsers(10000)

	// Start random updates simulation
	manager.SimulateRandomUpdates()

	// Setup routes
	http.HandleFunc("/api/leaderboard", enableCORS(leaderboardHandler))
	http.HandleFunc("/api/search", enableCORS(searchHandler))
	http.HandleFunc("/api/update", enableCORS(updateHandler))
	http.HandleFunc("/health", enableCORS(healthHandler))

	// Get port from environment variable (Railway/Heroku) or default to 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s...", port)
	log.Printf("Endpoints available:")
	log.Printf("  - GET  /api/leaderboard")
	log.Printf("  - GET  /api/search?q=rahul")
	log.Printf("  - POST /api/update")
	log.Printf("  - GET  /health")

	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}
