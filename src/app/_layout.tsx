import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GameProvider } from '../state/GameContext';
import { colors, font } from '../theme';

// Root layout: wires up the navigation stack and the shared game state.
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GameProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '800', fontSize: font.lg },
            headerShadowVisible: false,
            headerBackTitleVisible: false,
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ title: 'Client Profile' }} />
          <Stack.Screen name="stocks" options={{ title: 'Stock Dashboard' }} />
          <Stack.Screen name="allocate" options={{ title: 'Build Portfolio' }} />
          <Stack.Screen name="result" options={{ title: 'Results', headerBackVisible: false }} />
        </Stack>
      </GameProvider>
    </SafeAreaProvider>
  );
}
