import Phaser from 'phaser';

const SHAPE_PATTERNS = [
  // Square
  [[1, 1], [1, 1]],
  // Line (4)
  [[1, 1, 1, 1]],
  // L-shape
  [[1, 0], [1, 0], [1, 1]],
  // T-shape
  [[1, 1, 1], [0, 1, 0]],
  // S-shape
  [[0, 1, 1], [1, 1, 0]],
  // Z-shape
  [[1, 1, 0], [0, 1, 1]],
  // Big Plus
  [[0, 1, 0], [1, 1, 1], [0, 1, 0]],
  // Big L
  [[1, 0, 0], [1, 0, 0], [1, 1, 1]],
  // Big square
  [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
  // Long line (5)
  [[1, 1, 1, 1, 1]],
  // Vertical line (4)
  [[1], [1], [1], [1]],
  // Vertical line (5)
  [[1], [1], [1], [1], [1]],
  // Big reverse L
  [[1, 1, 1], [0, 0, 1], [0, 0, 1]],
  // Small L
  [[1, 1], [1, 0]],
  // Small reverse L
  [[1, 1], [0, 1]],
  // Small line (3)
  [[1, 1, 1]],
  // Small vertical line (3)
  [[1], [1], [1]],
  // Small line (2)
  [[1, 1]],
  // Small vertical line (2)
  [[1], [1]],
  // Small line (1)
  [[1]],
  //T up shape (3)
  [[0, 1, 0], [1, 1, 1]],
  //T down shape (3)
  [[1, 1, 1], [0, 1, 0]]
];

const BLOCK_COLORS = [
  0xff6b6b, // coral
  0x48e6e6, // turquoise
  0x6b8cff, // blue
  0x7fffd4, // mint
  0xffd86b, // yellow
  0x9dff6b, // green
  0xff6bff, // magenta
  0x6bffb2, // teal
];

function getRandomShape() {
  const pattern = Phaser.Utils.Array.GetRandom(SHAPE_PATTERNS);
  const color = Phaser.Utils.Array.GetRandom(BLOCK_COLORS);
  return { pattern, color };
}

export class GameScene extends Phaser.Scene {
  // IMPORTANT: Always use addScore(points) for score increases so coins update instantly!
  constructor() {
    super('GameScene');
  }

  preload() {
    // Preload assets here (sprites, sounds, etc.)
  }

  create() {
    // Background
    this.cameras.main.setBackgroundColor('#222');

    // Responsive layout setup
    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;
    const isMobile = width < 600;
    const centerX = width / 2;

    // Title
    this.add.text(centerX, height * 0.06, 'TimberTiles', {
      fontFamily: 'Arial',
      fontSize: isMobile ? 32 : 48,
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Score panel - responsive positioning
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: isMobile ? 18 : 24,
      color: '#fff'
    });
    this.highScoreText = this.add.text(width - 20, 20, 'High Score: 0', {
      fontSize: isMobile ? 18 : 24,
      color: '#fff'
    }).setOrigin(1, 0);

    // Coin display (top right)
    import('./powerups.js').then(module => {
      this.coinText = this.add.text(width - 20, isMobile ? 45 : 60, 'Coins: ' + (module.getCoins ? module.getCoins() : 0), {
        fontSize: isMobile ? 18 : 24,
        color: '#ffd700',
        backgroundColor: '#222',
        padding: { left: 12, right: 12, top: 6, bottom: 6 }
      }).setOrigin(1, 0);
      this.children.bringToTop(this.coinText);
      this.updateCoinDisplay = () => {
        this.coinText.setText('Coins: ' + (module.getCoins ? module.getCoins() : 0));
      };
    });

    // Responsive grid container
    this.gridSize = 9;
    let baseCellSize;
    if (isMobile) {
      baseCellSize = Math.max(30, Math.min(45, (width - 40) / this.gridSize));
    } else {
      baseCellSize = Math.max(40, Math.min(55, (width - 100) / this.gridSize));
    }
    this.cellSize = Math.round(baseCellSize);

    const gridWidth = this.gridSize * this.cellSize;
    const gridTopMargin = isMobile ? height * 0.15 : height * 0.14;

    this.gridOrigin = {
      x: (width - gridWidth) / 2,
      y: gridTopMargin
    };
    this.gridGraphics = this.add.graphics();
    this.drawGrid();

    // Tray container
    this.trayOrigin = { x: 150, y: 600 };
    this.trayGraphics = this.add.graphics();
    this.drawTray();

    // Generate tray shapes
    this.trayShapes = [getRandomShape(), getRandomShape(), getRandomShape()];
    this.renderTrayShapes();

    // Enable drag-and-drop for tray blocks
    this.input.on('pointerdown', this.onPointerDown, this);
    this.input.on('pointermove', this.onPointerMove, this);
    this.input.on('pointerup', this.onPointerUp, this);
    this.dragData = null;
  }

  drawGrid() {
    this.gridGraphics.clear();
    this.gridGraphics.lineStyle(2, 0xffffff, 0.2);
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        this.gridGraphics.strokeRect(
          this.gridOrigin.x + c * this.cellSize,
          this.gridOrigin.y + r * this.cellSize,
          this.cellSize,
          this.cellSize
        );
      }
    }
  }

  // Score-to-coins conversion: award coins as score increases
  addScore(points) {
    this.score += points;
    if (this.scoreText) this.scoreText.setText('Score: ' + this.score);
    // Award 1 coin per 100 points
    import('./powerups.js').then(module => {
      const coinsBefore = module.getCoins ? module.getCoins() : 0;
      const coinsToAdd = Math.floor(this.score / 100) - coinsBefore;
      if (coinsToAdd > 0 && module.addCoins) {
        module.addCoins(coinsToAdd);
      }
      if (this.updateCoinDisplay) this.updateCoinDisplay();
    });
  }

  drawTray() {
    this.trayGraphics.clear();
    this.trayGraphics.lineStyle(2, 0xffffff, 0.2);
    for (let i = 0; i < 3; i++) {
      this.trayGraphics.strokeRect(
        this.trayOrigin.x + i * (this.cellSize * 4 + 24),
        this.trayOrigin.y,
        this.cellSize * 4,
        this.cellSize * 2
      );
    }
  }

  renderTrayShapes() {
    // Remove previous tray blocks
    if (this.trayBlocks) {
      this.trayBlocks.forEach(block => block.destroy());
    }
    this.trayBlocks = [];
    // Render each shape in the tray
    for (let i = 0; i < this.trayShapes.length; i++) {
      const { pattern, color } = this.trayShapes[i];
      const shapeWidth = pattern[0].length;
      const shapeHeight = pattern.length;
      const offsetX = this.trayOrigin.x + i * (this.cellSize * 4 + 24);
      const offsetY = this.trayOrigin.y + 12;
      // Draw each block in the shape
      for (let r = 0; r < shapeHeight; r++) {
        for (let c = 0; c < shapeWidth; c++) {
          if (pattern[r][c]) {
            const x = offsetX + c * this.cellSize;
            const y = offsetY + r * this.cellSize;
            // Draw block with 3D effect
            const block = this.add.graphics();
            block.fillStyle(color, 1);
            block.fillRect(x, y, this.cellSize - 6, this.cellSize - 6);
            // 3D shadow
            block.lineStyle(3, 0xffffff, 0.25);
            block.strokeRect(x, y, this.cellSize - 6, this.cellSize - 6);
            block.lineStyle(6, 0x222222, 0.15);
            block.strokeRect(x + 4, y + 4, this.cellSize - 14, this.cellSize - 14);
            this.trayBlocks.push(block);
          }
        }
      }
    }
  }

  onPointerDown(pointer) {
    // Check if pointer is over a tray block
    for (let i = 0; i < this.trayBlocks.length; i++) {
      const block = this.trayBlocks[i];
      if (block.getBounds().contains(pointer.x, pointer.y)) {
        this.dragData = {
          block,
          startX: block.x,
          startY: block.y,
          offsetX: pointer.x - block.x,
          offsetY: pointer.y - block.y,
        };
        block.setAlpha(0.7);
        break;
      }
    }
  }

  onPointerMove(pointer) {
    if (this.dragData) {
      const { block, offsetX, offsetY } = this.dragData;
      block.x = pointer.x - offsetX;
      block.y = pointer.y - offsetY;
    }
  }

  onPointerUp(pointer) {
    if (this.dragData) {
      const { block, startX, startY } = this.dragData;
      block.setAlpha(1);
      // TODO: Check if dropped over grid and handle placement
      block.x = startX;
      block.y = startY;
      this.dragData = null;
    }
  }

  update() {
    // Game loop logic
  }
}
