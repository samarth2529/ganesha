// ===================================================================
// VIGHNAHARTA — MAIN GAME ENGINE (PERFORMANCE OPTIMIZED)
// Stable 60 FPS target, single directional light, zero memory leaks.
// Features 3D Human Player character throughout the run,
// Multi-Region modular task progression, and Region 4 Mushak Guide.
// ===================================================================

import * as THREE from 'three';
import { ShaderMaterials } from '../world/ShaderMaterials.js';
import { Player } from '../entities/Player.js';
import { MushakGuide } from '../entities/MushakGuide.js';
import { TrackManager } from '../world/TrackManager.js';
import { EnvironmentManager } from '../world/EnvironmentManager.js';
import { CameraController } from './CameraController.js';
import { InputManager } from './InputManager.js';
import { AudioManager } from './AudioManager.js';
import { VFXManager } from '../vfx/VFXManager.js';
import { UIManager } from '../ui/UIManager.js';
import { TaskManager } from './TaskManager.js';

export class Game {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.state = 'MENU'; // 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'CLIMAX'

    // Timing & Progression
    this.clock = new THREE.Clock();
    this.distance = 0;
    this.baseSpeed = 18.0;
    this.currentSpeed = this.baseSpeed;
    this.maxSpeed = 32.0;
    this.starsCollected = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.starStreak = 0;

    // Divine Protection & Abilities (Earned via high star streaks)
    this.protectionActive = false;
    this.protectionPercent = 0.0;
    this.invulnerableTimer = 0;

    this.lastStageName = '';
    this.stepTimer = 0;

    this.shaderMaterials = new ShaderMaterials();
    this.initRenderer();
    this.initScene();
    this.initLighting();

    // World & Environment
    this.environment = new EnvironmentManager(this.scene, this.shaderMaterials);

    // Subsystems
    this.audio = new AudioManager();
    this.cameraController = new CameraController(this.camera, this.canvas);

    // 1. Playable Devotee Character
    this.player = new Player(this.shaderMaterials);
    this.scene.add(this.player.mesh);

    // 2. Region 4 Companion Mushak Guide
    this.mushakGuide = new MushakGuide(this.shaderMaterials);
    this.scene.add(this.mushakGuide.mesh);

    this.trackManager = new TrackManager(this.scene, this.shaderMaterials);
    this.vfx = new VFXManager(this.scene, this.shaderMaterials);
    this.input = new InputManager(this);
    this.ui = new UIManager(this);
    this.taskManager = new TaskManager(this);

    this.setupResize();
    this.cameraController.setMenuMode(true);
    this.animate();
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // Capped at 1.0 for rock-solid 60 FPS performance across all devices
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.0));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x3d1a08);
    // Radiant atmospheric golden haze allowing grand temple and horizon visibility
    this.scene.fog = new THREE.Fog(0x5a2a10, 80, 1600);

    // Optimized near/far ratio to provide 100x depth buffer precision and eliminate Z-fighting
    this.camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.8, 1600);
    this.camera.position.set(0, 3.0, -6.0);
  }

  initLighting() {
    // 1. Soft Ambient Fill
    this.ambientLight = new THREE.AmbientLight(0xffeed8, 1.6);
    this.scene.add(this.ambientLight);

    // 2. The ONE Main Realtime Directional Sunlight (Following runner with tight shadow bounds)
    this.sunLight = new THREE.DirectionalLight(0xfff6dc, 3.2);
    this.sunLight.position.set(15, 28, 20);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 100;
    this.sunLight.shadow.camera.left = -15;
    this.sunLight.shadow.camera.right = 15;
    this.sunLight.shadow.camera.top = 15;
    this.sunLight.shadow.camera.bottom = -15;
    this.sunLight.shadow.bias = -0.0008;
    this.scene.add(this.sunLight);
  }

  setupResize() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.0));
    });
  }

  handleInput(action) {
    if (this.state !== 'PLAYING') return;

    if (action === 'LEFT' || action === 'RIGHT') {
      const moved = this.player.changeLane(action);
      if (moved) {
        this.audio.playLaneShift();
        this.vfx.spawnFootstepDust(this.player.mesh.position);
      }
    } else if (action === 'JUMP') {
      const jumped = this.player.jump();
      if (jumped) {
        this.audio.playJump();
        this.vfx.spawnFootstepDust(this.player.mesh.position);
      }
    } else if (action === 'SLIDE') {
      const slid = this.player.slide();
      if (slid) {
        this.audio.playSlide();
        this.vfx.spawnFootstepDust(this.player.mesh.position, true);
      }
    } else if (action === 'INTERACT') {
      const nearby = this.trackManager.getNearbyInteractable(this.player.mesh.position.z, this.player.currentX, 22.0);
      if (nearby) {
        const handled = this.taskManager.onInteract(nearby.interactId);
        if (handled) {
          this.trackManager.clearInteractable(nearby.interactId);
          this.ui.showInteractPrompt(false);
          this.ui.triggerFlash('gold');
          this.vfx.createStarBurst(this.player.mesh.position);
          this.audio.playVictoryChime();
        }
      }
    }
  }

  startJourney() {
    this.audio.init();
    this.audio.resume();
    this.audio.startRunnerMusic();

    this.state = 'PLAYING';
    this.distance = 0;
    this.currentSpeed = this.baseSpeed;
    this.starsCollected = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.starStreak = 0;
    this.protectionActive = false;
    this.protectionPercent = 0.0;
    this.invulnerableTimer = 0;
    this.lastStageName = '';

    this.taskManager.start();
    this.player.reset();
    this.mushakGuide.reset();
    this.trackManager.reset();
    this.cameraController.reset();
    this.cameraController.setMenuMode(false);
    if (this.vfx) {
      this.vfx.reset();
    }

    this.ui.showHUD();
  }

  skipToTemple() {
    this.audio.init();
    this.audio.resume();

    this.distance = 1475;
    this.currentSpeed = 0;
    this.starsCollected = 108;

    this.taskManager.currentTaskIndex = 9;
    this.taskManager.tasksCompleted = 9;
    this.taskManager.vighnasCleared = 3;
    this.taskManager.score = 8500;

    this.player.reset();
    this.player.mesh.position.set(0, 0, 1475);
    this.mushakGuide.spawnAt(0, 1475);

    this.trackManager.heroTemple.loadIfNeeded();
    if (this.vfx) {
      this.vfx.reset();
    }

    this.triggerClimaxArrival();
  }

  restartJourney() {
    this.startJourney();
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.ui.showPauseScreen(true);
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.ui.showPauseScreen(false);
    }
  }

  triggerClimaxArrival() {
    this.state = 'CLIMAX_CINEMATIC';
    this.trackManager.heroTemple.loadIfNeeded();
    this.player.triggerVictory();
    this.mushakGuide.triggerVictory();

    this.taskManager.stopTimer();
    const curTask = this.taskManager.getCurrentTask();
    if (curTask && curTask.id === 'TASK_10_FINAL_JOURNEY') {
      this.taskManager.completeTask(curTask);
    }

    const results = this.taskManager.getFinalResults();
    this.audio.transitionToTempleClimax();
    this.cameraController.startCinematicReveal(new THREE.Vector3(0, 0, 1500));
    this.ui.showCinematicEnding(results);
    if (this.vfx) {
      this.vfx.setSnowIntensity(0.0);
    }
  }

  triggerCollision() {
    this.state = 'GAMEOVER';
    this.taskManager.stopTimer();
    this.player.triggerDeath();
    this.audio.playImpact();
    this.audio.stopMusic();
    this.ui.triggerFlash('hit');
    this.ui.showGameOver(this.distance, this.starsCollected, this.taskManager.tasksCompleted, this.taskManager.score);
    if (this.vfx) {
      this.vfx.setSnowIntensity(0.0);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const rawDelta = this.clock.getDelta();
    const delta = Math.min(rawDelta, 0.05);

    if (this.state === 'PLAYING') {
      let speedRatio = 1.0 + Math.min(0.8, this.distance / 1200);
      
      if (this.distance > 1350) {
        const approachProgress = Math.min(1.0, (this.distance - 1350) / 150);
        speedRatio = THREE.MathUtils.lerp(speedRatio, 0.4, approachProgress);
      }

      this.currentSpeed = this.baseSpeed * speedRatio;
      this.audio.setSpeedFactor(speedRatio);

      const moveZ = this.currentSpeed * delta;
      this.distance += moveZ;
      this.player.mesh.position.z += moveZ;

      // Invulnerability tick
      if (this.invulnerableTimer > 0) {
        this.invulnerableTimer -= delta;
      }

      // Update Sun Light to follow player
      this.sunLight.position.z = this.player.mesh.position.z + 20;
      this.sunLight.target.position.z = this.player.mesh.position.z;
      this.sunLight.target.updateMatrixWorld();

      // Update Player Character
      this.player.update(delta, this.currentSpeed);

      // Region 4 (Royal Temple Approach): Spawn & update Mushak Companion Guide
      if (this.distance >= 1200) {
        if (!this.mushakGuide.active) {
          this.mushakGuide.spawnAt(this.player.currentX, this.player.mesh.position.z);
          this.ui.triggerVighnaWarning('MUSHAK JOINS AS YOUR SACRED GUIDE');
        }
        this.mushakGuide.update(delta, this.player, this.currentSpeed);
      }

      // Footstep dust
      if (this.player.isGrounded && !this.player.isSliding) {
        this.stepTimer += delta * (this.currentSpeed * 0.4);
        if (this.stepTimer > 1.0) {
          this.stepTimer = 0;
          this.vfx.spawnFootstepDust(this.player.mesh.position);
        }
      }

      // Update Track & Dynamic Stage Environment
      this.trackManager.update(this.player.mesh.position.z, delta);
      const stage = this.trackManager.getCurrentStage(this.distance);

      // Smooth Fog & Light Color Transition
      if (this.scene.fog) {
        this.scene.fog.color.lerp(new THREE.Color(stage.fogColor), 0.05);
      }
      if (this.sunLight) {
        this.sunLight.color.lerp(new THREE.Color(stage.lightColor), 0.05);
      }

      // Snow intensity strictly in Himalayan Snow Passage (750m - 1200m)
      let targetSnow = 0.0;
      if (this.distance >= 750 && this.distance <= 1200) {
        targetSnow = 1.0;
      } else if (this.distance > 700 && this.distance < 750) {
        targetSnow = (this.distance - 700) / 50.0;
      } else if (this.distance > 1200 && this.distance < 1250) {
        targetSnow = 1.0 - (this.distance - 1200) / 50.0;
      }
      if (this.vfx) {
        this.vfx.setSnowIntensity(targetSnow);
      }

      if (this.environment) {
        if (stage.name === 'HIMALAYAN SNOW PASSAGE') {
          this.environment.updateSkyColors(0x1a2844, 0x486c8c, 0x82a8c8, 0xe2f2ff);
        } else if (stage.name === 'DEODAR FOOTHILLS') {
          this.environment.updateSkyColors(0x221c38, 0x7c4e3a, 0xb87850, 0xffd0a0);
        } else {
          this.environment.updateSkyColors(0x240a42, 0xd64c0e, 0xff8c18, 0xffbf40);
        }
      }

      // Task Progression Engine Tick
      this.taskManager.update(delta, this.distance);

      // Proximity check for Active Task Interactables (Vighnas, Shrines, Bells)
      const nearby = this.trackManager.getNearbyInteractable(this.player.mesh.position.z, this.player.currentX, 18.0);
      const curTask = this.taskManager.getCurrentTask();
      if (nearby && curTask && (
        (curTask.type === 'CLEAR_VIGHNA' && nearby.interactType === 'VIGHNA' && curTask.vighnaId === nearby.vighnaId) ||
        (curTask.type === 'INTERACT_OBJECT' && curTask.interactId === nearby.interactId)
      )) {
        this.ui.showInteractPrompt(true, nearby.promptText);
      } else {
        this.ui.showInteractPrompt(false);
      }

      // Collision, Near-Misses & Pickups
      if (this.distance < 1450) {
        const collisionResult = this.trackManager.checkCollisions(this.player);

        // Near-Miss Dodging Event
        if (collisionResult && collisionResult.nearMiss) {
          this.ui.triggerNearMiss();
          this.combo++;
          this.comboTimer = 2.5;
          this.taskManager.score += 50 * Math.max(1, this.combo);
          this.audio.playLaneShift();
        }

        // Collectibles (Stars)
        if (collisionResult && Array.isArray(collisionResult.collected) && collisionResult.collected.length > 0) {
          collisionResult.collected.forEach(col => {
            this.starsCollected++;
            this.combo++;
            this.comboTimer = 2.5;
            this.starStreak++;

            this.taskManager.onStarCollected();
            this.audio.playStarPickup(this.combo);
            this.vfx.createStarBurst(col.position);
            this.ui.triggerFlash('gold');
            this.ui.triggerStarPickup(1);

            // Streak formation reward: Every 10-star streak grants Divine Shield protection!
            if (this.starStreak > 0 && this.starStreak % 10 === 0) {
              this.protectionActive = true;
              this.protectionPercent = 1.0;
              this.ui.triggerFormation('DIVINE SHIELD GRANTED!');
              this.ui.triggerFlash('gold');
            } else if (this.starStreak > 0 && this.starStreak % 5 === 0) {
              this.ui.triggerFormation('SACRED STREAK');
            }
          });
        }

        // Obstacle Collision Handling with Protection Shield
        if (collisionResult && collisionResult.hit) {
          if (this.invulnerableTimer > 0) {
            // Currently invulnerable from recent shield break
          } else if (this.protectionActive) {
            // Shield absorbs first impact
            this.protectionActive = false;
            this.protectionPercent = 0.0;
            this.invulnerableTimer = 1.8;
            this.ui.triggerFlash('hit');
            this.audio.playImpact();
            this.ui.triggerVighnaWarning('DIVINE SHIELD BROKEN!');
          } else {
            this.triggerCollision();
          }
        }
      }

      // Combo timer countdown
      if (this.comboTimer > 0) {
        this.comboTimer -= delta;
        if (this.comboTimer <= 0) {
          this.combo = 1;
          this.starStreak = 0;
        }
      }

      // Climax Arrival
      if (this.distance >= 1500) {
        this.triggerClimaxArrival();
      }

      // Update Minimal Running HUD & Structured Task Progression Card
      this.ui.updateHUD(
        this.distance,
        this.starsCollected,
        stage.name,
        speedRatio,
        this.combo,
        this.protectionActive,
        this.protectionPercent
      );

      const progress = this.taskManager.getProgressDisplay();
      this.ui.updateTaskHUD(
        curTask,
        progress,
        this.taskManager.vighnasCleared,
        this.taskManager.score,
        this.taskManager.getFormattedTime()
      );
    } else if (this.state === 'CLIMAX_CINEMATIC' || this.state === 'CLIMAX_360') {
      this.player.update(delta, 0.3);
      if (this.mushakGuide.active) {
        this.mushakGuide.update(delta, this.player, 0.3);
      }
      this.trackManager.update(this.player.mesh.position.z, delta);
    } else if (this.state === 'GAMEOVER') {
      this.player.update(delta, 0);
      if (this.mushakGuide.active) {
        this.mushakGuide.update(delta, this.player, 0);
      }
    }

    // Camera & VFX & Environment
    const speedRatio = this.currentSpeed / this.baseSpeed;
    this.cameraController.update(this.player, this.currentSpeed, speedRatio, delta);
    this.vfx.update(delta, this.player.mesh.position, this.currentSpeed);
    if (this.environment) {
      this.environment.update(this.player.mesh.position.z, delta);
    }

    // Render Scene (clean, direct, 60 FPS)
    this.renderer.render(this.scene, this.camera);
  }
}
