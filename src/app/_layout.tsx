import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GameProvider } from '../state/GameContext';
import { colors, font } from '../theme';

// Root layout: wires up the navigation stack and the shared game state.
//
// Flow: index (LevelSelect)
//        -> (profile)/CustomerIntro   (animated cutscene)
//        -> (game)/StockDashboard     (monitor-framed stock grid)
//        -> (game)/AllocationUI       (build the portfolio)
//        -> (game)/ResultScreen       (score + feedback)
//
// The (profile) and (game) groups are organizational only — they don't change
// the URL. The native stack auto-renders a back button on every screen pushed
// on top of another, i.e. everything except the "index" home route.
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GameProvider>
        {/* Dark status-bar icons read well on the light background. */}
        <StatusBar style="dark" />
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
          <Stack.Screen name="(profile)/CustomerIntro" options={{ title: 'Meet the Client' }} />
          <Stack.Screen name="(game)/StockDashboard" options={{ title: 'Stock Terminal' }} />
          <Stack.Screen name="(game)/AllocationUI" options={{ title: 'Build Portfolio' }} />
          <Stack.Screen name="(game)/ResultScreen" options={{ title: 'Results' }} />
        </Stack>
      </GameProvider>
    </SafeAreaProvider>
  );
}
