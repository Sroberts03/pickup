import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@react-navigation/native";
import { useAuth } from "@/contexts/AuthContext";
import User from "@/objects/User";
import { useServer } from "@/contexts/ServerContext";
import { useEffect, useState } from "react";
import Sport from "@/objects/Sport";
import Achievement from "@/objects/Achievement";
import { Ionicons } from "@expo/vector-icons";
import SettingsModal from "@/components/SettingsModal";

export default function ProfileScreen() {
  const { colors } = useTheme();
  const user = useAuth().user as User;
  const server = useServer();
  const [loading, setLoading] = useState(true);
  const [favouriteSports, setFavouriteSports] = useState<Sport[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const [sports, userAchievements] = await Promise.all([
          server.getFavouriteSports(user.id),
          server.getUserAchievements(user.id)
        ]);
        setFavouriteSports(sports);
        setAchievements(userAchievements);
        setUserAvatar(`https://api.dicebear.com/7.x/fun-emoji/png?seed=${user.id}`);
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [server, user]);
  
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
          <TouchableOpacity onPress={() => setShowSettings(true)}>
            <Ionicons name="settings-outline" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {userAvatar ? (
              <Image source={{ uri: userAvatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: "#E0E0E0" }]}>
                <Ionicons name="person-outline" size={60} color="#757575" />
              </View>
            )}
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{user.firstName} {user.lastName}</Text>
        </View>

        {loading ? (
          <View style={{ marginTop: 50 }}>
            <ActivityIndicator size="large" color={colors.text} />
          </View>
        ) : (
          <>
            {/* Favorite Sports */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>favorite sports</Text>
              <View style={styles.pillsContainer}>
                {favouriteSports.map((sport) => (
                  <View key={sport.id} style={styles.pill}>
                    <Ionicons name={getSportIcon(sport.name) as any} size={16} color="#000" style={styles.pillIcon} />
                    <Text style={styles.pillText}>{sport.name}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Achievements */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Achievements</Text>
              <View style={styles.achievementsContainer}>
                {achievements.map((achievement) => (
                  <View key={achievement.id} style={styles.achievementCircle}>
                    {/* Placeholder for achievement icon/image */}
                    {/* If iconUrl exists we would use it, but for design consistency with wireframe: */}
                    {achievement.iconUrl ?
                      <Image source={{ uri: achievement.iconUrl }} style={styles.achievementImage} /> :
                      null
                    }
                  </View>
                ))}
                {/* Add some placeholders if empty to match design look? No, stick to real data */}
                {achievements.length === 0 && (
                  <Text style={{ color: colors.text, opacity: 0.5 }}>No achievements yet</Text>
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
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
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'flex-start',
  },
  achievementCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D9D9D9',
    marginRight: 8, // fallback for gap
    marginBottom: 16,
  },
  achievementImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  }
});
