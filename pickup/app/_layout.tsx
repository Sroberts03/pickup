import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { useColorScheme, ActivityIndicator, View } from "react-native";
import { ServerContext } from "../contexts/ServerContext";
import { AuthProvider } from '../auth/AuthProvider';
import { useAuth } from "@/contexts/AuthContext";
import React, { useEffect } from "react";
import { getServerFacade } from "@/serverFacade/serverFactory";

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments, router]);

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
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const serverFacade = React.useMemo(() => getServerFacade(), []);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <ServerContext.Provider value={serverFacade}>
          <AuthProvider>
            <RootLayoutNav />
          </AuthProvider>
        </ServerContext.Provider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
