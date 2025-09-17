import Phaser from 'phaser';
import { GameScene } from './gameScene.js';

// Responsive dimensions
const getGameDimensions = () => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // Optimized dimensions for better space usage
  const isMobile = windowWidth < 600;

  if (isMobile) {
    // Mobile: aggressive width calculation to eliminate right margins
    const gridSize = 10;
    const cellSize = Math.max(45, windowWidth * 0.08925); // Same as game logic (5% increase)
    const gridWidth = gridSize * cellSize;
    const powerUpWidth = 120;
    const gridMargin = 2; // Minimal grid margin (from game.js)
    const powerUpGap = 50; // Gap between grid and power-ups
    const rightMargin = 10; // Minimal right margin after power-ups

    // Calculate exact width needed: gridMargin + gridWidth + gap + powerUpWidth + rightMargin
    const exactWidth = gridMargin + gridWidth + powerUpGap + powerUpWidth + rightMargin;

    // Use the exact calculated width, but don't exceed screen width
    let gameWidth = Math.min(exactWidth, windowWidth * 0.99); // Use 99% of screen if needed
    let gameHeight = Math.min(windowHeight * 0.95, 700);

    return { width: Math.floor(gameWidth), height: Math.floor(gameHeight) };
  } else {
    // Desktop: use original logic but with smaller base width
    const baseWidth = 700; // Reduced from 900
    const baseHeight = 700;

    const scaleX = windowWidth / baseWidth;
    const scaleY = windowHeight / baseHeight;
    const scale = Math.min(scaleX, scaleY, 1);

    const minWidth = 320;
    const minHeight = 480;

    let gameWidth = Math.max(baseWidth * scale, minWidth);
    let gameHeight = Math.max(baseHeight * scale, minHeight);

    // For very wide screens, maintain aspect ratio
    if (windowWidth / windowHeight > 1.5) {
      gameWidth = Math.min(windowWidth * 0.8, baseWidth); // Reduced from 0.9
      gameHeight = Math.min(windowHeight * 0.9, baseHeight);
    }

    return { width: Math.floor(gameWidth), height: Math.floor(gameHeight) };
  }
};

const dimensions = getGameDimensions();
const isMobile = dimensions.width < 600;

const config = {
  type: Phaser.AUTO,
  width: dimensions.width,
  height: dimensions.height,
  backgroundColor: '#222',
  parent: 'game-container',
  scale: {
    mode: isMobile ? Phaser.Scale.RESIZE : Phaser.Scale.FIT, // RESIZE on mobile, FIT on desktop
    autoCenter: isMobile ? Phaser.Scale.NO_CENTER : Phaser.Scale.CENTER_BOTH, // No center on mobile, center on desktop
    width: dimensions.width,
    height: dimensions.height
  },
  scene: [GameScene]
};

// Store global dimensions for use in scenes
window.GAME_WIDTH = dimensions.width;
window.GAME_HEIGHT = dimensions.height;
window.IS_MOBILE = dimensions.width < 600;

new Phaser.Game(config);
