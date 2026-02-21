import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@react-navigation/native";
import { useAuth } from "@/contexts/AuthContext";
import User from "@/objects/User";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import SettingsModal from "@/components/SettingsModal";
import { useData } from "@/contexts/DataContext";

export default function ProfileScreen() {
  const { colors } = useTheme();
  const user = useAuth().user as User;
  const { favoriteSports, userStats: stats, loading, refreshData } = useData();
  const [showSettings, setShowSettings] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
        console.log("Setting avatar for user:", user);
        setUserAvatar(`https://api.dicebear.com/7.x/fun-emoji/png?seed=${user.id}`);
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const getSportIcon = (sportName: string) => {
    const lowerName = sportName.toLowerCase();
    switch (lowerName) {
      case "basketball": return "basketball-outline";
      case "football": return "american-football-outline";
      case "soccer": return "football-outline";
      case "tennis": return "tennisball-outline";
      case "baseball": return "baseball-outline";
      case "volleyball": return "basketball-outline";
      default: return "ellipse-outline";
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with Settings */}
        <View style={styles.header}>
          <TouchableOpacity testID="settings-button" onPress={() => setShowSettings(true)}>
            <Ionicons name="settings-outline" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {userAvatar ? (
              <Image testID="profile-avatar" source={{ uri: userAvatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: "#E0E0E0" }]}>
                <Ionicons name="person-outline" size={60} color="#757575" />
              </View>
            )}
          </View>
          <Text testID="profile-name" style={[styles.name, { color: colors.text }]}>{user.firstName} {user.lastName}</Text>
        </View>

        {loading ? (
          <View style={{ marginTop: 50 }}>
            <ActivityIndicator size="large" color={colors.text} />
          </View>
        ) : (
          <>
            {/* Favorite Sports */}
            <View style={styles.section}>
              <Text testID="favorite-sports-title" style={[styles.sectionTitle, { color: colors.text }]}>favorite sports</Text>
              <View style={styles.pillsContainer}>
                {favoriteSports.map((sport) => (
                  <View key={sport.id} testID={`sport-pill-${sport.name.toLowerCase()}`} style={styles.pill}>
                    <Ionicons name={getSportIcon(sport.name) as any} size={16} color="#000" style={styles.pillIcon} />
                    <Text style={styles.pillText}>{sport.name}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Quick Stats */}
            {stats && (
              <View style={styles.section}>
                 <Text testID="quick-stats-title" style={[styles.sectionTitle, { color: colors.text }]}>quick stats</Text>
                 <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <Text testID="games-joined-value" style={[styles.statValue, { color: colors.text }]}>{stats.gamesPlayed}</Text>
                      <Text style={[styles.statLabel, { color: colors.text, opacity: 0.7 }]}>Games Joined</Text>
                    </View>
                    <View style={[styles.statItem, styles.statBorder]}>
                      <Text testID="games-organized-value" style={[styles.statValue, { color: colors.text }]}>{stats.gamesOrganized}</Text>
                      <Text style={[styles.statLabel, { color: colors.text, opacity: 0.7 }]}>Games Organized</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text testID="member-since-value" style={[styles.statValue, { color: colors.text }]}>{user.joinedYear}</Text>
                      <Text style={[styles.statLabel, { color: colors.text, opacity: 0.7 }]}>Member Since</Text>
                    </View>
                 </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onFavoritesUpdated={refreshData}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: 'flex-end',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#006eff64',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  pillIcon: {
    marginRight: 6,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    borderRadius: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.2)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});
