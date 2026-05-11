export default {
  expo: {
    name: "BookInn",
    slug: "mobile", // This must match your Expo dashboard slug
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/logo.jpg",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.jedcyrus.bookinn",
      infoPlist: {
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true,
        },
      },
    },
    android: {
      package: "com.jedcyrus.bookinn",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "@react-native-community/datetimepicker",
      [
        "expo-build-properties",
        {
          android: {
            usesCleartextTraffic: true,
          },
        },
      ],
    ],
    extra: {
      // Your Hotspot IP for the standalone APK connection
      API_URL: "http://172.20.10.2:8000",
      LOCAL_API_URL: "http://172.20.10.2:8000",
      // The EAS Project ID that was failing to link earlier
      eas: {
        projectId: "6c7adc23-df03-4e00-b11e-7f21a7178955",
      },
    },
    owner: "jedcyrusjuario",
    updates: {
      url: "https://u.expo.dev/6c7adc23-df03-4e00-b11e-7f21a7178955",
    },
    runtimeVersion: {
      policy: "appVersion",
    },
  },
};
