import React from 'react';

import LevelSelect from '../screens/LevelSelect';

// Home route ("/") — the entry point of the game. Renders the LevelSelect
// screen, from which the player navigates into the level flow
// (profile -> stocks -> allocate -> result).
export default function HomeScreen() {
  return <LevelSelect />;
}
