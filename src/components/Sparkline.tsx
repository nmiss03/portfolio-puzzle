import React from 'react';
import { View } from 'react-native';

/**
 * Tiny line chart drawn with plain Views (no SVG dependency). Each segment is a
 * thin View centered on the midpoint of two points and rotated to connect them.
 */
export default function Sparkline({
  data,
  color,
  width = 60,
  height = 20,
}: {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  if (!data || data.length === 0) {
    return <View style={{ width, height }} />;
  }

  const pad = 3;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const xs = data.map((_, i) => (data.length === 1 ? width / 2 : pad + (i * (width - pad * 2)) / (data.length - 1)));
  const ys = data.map((v) => height - pad - ((v - min) / range) * (height - pad * 2));

  const dots = data.map((_, i) => (
    <View
      key={`d${i}`}
      style={{
        position: 'absolute',
        left: xs[i] - 1.5,
        top: ys[i] - 1.5,
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: color,
      }}
    />
  ));

  const segments = [];
  for (let i = 0; i < data.length - 1; i++) {
    const x1 = xs[i];
    const y1 = ys[i];
    const x2 = xs[i + 1];
    const y2 = ys[i + 1];
    const len = Math.hypot(x2 - x1, y2 - y1);
    const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    segments.push(
      <View
        key={`s${i}`}
        style={{
          position: 'absolute',
          left: midX - len / 2,
          top: midY - 1,
          width: len,
          height: 2,
          backgroundColor: color,
          transform: [{ rotate: `${angle}deg` }],
        }}
      />
    );
  }

  return (
    <View style={{ width, height }}>
      {segments}
      {dots}
    </View>
  );
}
