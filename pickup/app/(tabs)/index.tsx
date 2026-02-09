import { StyleSheet, ScrollView, View, TouchableOpacity, Text, Image, ImageSourcePropType, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useTheme, useFocusEffect } from "@react-navigation/native";
import { Feather } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from "react";
import { useServer } from "@/contexts/ServerContext";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { GameFilter, GameWithDetails } from "@/objects/Game";
import FilterModal from "@/components/FilterModal";
import SearchModal from "@/components/SearchModal";
import GameDetailsModal from "@/components/GameDetailsModal";
import CreateGameModal from "@/components/CreateGameModal";
import * as Location from "expo-location";

function getSportImage(sportName: string): ImageSourcePropType {
  const key = sportName.toLowerCase();
  if (key.includes("basketball")) return require("../../assets/images/basketball.png");
  if (key.includes("soccer")) return require("../../assets/images/soccer.png");
  if (key.includes("football")) return require("../../assets/images/football.png");
  return require("../../assets/images/football.png"); // fallback if unknown
}

export default function Index() {
  const { colors } = useTheme();
  const server = useServer();
  const { user } = useAuth();
  const { sharedFilters, setSharedFilters } = useData();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [games, setGames] = useState<GameWithDetails[]>([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isCreateGameVisible, setIsCreateGameVisible] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const handleApplyFilters = (newFilters: GameFilter) => {
    setSharedFilters(newFilters);
  };

  const fetchGames = useCallback(async () => {
      setIsLoading(true);
      try {
        const locationFilters = userLocation
          ? {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              radiusKm: 25,
            }
          : {};
        let finalFilters: GameFilter = {
          ...(sharedFilters || {}),
          ...locationFilters,
        };

        if (sharedFilters?.favoriteOnly && user) {
          const favorites = await server.getFavouriteSports(user.id);
          const favoriteNames = favorites.map((sport) => sport.name);
          if (favoriteNames.length === 0) {
            setGames([]);
            return;
          }

          if (finalFilters.sport && finalFilters.sport.length > 0) {
            finalFilters = {
              ...finalFilters,
              sport: finalFilters.sport.filter((name) => favoriteNames.includes(name)),
            };
            if (finalFilters.sport.length === 0) {
              setGames([]);
              return;
            }
          } else {
            finalFilters = {
              ...finalFilters,
              sport: favoriteNames,
            };
          }
        }

        const gamesList = await server.getGamesWithDetails(finalFilters);
        setGames(gamesList);

        setLastUpdated(new Date());
      } catch (error) {
        console.error("Failed to fetch games:", error);
      } finally {
        setIsLoading(false);
      }
  }, [server, sharedFilters, userLocation, user]);

  const requestAndLoadLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Location permission denied");
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setUserLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch (error) {
      console.error("Location request failed:", error);
    }
  }, []);
  

  useFocusEffect(
    useCallback(() => {
      fetchGames();
    }, [fetchGames])
  );

  useEffect(() => {
    requestAndLoadLocation();
  }, [requestAndLoadLocation]);

  useEffect(() => {
    if (!userLocation) return;
    fetchGames();
  }, [userLocation, fetchGames]);

  return (
    <SafeAreaView 
      style={[styles.container, 
      { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + tabBarHeight }}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing}
            onRefresh={fetchGames} 
            tintColor={colors.primary} 
            colors={[colors.primary]}
          />
        }
      >
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.filterButton} onPress={() => setIsFilterVisible(true)}>
            <Feather name="filter" size={30} style={{ color: colors.text }} />
          </TouchableOpacity>
          {lastUpdated && (
          <Text style={[styles.timestampText, { color: colors.text, opacity: 0.6 }]}>
            Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          )}
          <TouchableOpacity style={styles.searchButton} onPress={() => setIsSearchVisible(true)}>
            <Feather name="search" size={30} style={{ color: colors.text }} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : games.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={[styles.emptyStateText, { color: colors.text }]}>No games in your area.</Text>
          </View>
        ) : (
          <View style={styles.gamesContainer}>
            {games.map((game) => (
              <TouchableOpacity
                key={game.id}
                style={[styles.gameContainer, { borderColor: colors.border }]}
                onPress={() => setSelectedGame(game)}
                activeOpacity={0.9}
              >
                <View style={[styles.gameHeader, { backgroundColor: colors.card }]}>
                  <Text style={[styles.sportText, { color: colors.text }]}>{game.sportName}</Text>
                  <Text style={[styles.dateText, { color: colors.text }]}>{game.startTime.toString()}</Text>
                </View>

                <View style={[styles.gameInfo, { backgroundColor: colors.background }]}>
                  <Image source={getSportImage(game.sportName)} style={styles.sportImage} />
                  <Text style={[styles.gameTitle, { color: colors.text }]}>{game.name}</Text>
                  <Text style={[styles.gameDescription, { color: colors.text }]}>{game.description}</Text>
                </View>

                <View style={[styles.gameFooter, { backgroundColor: colors.card }]}>
                  <Text style={[styles.playerCount, { color: colors.text }]}>
                    {game.currentPlayers}/{game.maxPlayers} Players
                  </Text>
                  <Text style={[styles.skillLevelText, { color: colors.text }]}>
                    {game.skillLevel}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <FilterModal
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        onApply={handleApplyFilters}
        currentFilters={sharedFilters}
      />

      <SearchModal
        visible={isSearchVisible}
        onClose={() => setIsSearchVisible(false)}
        onGameSelect={(game) => {
          setIsSearchVisible(false);
          setSelectedGame(game);
        }}
      />

      <GameDetailsModal
        visible={!!selectedGame}
        game={selectedGame}
        onClose={() => {
          setSelectedGame(null);
          fetchGames();
        }}
      />

      <CreateGameModal
        visible={isCreateGameVisible}
        onClose={() => setIsCreateGameVisible(false)}
        onGameCreated={() => {
          fetchGames();
        }}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + tabBarHeight + 20 }]}
        onPress={() => setIsCreateGameVisible(true)}
        activeOpacity={0.8}
      >
        <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  timestampText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  filterButton: {
    marginLeft: 0,
  },
  searchButton: {
    marginRight: 0,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    marginHorizontal: 0,
  },
  gamesContainer: {
    gap: 15,
  },
  gameContainer: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 0,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  sportText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  gameInfo: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    minHeight: 80,
    justifyContent: 'center',
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  gameDescription: {
    fontSize: 14,
  },
  gameFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  joinButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 5,
  },
  joinText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  playerCount: {
    fontSize: 12,
  },
  skillLevelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sportImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: "cover",
  },
  loadingContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
