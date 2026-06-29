import React from 'react';
import { View } from 'react-native';

import { CharacterStyle } from '../data/gameState';

/**
 * Simple pixel-art client built from colored rectangles. `scale` resizes the
 * whole figure (1 = ~50px head).
 */
export default function PixelClient({ character, scale = 1 }: { character: CharacterStyle; scale?: number }) {
  const s = (n: number) => n * scale;
  return (
    <View style={{ alignItems: 'center' }}>
      {/* hair strip on top of head */}
      <View style={{ width: s(50), height: s(10), backgroundColor: character.hair }} />
      {/* head */}
      <View style={{ width: s(50), height: s(40), backgroundColor: character.skin, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', marginTop: s(14) }}>
          <View style={{ width: s(6), height: s(6), backgroundColor: '#0066CC' }} />
          <View style={{ width: s(6), height: s(6), backgroundColor: '#0066CC', marginLeft: s(8) }} />
        </View>
        <View style={{ width: s(2), height: s(2), backgroundColor: '#704214', marginTop: s(8) }} />
      </View>
      {/* body + arms */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={{ width: s(8), height: s(60), backgroundColor: character.shirt }} />
        <View style={{ width: s(50), height: s(80), backgroundColor: character.shirt }} />
        <View style={{ width: s(8), height: s(60), backgroundColor: character.shirt }} />
      </View>
    </View>
  );
}
