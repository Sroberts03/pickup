import { StyleSheet, ScrollView, View, TouchableOpacity, Text, Image, ImageSourcePropType, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useTheme } from "@react-navigation/native";
import React, { useState } from "react";
import { GameWithDetails } from "@/objects/Game";
import GameDetailsModal from "@/components/GameDetailsModal";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";

function getSportImage(sportName: string): ImageSourcePropType {
  const key = sportName.toLowerCase();
  if (key.includes("basketball")) return require("../../assets/images/basketball.png");
  if (key.includes("soccer")) return require("../../assets/images/soccer.png");
  if (key.includes("football")) return require("../../assets/images/football.png");
  return require("../../assets/images/football.png"); // fallback if unknown
}

export default function MyGamesScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { userGames: games, loading, refreshData } = useData();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [selectedGame, setSelectedGame] = useState<GameWithDetails | null>(null);

  const formatDateTime = (date: Date) => {
    const today = new Date();
    const gameDate = new Date(date);
    
    // Check if it's today
    if (gameDate.toDateString() === today.toDateString()) {
      return {
        date: "TODAY",
        time: gameDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }
    
    // Check if it's tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (gameDate.toDateString() === tomorrow.toDateString()) {
      return {
        date: "TOMORROW",
        time: gameDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }
    
    // Otherwise show the actual date
    return {
      date: gameDate.toLocaleDateString([], { month: 'short', day: 'numeric' }).toUpperCase(),
      time: gameDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const groupGamesByDate = () => {
    const grouped: { [key: string]: GameWithDetails[] } = {};
    
    games.forEach(game => {
      const { date } = formatDateTime(game.startTime);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(game);
    });
    
    return grouped;
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Please log in to view your games</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + tabBarHeight }}
        showsVerticalScrollIndicator={false}
        refreshControl={
           <RefreshControl refreshing={loading} onRefresh={refreshData} />
        }
      >
        {loading && games.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.gamesContainer}>
            {Object.keys(groupGamesByDate()).length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.text }]}>You haven&apos;t joined any games yet</Text>
              </View>
            ) : (
              Object.entries(groupGamesByDate()).map(([date, dateGames]) => (
                <View key={date}>
                  {dateGames.map((game, index) => {
                    const { time } = formatDateTime(game.startTime);
                    return (
                      <View key={game.id} style={styles.gameSection}>
                        <View style={styles.dateTimeSection}>
                          <Text style={[styles.dateText, { color: colors.text }]}>{date}</Text>
                          <Text style={[styles.timeText, { color: colors.text }]}>{time}</Text>
                        </View>
                        
                        <TouchableOpacity
                          style={[styles.gameCard, { borderColor: colors.border }]}
                          onPress={() => setSelectedGame(game)}
                          activeOpacity={0.9}
                        >
                          <View style={[styles.sportHeader, { backgroundColor: '#E5E5E5' }]}>
                            <Text style={[styles.sportText, { color: '#333' }]}>{game.sportName}</Text>
                          </View>
                          
                          <View style={[styles.gameContent, { backgroundColor: colors.background }]}>
                            <Image source={getSportImage(game.sportName)} style={styles.sportImage} />
                            <View style={styles.gameTextContent}>
                              <Text style={[styles.gameTitle, { color: colors.text }]}>{game.name}</Text>
                              <Text style={[styles.gameDescription, { color: colors.text }]}>{game.description}</Text>
                            </View>
                            <View style={styles.gameFooter}>
                              <View style={styles.skillLevelBadge}>
                                <Text style={styles.skillLevelBadgeText}>{game.skillLevel}</Text>
                              </View>
                              <Text style={[styles.playerCount, { color: colors.text }]}>
                                {game.currentPlayers}/{game.maxPlayers} players
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      <GameDetailsModal
        visible={!!selectedGame}
        game={selectedGame}
        onClose={() => {
          setSelectedGame(null);
          // Data is auto-refreshed by GameDetailsModal calling refreshData() internally or via context?
          // We need GameDetailsModal to call refreshData()!
          // Or we can call it here if we insist, but GameDetailsModal is better.
          // Let's call refreshData here too just in case the modal didn't.
          refreshData();
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
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  gamesContainer: {
    flex: 1,
  },
  gameSection: {
    marginBottom: 24,
  },
  dateTimeSection: {
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  gameCard: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  sportHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sportText: {
    fontSize: 14,
    fontWeight: '600',
  },
  gameContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    position: 'relative',
  },
  sportImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
    resizeMode: 'cover',
  },
  gameTextContent: {
    marginBottom: 8,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
  },
  playerCountContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  gameFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  skillLevelBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillLevelBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  playerCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
