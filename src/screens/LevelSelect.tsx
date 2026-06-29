import { View, Text, Button, StyleSheet } from 'react-native';

export default function LevelSelect() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Portfolio Rebalancing Puzzle</Text>
      <Text style={styles.subtitle}>Level 1: The Young Saver</Text>
      <Button title="Start Level 1" onPress={() => console.log('Start Level 1')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 20 }
});
