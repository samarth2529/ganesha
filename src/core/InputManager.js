// ===================================================================
// VIGHNAHARTA INPUT MANAGER
// Handles Keyboard, Mouse swipe, and Touch swipe gestures with zero latency.
// ===================================================================

export class InputManager {
  constructor(game) {
    this.game = game;
    this.listeners = [];
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;
    this.isDragging = false;
    this.minSwipeDistance = 12; // Lower threshold = high sensitivity instantaneous swipe
    this.maxSwipeTime = 700; // ms

    this.setupKeyboard();
    this.setupTouchAndPointer();
  }

  setupKeyboard() {
    const onKeyDown = (e) => {
      // Prevent browser default scrolling for game controls
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        this.game.handleInput('LEFT');
      } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        this.game.handleInput('RIGHT');
      } else if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') {
        this.game.handleInput('JUMP');
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        this.game.handleInput('SLIDE');
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        this.game.togglePause();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    this.listeners.push({ target: window, type: 'keydown', handler: onKeyDown });
  }

  setupTouchAndPointer() {
    const onPointerDown = (e) => {
      if (this.game.state !== 'PLAYING') return;
      this.touchStartX = e.clientX;
      this.touchStartY = e.clientY;
      this.touchStartTime = performance.now();
      this.isDragging = true;
    };

    const onPointerMove = (e) => {
      if (!this.isDragging || this.game.state !== 'PLAYING') return;

      const deltaX = e.clientX - this.touchStartX;
      const deltaY = e.clientY - this.touchStartY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Instant high-sensitivity gesture trigger while dragging
      if (Math.max(absX, absY) > this.minSwipeDistance) {
        if (absX > absY) {
          if (deltaX > 0) {
            this.game.handleInput('RIGHT');
          } else {
            this.game.handleInput('LEFT');
          }
        } else {
          if (deltaY < 0) {
            this.game.handleInput('JUMP');
          } else {
            this.game.handleInput('SLIDE');
          }
        }
        // Reset anchor after triggering to allow quick sequential swipes
        this.touchStartX = e.clientX;
        this.touchStartY = e.clientY;
        this.touchStartTime = performance.now();
      }
    };

    const onPointerUp = (e) => {
      this.isDragging = false;
    };

    const onPointerCancel = () => {
      this.isDragging = false;
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);

    this.listeners.push({ target: window, type: 'pointerdown', handler: onPointerDown });
    this.listeners.push({ target: window, type: 'pointermove', handler: onPointerMove });
    this.listeners.push({ target: window, type: 'pointerup', handler: onPointerUp });
    this.listeners.push({ target: window, type: 'pointercancel', handler: onPointerCancel });
  }

  dispose() {
    this.listeners.forEach(({ target, type, handler }) => {
      target.removeEventListener(type, handler);
    });
    this.listeners = [];
  }
}
