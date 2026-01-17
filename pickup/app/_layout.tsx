import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { useColorScheme } from "react-native";
import { ServerContext } from "../contexts/ServerContext";
import TestServerFacade from "@/serverFacade/testServerFacade";

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const serverFacade = new TestServerFacade();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <ServerContext.Provider value={serverFacade}>
          <RootLayoutNav />
        </ServerContext.Provider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
