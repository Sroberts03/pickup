import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { useColorScheme, ActivityIndicator, View } from "react-native";
import { ServerContext } from "../contexts/ServerContext";
import { AuthProvider } from '../auth/AuthProvider';
import { useAuth } from "@/contexts/AuthContext";
import React, { useEffect } from "react";
import { getServerFacade } from "@/serverFacade/serverFactory";
import { DataProvider } from "@/contexts/DataContext";
import { WebsocketContext } from "@/contexts/SocketContext";
import { getWebSocketFacade } from "@/websocket/websocketFactory";

function RootLayoutNav() {
  const { user, loading, needsFavoriteSports } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && needsFavoriteSports && !inOnboardingGroup) {
      router.replace('/(onboarding)/favoriteSports');
    } else if (user && !needsFavoriteSports && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (user && !needsFavoriteSports && inOnboardingGroup) {
      router.replace('/(tabs)');
    }
  }, [user, loading, needsFavoriteSports, segments, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(onboarding)/favoriteSports" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const serverFacade = React.useMemo(() => getServerFacade(), []);
  const WebSocketFacade = React.useMemo(() => getWebSocketFacade(serverFacade), [serverFacade]);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <ServerContext.Provider value={serverFacade}>
          <WebsocketContext.Provider value={WebSocketFacade}>
            <AuthProvider>
              <DataProvider>
                <RootLayoutNav />
              </DataProvider>
            </AuthProvider>
          </WebsocketContext.Provider>
        </ServerContext.Provider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
