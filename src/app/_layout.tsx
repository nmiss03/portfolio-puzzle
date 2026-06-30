import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GameProvider } from '../state/GameContext';
import { colors, font } from '../theme';

// Root layout: wires up the navigation stack and the shared game state.
//
// Flow: index (start screen) -> (game)/WeekScreen (the whole week-by-week
// career, which manages its own internal phases: week intro -> client intro ->
// portfolio builder -> week transition -> game over, plus the Client Book).
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GameProvider>
        {/* Light status-bar icons read well on the dark retro background. */}
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '800', fontSize: font.lg },
            headerShadowVisible: false,
            headerBackTitleVisible: false,
            contentStyle: { backgroundColor: colors.bg },
            animation: 'slide_from_right',
          }}
        >
          {/* Home / entry point — LevelSelect. The root, so no back button. */}
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(game)/WeekScreen" options={{ headerShown: false }} />
        </Stack>
      </GameProvider>
    </SafeAreaProvider>
  );
}
