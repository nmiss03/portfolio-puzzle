import React, { useState, useCallback } from 'react';
import { SafeAreaView, StyleSheet, View, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import LevelSelect from './screens/LevelSelect';
import CustomerProfile from './screens/CustomerProfile';
import StockDashboard from './screens/StockDashboard';
import AllocationUI from './screens/AllocationUI';
import ResultScreen from './screens/ResultScreen';

import { getLevel } from './data/levels';
import { getStocksByIds } from './data/stocks';
import { scoreAllocation } from './data/scoring';
import { colors } from './theme';

// Screens are driven by a tiny state machine in this component — no external
// navigation library needed for a 5-screen single-flow game.
const SCREENS = {
  LEVEL_SELECT: 'levelSelect',
  PROFILE: 'profile',
  DASHBOARD: 'dashboard',
  ALLOCATION: 'allocation',
  RESULT: 'result',
};

export default function App() {
  const [screen, setScreen] = useState(SCREENS.LEVEL_SELECT);
  const [levelId, setLevelId] = useState(1);
  const [allocations, setAllocations] = useState({});
  const [result, setResult] = useState(null);

  const level = getLevel(levelId);

  const selectLevel = useCallback((id) => {
    const target = getLevel(id);
    if (!target || target.locked) return;
    setLevelId(id);
    setAllocations({});
    setResult(null);
    setScreen(SCREENS.PROFILE);
  }, []);

  const handleSubmit = useCallback(
    (numericAllocations) => {
      setAllocations(numericAllocations);
      const stocks = getStocksByIds(level.stockIds);
      setResult(scoreAllocation(numericAllocations, stocks, level));
      setScreen(SCREENS.RESULT);
    },
    [level]
  );

  const goHome = useCallback(() => setScreen(SCREENS.LEVEL_SELECT), []);

  let content;
  switch (screen) {
    case SCREENS.PROFILE:
      content = (
        <CustomerProfile
          level={level}
          onBack={goHome}
          onContinue={() => setScreen(SCREENS.DASHBOARD)}
        />
      );
      break;
    case SCREENS.DASHBOARD:
      content = (
        <StockDashboard
          level={level}
          onBack={() => setScreen(SCREENS.PROFILE)}
          onContinue={() => setScreen(SCREENS.ALLOCATION)}
        />
      );
      break;
    case SCREENS.ALLOCATION:
      content = (
        <AllocationUI
          level={level}
          initialAllocations={allocations}
          onBack={() => setScreen(SCREENS.DASHBOARD)}
          onSubmit={handleSubmit}
        />
      );
      break;
    case SCREENS.RESULT:
      content = (
        <ResultScreen
          level={level}
          result={result}
          onRetry={() => setScreen(SCREENS.ALLOCATION)}
          onNextLevel={selectLevel}
          onHome={goHome}
        />
      );
      break;
    case SCREENS.LEVEL_SELECT:
    default:
      content = <LevelSelect onSelectLevel={selectLevel} />;
      break;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.container}>{content}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
    // On Android SafeAreaView does not pad the status bar; add it manually.
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
