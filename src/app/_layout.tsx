import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GameProvider } from '../state/GameContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { colors, font } from '../theme';

// Status-bar icons flip with the theme: dark icons on the light palette,
// light icons on the dark one.
function ThemedStatusBar() {
  const { mode } = useTheme();
  return <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />;
}

// Root layout: wires up the navigation stack and the shared game state.
//
// Flow: index (start screen) -> (game)/WeekScreen (the whole week-by-week
// career, which manages its own internal phases: week intro -> client intro ->
// portfolio builder -> week transition -> game over, plus the Client Book).
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
      <GameProvider>
        <ThemedStatusBar />
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
          {/* Home / entry point — TitleScreen. The root, so no back button. */}
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(game)/WeekScreen" options={{ headerShown: false }} />
        </Stack>
      </GameProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
