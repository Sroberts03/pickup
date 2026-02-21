export default {
  expo: {
    name: "pickup",
    slug: "pickup",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/pickup.png",
    scheme: "pickup",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.samroberts.pickup",
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_IOS_GOOGLE_MAPS_API_KEY
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "We use your location to show nearby games.",
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION"
      ],
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/pickup.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_ANDROID_GOOGLE_MAPS_API_KEY
        }
      },
      package: "com.samroberts.pickup",
      versionCode: 1
    },
    web: {
      output: "static",
      favicon: "./assets/images/pickup.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/pickup.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000"
          }
        }
      ],
      "expo-secure-store",
      "expo-web-browser"
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    extra: {
      router: {},
      eas: {
        projectId: "4d903578-0d6f-4376-8053-e54bed53f17c"
      }
    }
  }
};
