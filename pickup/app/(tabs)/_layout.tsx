import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, useFocusEffect } from "@react-navigation/native";
import { useColorScheme, View, StyleSheet } from "react-native";
import React, { useCallback, useState } from "react";
import { useServer } from "@/contexts/ServerContext";
import { useAuth } from "@/contexts/AuthContext";

export default function TabsLayout() {
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const server = useServer();
  const { user } = useAuth();
  const [hasUnreadGroups, setHasUnreadGroups] = useState(false);

  const refreshUnread = useCallback(async () => {
    if (!user) {
      setHasUnreadGroups(false);
      return;
    }

    try {
      const userGroups = await server.getUserGroups(user.id);
      if (userGroups.length === 0) {
        setHasUnreadGroups(false);
        return;
      }

      const unreadStatuses = await Promise.all(
        userGroups.map((group) => server.getGroupUnreadStatus(group.id))
      );

      setHasUnreadGroups(unreadStatuses.some(Boolean));
    } catch (error) {
      console.error("Failed to refresh group unread state:", error);
    }
  }, [server, user]);

  useFocusEffect(
    useCallback(() => {
      refreshUnread();
    }, [refreshUnread])
  );
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
            backgroundColor: colorScheme === 'dark' ? 'rgba(80, 80, 80, 0.5)' : 'rgba(237, 237, 237, 0.5)',
            width: '80%',
            height: 60,
            borderRadius: 30,
            bottom: 30,
            position: 'absolute',
            left: '50%',
            marginLeft: '10%',
            shadowColor: '#000000aa',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Play",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="basketball-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="myGames"
        options={{
          title: "My Games",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: "Groups",
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconWrapper}>
              <Ionicons name="people-outline" size={size} color={color} />
              {hasUnreadGroups && (
                <View style={[styles.tabUnreadDot, { borderColor: colors.background }]} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    position: "relative",
  },
  tabUnreadDot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007AFF",
    top: -2,
    right: -6,
    borderWidth: 2,
  },
});
