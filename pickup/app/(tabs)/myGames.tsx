import { StyleSheet, ScrollView, View, TouchableOpacity, Text, Image, ImageSourcePropType, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useTheme, useNavigation } from "@react-navigation/native";
import React, { useState, useRef, useEffect } from "react";
import { GameWithDetails } from "@/objects/Game";
import GameDetailsModal from "@/components/GameDetailsModal";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";

function getSportImage(sportName: string): ImageSourcePropType {
  const key = sportName?.toLowerCase() || "";
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
  const navigation = useNavigation();
  const [selectedGame, setSelectedGame] = useState<GameWithDetails | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const todaySectionRef = useRef<View>(null);

  const scrollToToday = () => {
    if (todaySectionRef.current && scrollViewRef.current) {
      todaySectionRef.current.measureLayout(
        scrollViewRef.current as any,
        (x, y) => {
          scrollViewRef.current?.scrollTo({ y: y - 10, animated: true });
        },
        () => {}
      );
    }
  };

  // Scroll to today's section when games are loaded
  useEffect(() => {
    if (games.length > 0) {
      setTimeout(() => {
        scrollToToday();
      }, 100);
    }
  }, [games.length]);

  // Listen for tab press to scroll to today
  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress' as any, (e) => {
      // If already on this screen, scroll to today
      scrollToToday();
    });

    return unsubscribe;
  }, [navigation]);

  const formatDateTime = (date: Date) => {
    const gameDate = new Date(date);
    return {
      date: gameDate.toLocaleDateString([], { month: 'short', day: 'numeric' }).toUpperCase(),
      time: gameDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getStartOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const getEndOfWeek = (date: Date) => {
    const d = getStartOfWeek(date);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  type GameSection = {
    title: string;
    games: { date: string; time: string; game: GameWithDetails }[];
    isToday?: boolean;
  };

  const groupGamesBySection = (): GameSection[] => {
    const now = new Date();
    const today = getStartOfDay(now);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
    const endOfWeek = getEndOfWeek(now);

    const sections: GameSection[] = [];
    
    const pastGames: { date: string; time: string; game: GameWithDetails }[] = [];
    const todayGames: { date: string; time: string; game: GameWithDetails }[] = [];
    const tomorrowGames: { date: string; time: string; game: GameWithDetails }[] = [];
    const thisWeekGames: { date: string; time: string; game: GameWithDetails }[] = [];
    const laterGames: { date: string; time: string; game: GameWithDetails }[] = [];

    games.forEach(game => {
      const gameDate = new Date(game.startTime);
      const { date, time } = formatDateTime(game.startTime);
      const gameData = { date, time, game };

      if (gameDate < today) {
        pastGames.push(gameData);
      } else if (gameDate >= today && gameDate < tomorrow) {
        todayGames.push(gameData);
      } else if (gameDate >= tomorrow && gameDate < dayAfterTomorrow) {
        tomorrowGames.push(gameData);
      } else if (gameDate >= dayAfterTomorrow && gameDate <= endOfWeek) {
        thisWeekGames.push(gameData);
      } else {
        laterGames.push(gameData);
      }
    });

    // Sort each section by date
    const sortByDate = (a: { game: GameWithDetails }, b: { game: GameWithDetails }) => 
      new Date(a.game.startTime).getTime() - new Date(b.game.startTime).getTime();

    pastGames.sort(sortByDate);
    todayGames.sort(sortByDate);
    tomorrowGames.sort(sortByDate);
    thisWeekGames.sort(sortByDate);
    laterGames.sort(sortByDate);

    if (pastGames.length > 0) {
      sections.push({ title: 'PAST', games: pastGames });
    }
    if (todayGames.length > 0) {
      sections.push({ title: 'TODAY', games: todayGames, isToday: true });
    }
    if (tomorrowGames.length > 0) {
      sections.push({ title: 'TOMORROW', games: tomorrowGames });
    }
    if (thisWeekGames.length > 0) {
      sections.push({ title: 'THIS WEEK', games: thisWeekGames });
    }
    if (laterGames.length > 0) {
      sections.push({ title: 'LATER', games: laterGames });
    }

    return sections;
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
        ref={scrollViewRef}
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
            {groupGamesBySection().length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text testID="my-games-empty-state" style={[styles.emptyText, { color: colors.text }]}>You haven&apos;t joined any games yet</Text>
              </View>
            ) : (
              groupGamesBySection().map((section) => (
                <View 
                  key={section.title} 
                  testID={`section-${section.title.toLowerCase().replace(/\s+/g, '-')}`}
                  ref={section.isToday ? todaySectionRef : null}
                >
                  <Text testID={`section-title-${section.title.toLowerCase().replace(/\s+/g, '-')}`} style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
                  {section.games.map(({ date, time, game }) => (
                    <View key={game.id} style={styles.gameSection}>
                      <View style={styles.dateTimeSection}>
                        <Text style={[styles.dateText, { color: colors.text }]}>{date}</Text>
                        <Text style={[styles.timeText, { color: colors.text }]}>{time}</Text>
                      </View>
                      
                      <TouchableOpacity
                        testID={`my-game-card-${game.id}`}
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
                  ))}
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 20,
    marginBottom: 16,
    letterSpacing: 0.5,
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
