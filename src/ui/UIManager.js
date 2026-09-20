// ===================================================================
// VIGHNAHARTA — UI & HUD CONTROLLER
// Minimal cinematic interface management without clutter.
// ===================================================================

export class UIManager {
  constructor(game) {
    this.game = game;

    // Core Screens
    this.startScreen = document.getElementById('start-screen');
    this.gameHud = document.getElementById('game-hud');
    this.pauseScreen = document.getElementById('pause-screen');
    this.gameoverScreen = document.getElementById('gameover-screen');
    this.cinematicEndingScreen = document.getElementById('cinematic-ending-screen');
    this.temple360Hud = document.getElementById('temple-360-hud');

    // Minimal Running HUD Elements
    this.hudDistance = document.getElementById('hud-distance');
    this.hudStars = document.getElementById('hud-stars');
    this.hudStarPopups = document.getElementById('hud-star-popups');
    this.hudProtectionBadge = document.getElementById('hud-protection-badge');
    this.hudProtectionRing = document.getElementById('hud-protection-ring');
    this.hudTempleApproach = document.getElementById('hud-temple-approach');
    this.hudApproachFill = document.getElementById('hud-approach-fill');

    // Dynamic Notifications
    this.hudComboBadge = document.getElementById('hud-combo-badge');
    this.hudComboMultiplier = document.getElementById('hud-combo-multiplier');
    this.hudNearMissBadge = document.getElementById('hud-near-miss-badge');
    this.hudFormationBadge = document.getElementById('hud-formation-badge');
    this.hudVighnaWarning = document.getElementById('hud-vighna-warning');
    this.hudVighnaText = document.getElementById('hud-vighna-text');

    // Screen FX
    this.speedLinesContainer = document.getElementById('speed-lines-container');
    this.screenFlash = document.getElementById('screen-flash');

    // Stats
    this.statDist = document.getElementById('stat-dist');
    this.statStars = document.getElementById('stat-stars');
    this.endStatDist = document.getElementById('end-stat-dist');
    this.endStatStars = document.getElementById('end-stat-stars');
    this.endStatScore = document.getElementById('end-stat-score');

    // Buttons
    this.btnStart = document.getElementById('btn-start');
    this.btnSkipStart = document.getElementById('btn-skip-start');
    this.btnResume = document.getElementById('btn-resume');
    this.btnRestartPause = document.getElementById('btn-restart-pause');
    this.btnTryAgain = document.getElementById('btn-tryagain');
    this.btnReplayJourney = document.getElementById('btn-replay-journey');
    this.btnReplay360 = document.getElementById('btn-replay-360');
    this.btnPause = document.getElementById('btn-pause');

    // Main Menu HUD Elements
    this.btnMenuControls = document.getElementById('btn-menu-controls');
    this.menuControlsPopover = document.getElementById('menu-controls-popover');
    this.btnMenuAudio = document.getElementById('btn-menu-audio');
    this.menuAudioIcon = document.getElementById('menu-audio-icon');
    this.menuHero = document.querySelector('.menu-hero');
    this.menuBottomBar = document.querySelector('.menu-bottom-bar');

    // Camera Mode Buttons
    this.btnCamTemple = document.getElementById('btn-cam-temple');
    this.btnCamSanctum = document.getElementById('btn-cam-sanctum');
    this.btnCamDrone = document.getElementById('btn-cam-drone');
    this.btnCamAerial = document.getElementById('btn-cam-aerial');
    this.camPills = [this.btnCamTemple, this.btnCamSanctum, this.btnCamDrone, this.btnCamAerial];

    this.lastStars = 0;
    this.nearMissTimeout = null;
    this.formationTimeout = null;
    this.vighnaTimeout = null;
    this.tutorialTimeout = null;

    this.initEventListeners();
    this.showStartScreen();
  }

  initEventListeners() {
    if (this.btnStart) {
      this.btnStart.addEventListener('click', (e) => {
        e.stopPropagation();
        this.triggerStartTransition();
      });
    }

    if (this.btnSkipStart) {
      this.btnSkipStart.addEventListener('click', (e) => {
        e.stopPropagation();
        this.game.skipToTemple();
      });
    }

    // Menu Controls Popover
    if (this.btnMenuControls && this.menuControlsPopover) {
      this.btnMenuControls.addEventListener('click', (e) => {
        e.stopPropagation();
        this.menuControlsPopover.classList.toggle('active');
      });

      document.addEventListener('click', (e) => {
        if (this.menuControlsPopover && !this.menuControlsPopover.contains(e.target) && e.target !== this.btnMenuControls) {
          this.menuControlsPopover.classList.remove('active');
        }
      });
    }

    // Menu Audio Toggle
    if (this.btnMenuAudio) {
      this.btnMenuAudio.addEventListener('click', (e) => {
        e.stopPropagation();
        const isMuted = this.game.audio.toggleMute();
        const icon = isMuted ? '🔇' : '🔊';
        if (this.menuAudioIcon) this.menuAudioIcon.textContent = icon;
      });
    }

    if (this.btnPause) {
      this.btnPause.addEventListener('click', (e) => {
        e.stopPropagation();
        this.game.togglePause();
      });
    }

    if (this.btnResume) {
      this.btnResume.addEventListener('click', (e) => {
        e.stopPropagation();
        this.game.togglePause();
      });
    }

    if (this.btnRestartPause) {
      this.btnRestartPause.addEventListener('click', (e) => {
        e.stopPropagation();
        this.game.restartJourney();
      });
    }

    if (this.btnTryAgain) {
      this.btnTryAgain.addEventListener('click', (e) => {
        e.stopPropagation();
        this.game.restartJourney();
      });
    }

    if (this.btnReplayJourney) {
      this.btnReplayJourney.addEventListener('click', (e) => {
        e.stopPropagation();
        this.game.restartJourney();
      });
    }

    if (this.btnReplay360) {
      this.btnReplay360.addEventListener('click', (e) => {
        e.stopPropagation();
        this.game.restartJourney();
      });
    }

    // Camera Mode Selectors (Sanctum Mode)
    const setCamPillActive = (activeBtn) => {
      this.camPills.forEach(btn => {
        if (btn) btn.classList.remove('active');
      });
      if (activeBtn) activeBtn.classList.add('active');
    };

    if (this.btnCamTemple) {
      this.btnCamTemple.addEventListener('click', (e) => {
        e.stopPropagation();
        setCamPillActive(this.btnCamTemple);
        this.game.cameraController.switchViewMode('TEMPLE_FULL');
      });
    }

    if (this.btnCamSanctum) {
      this.btnCamSanctum.addEventListener('click', (e) => {
        e.stopPropagation();
        setCamPillActive(this.btnCamSanctum);
        this.game.cameraController.switchViewMode('SANCTUM');
      });
    }

    if (this.btnCamDrone) {
      this.btnCamDrone.addEventListener('click', (e) => {
        e.stopPropagation();
        setCamPillActive(this.btnCamDrone);
        this.game.cameraController.switchViewMode('DRONE_FLYOVER');
      });
    }

    if (this.btnCamAerial) {
      this.btnCamAerial.addEventListener('click', (e) => {
        e.stopPropagation();
        setCamPillActive(this.btnCamAerial);
        this.game.cameraController.switchViewMode('AERIAL_TOP');
      });
    }
  }

  triggerStartTransition() {
    if (this.menuHero) {
      this.menuHero.style.opacity = '0';
      this.menuHero.style.transform = 'translateY(-12px) scale(0.98)';
    }
    if (this.menuBottomBar) {
      this.menuBottomBar.style.opacity = '0';
      this.menuBottomBar.style.transform = 'translateY(10px)';
    }

    setTimeout(() => {
      this.game.startJourney();
      if (this.menuHero) {
        this.menuHero.style.opacity = '';
        this.menuHero.style.transform = '';
      }
      if (this.menuBottomBar) {
        this.menuBottomBar.style.opacity = '';
        this.menuBottomBar.style.transform = '';
      }
    }, 350);
  }

  hideAllScreens() {
    this.startScreen.classList.remove('active');
    this.gameHud.classList.remove('active');
    this.pauseScreen.classList.remove('active');
    this.gameoverScreen.classList.remove('active');
    if (this.temple360Hud) this.temple360Hud.classList.remove('active');
    this.cinematicEndingScreen.classList.remove('active');
  }

  showStartScreen() {
    this.hideAllScreens();
    this.startScreen.classList.add('active');
    if (this.menuControlsPopover) {
      this.menuControlsPopover.classList.remove('active');
    }
  }

  showHUD() {
    this.hideAllScreens();
    this.gameHud.classList.add('active');
    this.lastStars = 0;
  }

  show360HUD() {
    this.hideAllScreens();
    if (this.temple360Hud) {
      this.temple360Hud.classList.add('active');
    }
  }

  showPauseScreen(isPaused) {
    if (isPaused) {
      this.pauseScreen.classList.add('active');
    } else {
      this.pauseScreen.classList.remove('active');
    }
  }

  showGameOver(distance, stars) {
    this.hideAllScreens();
    this.statDist.textContent = `${Math.floor(distance).toLocaleString()}m`;
    this.statStars.textContent = stars;
    this.gameoverScreen.classList.add('active');
  }

  showCinematicEnding(distance, stars, score) {
    this.hideAllScreens();
    this.endStatDist.textContent = `${Math.floor(distance).toLocaleString()}m`;
    this.endStatStars.textContent = stars;
    this.endStatScore.textContent = score.toLocaleString();
    this.cinematicEndingScreen.classList.add('active');
  }

  updateHUD(distance, stars, stageName, speedRatio, combo, protectionActive = false, protectionPercent = 1.0) {
    // 1. Distance (Formatted with thousands separator, e.g. 1,248)
    if (this.hudDistance) {
      this.hudDistance.textContent = Math.floor(distance).toLocaleString();
    }

    // 2. Stars Counter
    if (this.hudStars) {
      if (stars !== this.lastStars) {
        this.hudStars.textContent = stars;
        this.hudStars.classList.add('bump');
        setTimeout(() => {
          if (this.hudStars) this.hudStars.classList.remove('bump');
        }, 150);
        this.lastStars = stars;
      }
    }

    // 3. Dynamic Combo
    if (this.hudComboBadge) {
      if (combo > 1) {
        this.hudComboBadge.classList.add('active');
        if (this.hudComboMultiplier) {
          this.hudComboMultiplier.textContent = `×${combo}`;
        }
      } else {
        this.hudComboBadge.classList.remove('active');
      }
    }

    // 4. Temple Approach Hairline Progression (Only visible in final stretch > 1200m)
    if (this.hudTempleApproach) {
      if (distance >= 1200 && distance < 1500) {
        this.hudTempleApproach.classList.add('active');
        const approachProg = Math.min(100, Math.max(0, ((distance - 1200) / 300) * 100));
        if (this.hudApproachFill) {
          this.hudApproachFill.style.width = `${approachProg}%`;
        }
      } else {
        this.hudTempleApproach.classList.remove('active');
      }
    }

    // 5. Divine Protection Shield Badge
    if (this.hudProtectionBadge) {
      if (protectionActive) {
        this.hudProtectionBadge.classList.add('active');
        if (this.hudProtectionRing) {
          // Circle circumference is 2 * PI * 15.5 = ~97.4
          const dashOffset = 97.4 * (1 - Math.max(0, Math.min(1, protectionPercent)));
          this.hudProtectionRing.style.strokeDashoffset = dashOffset;
        }
      } else {
        this.hudProtectionBadge.classList.remove('active');
      }
    }

    // 6. High Speed Atmosphere Lines
    if (this.speedLinesContainer) {
      if (speedRatio > 1.35) {
        this.speedLinesContainer.classList.add('active');
      } else {
        this.speedLinesContainer.classList.remove('active');
      }
    }
  }

  // Floating Collectible Pickup Feedback (+1 rising)
  triggerStarPickup(amount = 1) {
    if (!this.hudStarPopups) return;
    const popup = document.createElement('div');
    popup.className = 'star-popup-item';
    popup.textContent = `+${amount}`;
    this.hudStarPopups.appendChild(popup);
    setTimeout(() => {
      if (popup.parentElement) popup.parentElement.removeChild(popup);
    }, 500);
  }

  // Near-Miss Dodging Feedback
  triggerNearMiss() {
    if (!this.hudNearMissBadge) return;
    this.hudNearMissBadge.classList.add('active');
    if (this.nearMissTimeout) clearTimeout(this.nearMissTimeout);
    this.nearMissTimeout = setTimeout(() => {
      if (this.hudNearMissBadge) this.hudNearMissBadge.classList.remove('active');
    }, 750);
  }

  // Divine Star Formation Clear
  triggerFormation(text = 'DIVINE FORMATION') {
    if (!this.hudFormationBadge) return;
    const label = this.hudFormationBadge.querySelector('.formation-text');
    if (label) label.textContent = text;
    this.hudFormationBadge.classList.add('active');
    if (this.formationTimeout) clearTimeout(this.formationTimeout);
    this.formationTimeout = setTimeout(() => {
      if (this.hudFormationBadge) this.hudFormationBadge.classList.remove('active');
    }, 1200);
  }

  // Cinematic Vighna / Sacred Trial Warning
  triggerVighnaWarning(text = 'SACRED TRIAL AHEAD') {
    if (!this.hudVighnaWarning) return;
    if (this.hudVighnaText) this.hudVighnaText.textContent = text;
    this.hudVighnaWarning.classList.add('active');
    if (this.vighnaTimeout) clearTimeout(this.vighnaTimeout);
    this.vighnaTimeout = setTimeout(() => {
      if (this.hudVighnaWarning) this.hudVighnaWarning.classList.remove('active');
    }, 1200);
  }

  updateObjective(text, isComplete = false) {
    // Objective pill removed per user request
  }

  triggerFlash(type) {
    if (!this.screenFlash) return;
    this.screenFlash.className = '';
    if (type === 'hit') {
      this.screenFlash.classList.add('flash-red');
    } else if (type === 'gold') {
      this.screenFlash.classList.add('flash-gold');
    }
    setTimeout(() => {
      if (this.screenFlash) this.screenFlash.className = '';
    }, 180);
  }
}
