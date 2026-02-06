import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View, Text, ActivityIndicator, Alert } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from "react-native-maps";
import { useTheme, useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
import { useServer } from "@/contexts/ServerContext";
import { GameWithDetails } from "@/objects/Game";
import GameDetailsModal from "@/components/GameDetailsModal";

export default function MapTab() {
  const { colors } = useTheme();
  const server = useServer();
  const [games, setGames] = useState<GameWithDetails[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameWithDetails | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGames = useCallback(async () => {
    try {
      // Fetch all games, optionally you could filter by current view region
      const allGames = await server.getGamesWithDetails();
      setGames(allGames);
    } catch (error) {
      console.error("Failed to fetch games for map:", error);
    }
  }, [server]);

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
                title={game.name}
                description={game.sportName}
                onCalloutPress={() => handleMarkerPress(game)}
              >
                  <Callout onPress={() => handleMarkerPress(game)}>
                      <View style={styles.callout}>
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
            fetchGames(); // Refresh in case join status changed
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
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
