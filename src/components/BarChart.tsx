import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

import { C, FONT_PIXEL } from '../theme';

export interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

const GREEN = C.success;
const RED = C.danger;

/**
 * Simple animated bar chart drawn with Views (no SVG). Bars grow from 0 to
 * their value over ~1s. Positive bars are green (or a provided color), negative
 * bars are red.
 */
export default function BarChart({ data, height = 160 }: { data: BarDatum[]; height?: number }) {
  const grow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    grow.setValue(0);
    Animated.timing(grow, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.cubic), useNativeDriver: false }).start();
  }, [grow, data]);

  const maxAbs = Math.max(1, ...data.map((d) => Math.abs(d.value)));
  const plotHeight = height - 28; // room for labels

  return (
    <View style={styles.wrap}>
      <View style={[styles.plot, { height: plotHeight }]}>
        {data.map((d, i) => {
          const frac = Math.abs(d.value) / maxAbs;
          const barColor = d.value < 0 ? RED : d.color || GREEN;
          const barHeight = grow.interpolate({ inputRange: [0, 1], outputRange: [0, frac * (plotHeight - 18)] });
          return (
            <View key={i} style={styles.col}>
              <Animated.Text style={[styles.value, { color: barColor }]}>
                {d.value >= 0 ? '+' : '-'}${Math.abs(Math.round(d.value)).toLocaleString()}
              </Animated.Text>
              <Animated.View style={{ width: 36, height: barHeight, backgroundColor: barColor, borderWidth: 2, borderColor: C.border }} />
            </View>
          );
        })}
      </View>
      <View style={styles.axis} />
      <View style={styles.labels}>
        {data.map((d, i) => (
          <Text key={i} style={styles.label} numberOfLines={1}>
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  plot: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around' },
  col: { alignItems: 'center', justifyContent: 'flex-end', flex: 1 },
  value: { fontFamily: FONT_PIXEL, fontSize: 11, fontWeight: '800', marginBottom: 4 },
  axis: { height: 2, backgroundColor: C.border, marginTop: 0 },
  labels: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 6 },
  label: { fontFamily: FONT_PIXEL, flex: 1, textAlign: 'center', color: C.textDim, fontSize: 11, fontWeight: '700' },
});
