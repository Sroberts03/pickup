import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useServer } from "@/contexts/ServerContext";
import Sport from "@/objects/Sport";

export default function FavoriteSportsOnboarding() {
  const { colors } = useTheme();
  const router = useRouter();
  const server = useServer();
  const { user, setNeedsFavoriteSports } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [allSports, setAllSports] = useState<Sport[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!user) return;

    const fetchSports = async () => {
      setIsLoading(true);
      try {
        const [sports, favorites] = await Promise.all([
          server.getAllSports(),
          server.getFavouriteSports(user.id),
        ]);
        setAllSports(sports);
        setSelectedIds(new Set(favorites.map((sport) => sport.id)));
      } catch (error) {
        console.error("Failed to load sports:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSports();
  }, [server, user]);

  const sortedSports = useMemo(() => {
    return [...allSports].sort((a, b) => a.name.localeCompare(b.name));
  }, [allSports]);

  const toggleSport = (sportId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(sportId)) {
        next.delete(sportId);
      } else {
        next.add(sportId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await server.updateFavouriteSports(user.id, Array.from(selectedIds));
      await setNeedsFavoriteSports(false);
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Failed to update favorite sports:", error);
      Alert.alert("Error", "Failed to update favorite sports. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <View style={styles.placeholder} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>FAVORITE SPORTS</Text>
        <View style={styles.placeholder} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.text} />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Pick Your Favorites</Text>
          <View style={styles.pillsContainer}>
            {sortedSports.map((sport) => {
              const isSelected = selectedIds.has(sport.id);
              return (
                <TouchableOpacity
                  key={sport.id}
                  style={[
                    styles.pill,
                    isSelected ? styles.pillSelected : styles.pillUnselected,
                  ]}
                  onPress={() => toggleSport(sport.id)}
                >
                  <Text
                    style={[
                      styles.pillText,
                      isSelected ? styles.pillSelectedText : styles.pillUnselectedText,
                    ]}
                  >
                    {sport.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  placeholder: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  pillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingBottom: 20,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  pillSelected: {
    backgroundColor: "#CFE5FF",
  },
  pillUnselected: {
    backgroundColor: "#E0E0E0",
  },
  pillText: {
    fontSize: 14,
    fontWeight: "600",
  },
  pillSelectedText: {
    color: "#1C3D6E",
  },
  pillUnselectedText: {
    color: "#4A4A4A",
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
