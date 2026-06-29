import React from 'react';
import { View, Text, Button } from 'react-native';

export default function LevelSelect() {
  return (
    <View>
      <Text>Portfolio Rebalancing Puzzle</Text>
      <Text>Level 1: The Young Saver</Text>
      <Button title="Start Level 1" onPress={() => console.log('Start Level 1')} />
    </View>
  );
}
