// ===================================================================
// VIGHNAHARTA — ENTRY POINT
// ===================================================================

import { Game } from './core/Game.js';

window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  window.__VIGHNAHARTA_GAME__ = game;
});
