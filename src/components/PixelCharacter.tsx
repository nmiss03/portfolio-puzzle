import React, { useMemo } from 'react';
import { View } from 'react-native';

// Procedurally generated pixel character, deterministic per `seed` (clientId).
// Grid is 10 cols x 13 rows; each cell is `cell` px (default 7 -> 70x91).

const SKINS = ['#FFD4A3', '#E8A87C', '#D4957A', '#C9896D'];
const HAIRS = ['#2C2416', '#5C4033', '#8B6F47', '#FFD700', '#FF6347'];
const EYES = ['#0066CC', '#008B00', '#8B0000', '#FFB300'];
const SHIRTS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
const PANTS = ['#333333', '#1A4D7A', '#2D5016', '#4A3728'];
const MOUTH = '#5C4033';
const SHOE = '#2b2b2b';

const ROWS = 13;
const COLS = 10;

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildGrid(seed: string): (string | null)[][] {
  const rng = mulberry32(hashSeed(seed));
  const pick = <T,>(arr: T[]) => arr[Math.floor(rng() * arr.length)];

  const skin = pick(SKINS);
  const hair = pick(HAIRS);
  const eye = pick(EYES);
  const shirt = pick(SHIRTS);
  const pants = pick(PANTS);
  const hairStyle = Math.floor(rng() * 3); // 0 straight, 1 full, 2 spiky
  const mood = Math.floor(rng() * 3); // 0 happy, 1 neutral, 2 sad
  const sleeve = rng() > 0.5 ? shirt : skin;
  const stripes = rng() > 0.5;

  const g: (string | null)[][] = Array.from({ length: ROWS }, () => Array<string | null>(COLS).fill(null));

  // Head (rows 0-4, cols 2-6)
  for (let r = 0; r <= 4; r++) for (let c = 2; c <= 6; c++) g[r][c] = skin;

  // Hair (rows 0-2)
  for (let c = 2; c <= 6; c++) g[0][c] = hair;
  if (hairStyle === 1) {
    for (let c = 2; c <= 6; c++) g[1][c] = hair;
  } else if (hairStyle === 2) {
    g[0][2] = hair; g[0][4] = hair; g[0][6] = hair; // spiky top
    g[1][2] = hair; g[1][6] = hair;
  } else {
    g[1][2] = hair; g[1][6] = hair; // straight sides
  }

  // Eyes (row 2)
  g[2][3] = eye;
  g[2][5] = eye;

  // Mouth (row 4)
  if (mood === 0) { g[4][3] = MOUTH; g[4][4] = MOUTH; g[4][5] = MOUTH; } // happy
  else if (mood === 1) { g[4][4] = MOUTH; } // neutral
  else { g[4][3] = MOUTH; g[4][5] = MOUTH; } // sad

  // Body (rows 5-10, cols 2-6)
  for (let r = 5; r <= 10; r++)
    for (let c = 2; c <= 6; c++) g[r][c] = stripes && (c === 3 || c === 5) ? shade(shirt) : shirt;

  // Arms (rows 5-9, cols 0-1 and 7-8)
  for (let r = 5; r <= 9; r++) {
    g[r][0] = sleeve; g[r][1] = sleeve;
    g[r][7] = sleeve; g[r][8] = sleeve;
  }

  // Legs (rows 11-12, cols 2-6) + shoes on row 12
  for (let c = 2; c <= 6; c++) {
    g[11][c] = pants;
    g[12][c] = SHOE;
  }

  return g;
}

// Slightly darken a hex color for subtle stripes.
function shade(hex: string): string {
  if (hex[0] !== '#' || hex.length < 7) return hex;
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, ((n >> 16) & 255) - 28);
  const gg = Math.max(0, ((n >> 8) & 255) - 28);
  const b = Math.max(0, (n & 255) - 28);
  return `#${((r << 16) | (gg << 8) | b).toString(16).padStart(6, '0')}`;
}

export default function PixelCharacter({ seed, cell = 7 }: { seed: string; cell?: number }) {
  const grid = useMemo(() => buildGrid(seed), [seed]);
  return (
    <View style={{ width: COLS * cell, height: ROWS * cell }}>
      {grid.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row' }}>
          {row.map((color, c) => (
            <View key={c} style={{ width: cell, height: cell, backgroundColor: color || 'transparent' }} />
          ))}
        </View>
      ))}
    </View>
  );
}
