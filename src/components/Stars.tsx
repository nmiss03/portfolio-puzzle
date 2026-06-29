import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

const GOLD = '#fbbf24';
const EMPTY = '#d1d5db';

/** Renders a 3-star rating. `size` controls font size. */
export default function Stars({ count, size = 18, style }: { count: number | null; size?: number; style?: TextStyle }) {
  const n = count ?? 0;
  return (
    <Text style={[styles.row, { fontSize: size }, style]}>
      {[0, 1, 2].map((i) => (
        <Text key={i} style={{ color: i < n ? GOLD : EMPTY }}>
          {i < n ? '★' : '☆'}
        </Text>
      ))}
    </Text>
  );
}

const styles = StyleSheet.create({
  row: { letterSpacing: 2 },
});
