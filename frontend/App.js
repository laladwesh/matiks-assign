import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native";
import axios from "axios";
import Svg, { Path, Circle, Polyline } from "react-native-svg";

// --- CONFIGURATION ---
const API_BASE_URL = "http://localhost:8080";

// --- THEME CONSTANTS ---
const THEME = {
  background: "#050505", // True black/dark grey
  card: "#121212", // Matte card background
  border: "#2A2A2A", // Subtle separators
  primary: "#00D664", // "Terminal Green" - Sharp & Professional
  text: "#FFFFFF",
  subText: "#888888",
  danger: "#CF6679",
};

// --- CUSTOM SVG ICONS ---
// Replaces emojis with professional vector paths

const IconTrophy = ({ color = THEME.primary, size = 20 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M8 21h8M12 17v4M7 4h10c0 8-3 13-3 13S11 12 11 4H7z" />
    <Path d="M6 4H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2M18 4h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" />
  </Svg>
);

const IconSearch = ({ color = THEME.subText, size = 20 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Circle cx="11" cy="11" r="8" />
    <Path d="m21 21-4.35-4.35" />
  </Svg>
);

const IconUser = ({ color = THEME.subText, size = 20 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

const IconClose = ({ color = THEME.text, size = 16 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M18 6 6 18M6 6l12 12" />
  </Svg>
);

const IconRefresh = ({ color = THEME.background, size = 16 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Polyline points="23 4 23 10 17 10" />
    <Path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </Svg>
);

// --- MAIN COMPONENT ---
export default function App() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/leaderboard`);
      setLeaderboard(response.data.users || []);
      setTotalUsers(response.data.total || 0);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/search`, {
        params: { q: query },
      });
      setSearchResults(response.data.users || []);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === "leaderboard") await fetchLeaderboard();
    else if (searchQuery.trim()) await handleSearch(searchQuery);
    setRefreshing(false);
  };

  // --- RENDER ITEMS ---
  const renderUserItem = ({ item, index }) => {
    // Top 3 distinct styling
    const isTopRank = item.rank <= 3;
    const rankColor =
      item.rank === 1
        ? "#FFD700"
        : item.rank === 2
          ? "#C0C0C0"
          : item.rank === 3
            ? "#CD7F32"
            : THEME.text;

    return (
      <View style={[styles.card, isTopRank && styles.cardTopRank]}>
        {/* Left: Rank */}
        <View style={styles.rankSection}>
          {isTopRank ? (
            <IconTrophy color={rankColor} size={24} />
          ) : (
            <Text style={styles.rankNumber}>{item.rank}</Text>
          )}
        </View>

        {/* Middle: User Info */}
        <View style={styles.userSection}>
          <Text style={[styles.userName, isTopRank && { color: rankColor }]}>
            {item.username}
          </Text>
          <Text style={styles.userId}>ID: {item.id}</Text>
        </View>

        {/* Right: Score */}
        <View style={styles.scoreSection}>
          <Text style={styles.scoreValue}>{item.rating}</Text>
          <Text style={styles.scoreLabel}>RATING</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.background} />

      {/* 1. MINIMALIST HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>LEADERBOARD</Text>
          <Text style={styles.headerSubtitle}>
            <Text style={{ color: THEME.primary }}>●</Text>{" "}
            {totalUsers.toLocaleString()} ACTIVE PLAYERS
          </Text>
        </View>
        {/* Subtle decorative icon or branding could go right here */}
      </View>

      {/* 2. SEGMENTED CONTROL TABS */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "leaderboard" && styles.tabActive,
          ]}
          onPress={() => setActiveTab("leaderboard")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "leaderboard" && styles.tabTextActive,
            ]}
          >
            RANKINGS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "search" && styles.tabActive]}
          onPress={() => setActiveTab("search")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "search" && styles.tabTextActive,
            ]}
          >
            SEARCH
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3. SEARCH BAR (Conditional) */}
      {activeTab === "search" && (
        <View style={styles.searchWrapper}>
          <View
            style={[styles.searchBar, searchFocused && styles.searchBarFocused]}
          >
            <IconSearch size={18} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search player ID or name..."
              placeholderTextColor={THEME.subText}
              value={searchQuery}
              onChangeText={handleSearch}
              autoCapitalize="none"
              blurOnSubmit={false}
              keyboardShouldPersistTaps="always"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                }}
              >
                <IconClose />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* 4. TABLE HEADERS */}
      <View style={styles.tableHeader}>
        <Text
          style={[styles.tableHeadText, { width: 50, textAlign: "center" }]}
        >
          #
        </Text>
        <Text style={[styles.tableHeadText, { flex: 1, paddingLeft: 12 }]}>
          PLAYER
        </Text>
        <Text style={[styles.tableHeadText, { width: 80, textAlign: "right" }]}>
          RATING
        </Text>
      </View>

      {/* 5. CONTENT LIST */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={THEME.primary} />
        </View>
      ) : (
        <FlatList
          data={activeTab === "leaderboard" ? leaderboard : searchResults}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={THEME.primary}
              colors={[THEME.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <IconUser size={48} color={THEME.border} />
              <Text style={styles.emptyText}>
                {activeTab === "search"
                  ? "No players found"
                  : "No ranking data"}
              </Text>
            </View>
          }
        />
      )}

      {/* 6. FLOATING ACTION BUTTON (Refresh) */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fab}
          onPress={onRefresh}
          activeOpacity={0.8}
        >
          <IconRefresh size={20} />
          <Text style={styles.fabText}>SYNC</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: Platform.OS === "ios" ? "Menlo-Bold" : "monospace", // Tech/Formal look
    fontWeight: "800",
    color: THEME.text,
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: THEME.subText,
    marginTop: 6,
    fontWeight: "500",
    letterSpacing: 0.5,
  },

  // Tabs
  tabContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: "transparent",
  },
  tabActive: {
    backgroundColor: THEME.card,
    borderColor: THEME.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.subText,
    letterSpacing: 1,
  },
  tabTextActive: {
    color: THEME.primary,
  },

  // Search
  searchWrapper: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.card,
    borderWidth: 1.5,
    borderColor: THEME.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
    height: 52,
  },
  searchBarFocused: {
    borderColor: THEME.primary,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    color: THEME.text,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "500",
    height: "100%",
    outlineStyle: "none",
    fontWeight: "500",
    height: "100%",
  },

  // List Headers
  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    backgroundColor: THEME.background,
  },
  tableHeadText: {
    fontSize: 10,
    fontWeight: "700",
    color: THEME.subText,
    letterSpacing: 1,
  },

  // Cards
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A", // Very subtle separator
  },
  cardTopRank: {
    backgroundColor: "rgba(255,255,255,0.02)", // Extremely subtle highlight
  },
  rankSection: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.subText,
    fontVariant: ["tabular-nums"],
  },
  userSection: {
    flex: 1,
    paddingLeft: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: THEME.text,
    marginBottom: 4,
  },
  userId: {
    fontSize: 11,
    color: "#444",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  scoreSection: {
    width: 80,
    alignItems: "flex-end",
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.primary,
    fontVariant: ["tabular-nums"],
  },
  scoreLabel: {
    fontSize: 8,
    color: THEME.subText,
    marginTop: 2,
    fontWeight: "600",
  },

  // Utilities
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  emptyText: {
    color: THEME.subText,
    marginTop: 16,
    fontSize: 14,
  },
  fabContainer: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
  },
  fab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 6,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: THEME.background,
    fontWeight: "900",
    marginLeft: 8,
    fontSize: 12,
    letterSpacing: 1,
  },
});
