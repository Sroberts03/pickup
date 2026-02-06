import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View, Text, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from "react-native-maps";
import { useTheme, useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from '@expo/vector-icons';
import * as Location from "expo-location";
import { useServer } from "@/contexts/ServerContext";
import { useAuth } from "@/contexts/AuthContext";
import { GameWithDetails, GameFilter } from "@/objects/Game";
import GameDetailsModal from "@/components/GameDetailsModal";
import FilterModal from "@/components/FilterModal";

export default function MapTab() {
  const { colors } = useTheme();
  const server = useServer();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [games, setGames] = useState<GameWithDetails[]>([]);
  const [filters, setFilters] = useState<GameFilter | null>(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameWithDetails | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchGames = useCallback(async () => {
    setIsRefreshing(true);
    try {
      let finalFilters: GameFilter = { ...(filters || {}) };

      if (filters?.favoriteOnly && user) {
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

      // Fetch games with filters
      const allGames = await server.getGamesWithDetails(finalFilters);
      setGames(allGames);
    } catch (error) {
      console.error("Failed to fetch games for map:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [server, filters, user]);

  // Request location and center map
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission to access location was denied");
          setIsLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        console.error("Error getting location:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchGames();
    }, [fetchGames])
  );

  const handleMarkerPress = (game: GameWithDetails) => {
    setSelectedGame(game);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {userLocation ? (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={userLocation}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {games.map((game) => {
            // Only show games that have valid coordinates
            if (!game.location?.lat || !game.location?.lng) return null;
            
            return (
              <Marker
                key={game.id}
                coordinate={{
                  latitude: Number(game.location.lat),
                  longitude: Number(game.location.lng),
                }}
                onCalloutPress={() => handleMarkerPress(game)}
              >
                  <Callout onPress={() => handleMarkerPress(game)}>
                      <View style={[styles.callout, { maxWidth: 200 }]}>
                          <Text style={styles.calloutTitle}>{game.name}</Text>
                          <Text style={styles.calloutSport}>{game.sportName}</Text>
                          <Text style={styles.calloutInfo}>{new Date(game.startTime).toLocaleDateString()}</Text>
                      </View>
                  </Callout>
              </Marker>
            );
          })}
        </MapView>
      ) : (
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <Text style={{ color: colors.text }}>Unable to get location</Text>
        </View>
      )}

      {selectedGame && (
        <GameDetailsModal
          visible={!!selectedGame}
          game={selectedGame}
          onClose={() => {
            setSelectedGame(null);
            fetchGames();
          }}
        />
      )}

      <TouchableOpacity
        style={[
          styles.filterButton,
          { 
            top: insets.top + 10, 
            backgroundColor: colors.card,
          }
        ]}
        onPress={() => setIsFilterVisible(true)}
      >
        <Feather name="filter" size={24} color={colors.text} />
      </TouchableOpacity>

      <FilterModal
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setIsFilterVisible(false);
        }}
        currentFilters={filters}
      />

      {isRefreshing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    pointerEvents: 'none', // Allow touches to pass through if needed, but here we probably want to block or just show loading
  },
  map: {
    width: "100%",
    height: "100%",
  },
  filterButton: {
    position: 'absolute',
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  callout: {
      padding: 5,
      minWidth: 100,
  },
  calloutTitle: {
      fontWeight: 'bold',
      fontSize: 14,
      marginBottom: 2
  },
  calloutSport: {
      fontSize: 12,
      color: '#666',
      marginBottom: 2
  },
  calloutInfo: {
      fontSize: 10,
      color: '#888'
  }
});
