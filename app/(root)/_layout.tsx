import React from "react";
import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(track)/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="trip-screen" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Layout;
