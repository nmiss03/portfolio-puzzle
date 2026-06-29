import React from 'react';
import { View } from 'react-native';

/**
 * Simple colored-rectangle "character": a body in the client's color with a
 * lighter head shape. A placeholder that can be upgraded to pixel art later.
 */
export default function CharacterVisual({
  color,
  width = 60,
  height = 80,
}: {
  color: string;
  width?: number;
  height?: number;
}) {
  const head = width * 0.45;
  return (
    <View
      style={{
        width,
        height,
        borderRadius: 6,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'flex-end',
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: head,
          height: head,
          borderRadius: head / 2,
          backgroundColor: 'rgba(255,255,255,0.4)',
          marginBottom: height * 0.18,
        }}
      />
    </View>
  );
}
