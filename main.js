import Phaser from 'phaser';
import { GameScene } from './gameScene.js';

// Responsive dimensions
const getGameDimensions = () => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // Base dimensions (original game design)
  const baseWidth = 900;
  const baseHeight = 700;

  // Calculate scaling
  const scaleX = windowWidth / baseWidth;
  const scaleY = windowHeight / baseHeight;
  const scale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond original size on large screens

  // Minimum size for playability
  const minWidth = 320;
  const minHeight = 480;

  let gameWidth = Math.max(baseWidth * scale, minWidth);
  let gameHeight = Math.max(baseHeight * scale, minHeight);

  // For very wide screens, maintain aspect ratio
  if (windowWidth / windowHeight > 1.5) {
    gameWidth = Math.min(windowWidth * 0.9, baseWidth);
    gameHeight = Math.min(windowHeight * 0.9, baseHeight);
  }

  return { width: Math.floor(gameWidth), height: Math.floor(gameHeight) };
};

const dimensions = getGameDimensions();

const config = {
  type: Phaser.AUTO,
  width: dimensions.width,
  height: dimensions.height,
  backgroundColor: '#222',
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
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
