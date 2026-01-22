import { StyleSheet, ScrollView, View, TouchableOpacity, Text, Image, ImageSourcePropType, ActivityIndicator } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useTheme } from "@react-navigation/native";
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from "react";
import { useServer } from "@/contexts/ServerContext";
import { GameFilter, GameWithDetails } from "@/objects/Game";
import FilterModal from "@/components/FilterModal";
import SearchModal from "@/components/SearchModal";
import GameDetailsModal from "@/components/GameDetailsModal";

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
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [games, setGames] = useState<GameWithDetails[]>([]);
  const [filters, setFilters] = useState<GameFilter | null>(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleApplyFilters = (newFilters: GameFilter) => {
    setFilters(newFilters);
  };

  const fetchGames = async () => {
    setIsLoading(true);
    try {
      const gamesList = await server.getGamesWithDetails(filters || undefined);
      setGames(gamesList);
    } catch (error) {
      console.error("Failed to fetch games:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [server, filters]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + tabBarHeight }}
      >
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.filterButton} onPress={() => setIsFilterVisible(true)}>
            <Feather name="filter" size={30} style={{ color: colors.text }} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchButton} onPress={() => setIsSearchVisible(true)}>
            <Feather name="search" size={30} style={{ color: colors.text }} />
          </TouchableOpacity>
        </View>



        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
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
        currentFilters={filters}
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
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 15,
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
});
