import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Linking from "expo-linking";

import HomeScreen from "./screens/HomeScreen";
import CameraScreen from "./screens/CameraScreen";
import ResultScreen from "./screens/ResultScreen";

const Stack = createNativeStackNavigator();

const prefix = Linking.createURL("/");

export default function App() {
  const linking = {
    prefixes: [prefix, "LiveHub://"],
    config: {
      screens: {
        Home: "",
        Camera: "scan", // e.g., LiveHub://scan?livestockId=xxx
        Result: "result",
      },
    },
  };

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: "#2E7D32" },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "LiveHub Scanner" }}
        />
        <Stack.Screen
          name="Camera"
          component={CameraScreen}
          options={{ title: "Scan Animal" }}
        />
        <Stack.Screen
          name="Result"
          component={ResultScreen}
          options={{ title: "Scan Result" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
