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

    // Task Progression Card Elements
    this.hudTaskCard = document.getElementById('hud-task-card');
    this.hudTaskBadge = document.getElementById('hud-task-badge');
    this.hudTaskTypeIcon = document.getElementById('hud-task-type-icon');
    this.hudTaskTitle = document.getElementById('hud-task-title');
    this.hudTaskDesc = document.getElementById('hud-task-desc');
    this.hudTaskBarFill = document.getElementById('hud-task-bar-fill');
    this.hudTaskProgressVal = document.getElementById('hud-task-progress-val');

    // Vighnas Pips
    this.vighnaPips = [
      document.getElementById('vighna-pip-1'),
      document.getElementById('vighna-pip-2'),
      document.getElementById('vighna-pip-3')
    ];

    // Live Run Timer & Score
    this.hudTimerVal = document.getElementById('hud-timer-val');
    this.hudScoreVal = document.getElementById('hud-score-val');

    // Contextual [E] Interaction Prompt
    this.hudInteractPrompt = document.getElementById('hud-interact-prompt');
    this.hudInteractLabel = document.getElementById('hud-interact-label');

    // Dynamic Notifications
    this.hudTaskCompleteBanner = document.getElementById('hud-task-complete-banner');
    this.hudTaskCompleteTitle = document.getElementById('hud-task-complete-title');
    this.hudTaskCompleteReward = document.getElementById('hud-task-complete-reward');
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
    this.statTasks = document.getElementById('stat-tasks');
    this.statScore = document.getElementById('stat-score');

    this.endStatScore = document.getElementById('end-stat-score');
    this.endStatTime = document.getElementById('end-stat-time');
    this.endStatStars = document.getElementById('end-stat-stars');
    this.endStatVighnas = document.getElementById('end-stat-vighnas');
    this.endStatTasks = document.getElementById('end-stat-tasks');

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
    this.taskCompleteTimeout = null;

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

    if (this.hudInteractPrompt) {
      this.hudInteractPrompt.addEventListener('click', (e) => {
        e.stopPropagation();
        this.game.handleInput('INTERACT');
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
    this.showInteractPrompt(false);
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

  showGameOver(distance, stars, tasksCompleted = 0, score = 0) {
    this.hideAllScreens();
    if (this.statDist) this.statDist.textContent = `${Math.floor(distance).toLocaleString()}m`;
    if (this.statStars) this.statStars.textContent = stars;
    if (this.statTasks) this.statTasks.textContent = `${tasksCompleted}/10`;
    if (this.statScore) this.statScore.textContent = score.toLocaleString();
    this.gameoverScreen.classList.add('active');
  }

  showCinematicEnding(results) {
    this.hideAllScreens();
    const finalScore = results.score || 0;
    const finalTime = results.timeFormatted || '00:00';
    const finalStars = results.stars || 0;
    const finalVighnas = results.vighnasCleared || 3;
    const finalTasks = results.tasksCompleted || 10;

    if (this.endStatScore) this.endStatScore.textContent = finalScore.toLocaleString();
    if (this.endStatTime) this.endStatTime.textContent = finalTime;
    if (this.endStatStars) this.endStatStars.textContent = finalStars;
    if (this.endStatVighnas) this.endStatVighnas.textContent = `${finalVighnas}/3`;
    if (this.endStatTasks) this.endStatTasks.textContent = `${finalTasks}/10`;

    this.cinematicEndingScreen.classList.add('active');
  }

  updateTaskHUD(task, progress, vighnasCleared, score, formattedTime) {
    // 1. Task Card Details
    if (task) {
      if (this.hudTaskBadge) this.hudTaskBadge.textContent = `TASK ${task.num}/10`;
      if (this.hudTaskTypeIcon) this.hudTaskTypeIcon.textContent = task.icon || '🏛️';
      if (this.hudTaskTitle) this.hudTaskTitle.textContent = task.title;
      if (this.hudTaskDesc) this.hudTaskDesc.textContent = task.shortDesc;
      if (this.hudTaskBarFill) this.hudTaskBarFill.style.width = `${Math.min(100, Math.max(0, progress.progressPercent || 0))}%`;
      if (this.hudTaskProgressVal) this.hudTaskProgressVal.textContent = progress.text || '';
    } else {
      if (this.hudTaskBadge) this.hudTaskBadge.textContent = `COMPLETE`;
      if (this.hudTaskTitle) this.hudTaskTitle.textContent = 'ALL TASKS COMPLETED';
      if (this.hudTaskDesc) this.hudTaskDesc.textContent = 'Lord Ganesha is pleased with your pilgrimage!';
      if (this.hudTaskBarFill) this.hudTaskBarFill.style.width = '100%';
      if (this.hudTaskProgressVal) this.hudTaskProgressVal.textContent = '10/10';
    }

    // 2. Vighnas Pips (1 to 3)
    for (let i = 0; i < 3; i++) {
      if (this.vighnaPips[i]) {
        if (i < vighnasCleared) {
          this.vighnaPips[i].classList.add('active');
        } else {
          this.vighnaPips[i].classList.remove('active');
        }
      }
    }

    // 3. Live Score & Run Timer
    if (this.hudScoreVal) {
      this.hudScoreVal.textContent = score.toLocaleString();
    }
    if (this.hudTimerVal) {
      this.hudTimerVal.textContent = formattedTime;
    }
  }

  showInteractPrompt(show, text = 'CLEAR VIGHNA') {
    if (!this.hudInteractPrompt) return;
    if (show) {
      if (this.hudInteractLabel) this.hudInteractLabel.textContent = text;
      this.hudInteractPrompt.classList.add('active');
    } else {
      this.hudInteractPrompt.classList.remove('active');
    }
  }

  triggerTaskComplete(task) {
    if (!this.hudTaskCompleteBanner) return;
    if (this.hudTaskCompleteTitle) this.hudTaskCompleteTitle.textContent = task.title;
    if (this.hudTaskCompleteReward) this.hudTaskCompleteReward.textContent = `+${task.scoreReward || 500} PTS`;

    this.hudTaskCompleteBanner.classList.add('active');
    if (this.taskCompleteTimeout) clearTimeout(this.taskCompleteTimeout);
    this.taskCompleteTimeout = setTimeout(() => {
      if (this.hudTaskCompleteBanner) this.hudTaskCompleteBanner.classList.remove('active');
    }, 2400);
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
    // Objective pill handled by updateTaskHUD
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
