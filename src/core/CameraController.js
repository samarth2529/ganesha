// ===================================================================
// VIGHNAHARTA — CINEMATIC CAMERA CONTROLLER WITH 360° ORBIT CONTROLS
// Responsive spring-damped runner camera + interactive 360° mouse controls.
// ===================================================================

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class CameraController {
  constructor(camera, canvas) {
    this.camera = camera;
    this.canvas = canvas;

    // Follow offset for runner
    this.baseOffset = new THREE.Vector3(0, 3.8, -7.2);
    this.currentPos = new THREE.Vector3(0, 3.8, -7.2);
    this.lookTarget = new THREE.Vector3(0, 1.4, 16.0);

    // Dynamic FOV tuning
    this.baseFOV = 55;
    this.maxFOV = 70;
    this.targetFOV = this.baseFOV;

    // Title / Menu Camera State
    this.isMenuMode = true;
    this.menuTime = 0;

    // 360° Interactive Orbit Mode
    this.is360Mode = false;
    this.isCinematicMode = false;
    this.isDroneFlyover = false;
    this.droneAngle = 0;
    this.currentViewMode = 'SANCTUM'; // 'SANCTUM' | 'TEMPLE_FULL' | 'DRONE_FLYOVER' | 'AERIAL_TOP'
    this.cinematicTime = 0;
    this.cinematicTargetPos = new THREE.Vector3(0, 0, 1500);
    this.initOrbitControls();
  }

  initOrbitControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.22; // Snappy, ultra-responsive feel (zero sluggish lag)
    this.controls.rotateSpeed = 2.4; // High sensitivity 360° mouse drag
    this.controls.zoomSpeed = 2.2; // High sensitivity zoom
    this.controls.panSpeed = 2.0; // High sensitivity pan
    this.controls.minDistance = 3.0;
    this.controls.maxDistance = 200.0; // Full range from intimate Sanctum close-up to majestic high aerial
    this.controls.maxPolarAngle = Math.PI / 2 - 0.01; // Don't dip below floor
    this.controls.enabled = false;
  }

  setMenuMode(active) {
    this.isMenuMode = active;
    this.is360Mode = false;
    this.isCinematicMode = false;
    this.isDroneFlyover = false;
    if (this.controls) this.controls.enabled = false;

    if (active) {
      this.camera.position.set(0, 2.4, -5.5);
      this.camera.lookAt(0, 1.4, 18.0);
    }
  }

  startCinematicReveal(templeCenterPos) {
    this.isMenuMode = false;
    this.is360Mode = false;
    this.isCinematicMode = true;
    this.isDroneFlyover = false;
    this.cinematicTime = 0;
    this.cinematicTargetPos.copy(templeCenterPos);
    if (this.controls) this.controls.enabled = false;
  }

  enable360Mode(targetPos) {
    this.isMenuMode = false;
    this.isCinematicMode = false;
    this.is360Mode = true;
    this.isDroneFlyover = false;
    this.switchViewMode('TEMPLE_FULL');
  }

  switchViewMode(mode) {
    this.currentViewMode = mode;
    const baseZ = this.cinematicTargetPos.z || 1500;

    if (mode === 'TEMPLE_FULL') {
      // Grand Exterior View: Shows full 3D Brihadeeswarar Temple architecture & Vimana
      this.isDroneFlyover = false;
      this.camera.position.set(0, 30.0, baseZ - 45.0);
      this.camera.fov = 52;
      this.camera.updateProjectionMatrix();

      if (this.controls) {
        this.controls.enabled = true;
        this.controls.minDistance = 8.0;
        this.controls.maxDistance = 180.0;
        this.controls.target.set(0, 22.0, baseZ + 36.0);
        this.controls.update();
      }
    } else if (mode === 'SANCTUM') {
      // Inner Garbhagudi Sanctum: Intimate close-up of Bhagwan Ganesha on Lotus Altar
      this.isDroneFlyover = false;
      this.camera.position.set(0, 7.2, baseZ + 24.0);
      this.camera.fov = 50;
      this.camera.updateProjectionMatrix();

      if (this.controls) {
        this.controls.enabled = true;
        this.controls.minDistance = 4.0;
        this.controls.maxDistance = 60.0;
        this.controls.target.set(0, 6.5, baseZ + 42.0);
        this.controls.update();
      }
    } else if (mode === 'AERIAL_TOP') {
      // High Bird's Eye View of entire Temple Complex & Courtyard
      this.isDroneFlyover = false;
      this.camera.position.set(0, 90.0, baseZ + 20.0);
      this.camera.fov = 58;
      this.camera.updateProjectionMatrix();

      if (this.controls) {
        this.controls.enabled = true;
        this.controls.minDistance = 20.0;
        this.controls.maxDistance = 220.0;
        this.controls.target.set(0, 5.0, baseZ + 36.0);
        this.controls.update();
      }
    } else if (mode === 'DRONE_FLYOVER') {
      // Automated 360° Continuous Cinematic Flyover Orbit
      this.isDroneFlyover = true;
      this.droneAngle = 0;
      if (this.controls) this.controls.enabled = false;
      this.camera.fov = 54;
      this.camera.updateProjectionMatrix();
    }
  }

  update(player, runnerSpeed, speedRatio, delta) {
    if (this.isDroneFlyover) {
      this.droneAngle += delta * 0.25;
      const baseZ = this.cinematicTargetPos.z || 1500;
      const radius = 75.0;
      const camX = Math.cos(this.droneAngle) * radius;
      const camZ = (baseZ + 36.0) + Math.sin(this.droneAngle) * radius;
      const camY = 32.0 + Math.sin(this.droneAngle * 2.0) * 4.0;

      this.camera.position.set(camX, camY, camZ);
      this.camera.lookAt(0, 20.0, baseZ + 36.0);
      return;
    }

    if (this.is360Mode) {
      // 360° Interactive mouse orbit update
      if (this.controls && this.controls.enabled) {
        this.controls.update();
      }
      return;
    }

    if (this.isCinematicMode) {
      this.cinematicTime += delta;
      const t = this.cinematicTime;
      const baseZ = this.cinematicTargetPos.z; // Temple position (~1500m)

      // Step 1: Approach & Temple Majesty (0.0s - 4.5s)
      if (t < 4.5) {
        const p = t / 4.5;
        const camX = Math.sin(p * Math.PI * 0.5) * 3.0;
        const camY = THREE.MathUtils.lerp(3.8, 9.5, p);
        const camZ = THREE.MathUtils.lerp(baseZ - 45.0, baseZ - 10.0, p);
        this.camera.position.set(camX, camY, camZ);
        this.camera.lookAt(0, 18.0 - p * 6.0, baseZ + 36.0);
      }
      // Step 2: Gliding Through Sacred Entrance & Colonnade (4.5s - 9.0s)
      else if (t < 9.0) {
        const p = (t - 4.5) / 4.5;
        const camX = Math.sin(p * Math.PI) * 1.5;
        const camY = THREE.MathUtils.lerp(9.5, 4.8, p);
        const camZ = THREE.MathUtils.lerp(baseZ - 10.0, baseZ + 20.0, p);
        this.camera.position.set(camX, camY, camZ);
        this.camera.lookAt(0, 5.0, baseZ + 42.0);
      }
      // Step 3: Divine Ganesha Ascending Reveal (9.0s - 14.0s)
      else if (t < 14.0) {
        const p = (t - 9.0) / 5.0;
        const camX = Math.cos(p * Math.PI * 0.8) * 4.5;
        const camY = THREE.MathUtils.lerp(3.8, 8.5, p);
        const camZ = THREE.MathUtils.lerp(baseZ + 20.0, baseZ + 30.0, p);
        this.camera.position.set(camX, camY, camZ);
        this.camera.lookAt(0, 5.0 + p * 2.5, baseZ + 42.0);
      }
      // Step 4: Grand Sanctum Wide Shot (14.0s - 18.0s)
      else if (t < 18.0) {
        const p = (t - 14.0) / 4.0;
        const camX = Math.sin(p * Math.PI * 0.4) * 8.0;
        const camY = THREE.MathUtils.lerp(8.5, 12.0, p);
        const camZ = THREE.MathUtils.lerp(baseZ + 30.0, baseZ + 18.0, p);
        this.camera.position.set(camX, camY, camZ);
        this.camera.lookAt(0, 6.5, baseZ + 42.0);
      }
      // Step 5: Seamlessly enable 360° interactive mode
      else {
        this.enable360Mode(new THREE.Vector3(0, 6.5, baseZ + 42.0));
      }
      return;
    }

    if (this.isMenuMode) {
      this.menuTime += delta * 0.5;
      this.camera.position.x = Math.sin(this.menuTime) * 1.2;
      this.camera.position.y = 2.4 + Math.cos(this.menuTime * 0.7) * 0.3;
      this.camera.position.z = -5.8;
      this.camera.lookAt(0, 1.4, 18.0);
      return;
    }

    // --- Standard Responsive Runner Camera ---

    // 1. Dynamic FOV based on speed
    this.targetFOV = THREE.MathUtils.lerp(this.baseFOV, this.maxFOV, Math.min(1.0, (speedRatio - 1.0) / 0.8));
    this.camera.fov += (this.targetFOV - this.camera.fov) * Math.min(1.0, delta * 4.0);
    this.camera.updateProjectionMatrix();

    // 2. Smooth Target Position Calculation
    const targetX = player.currentX * 0.35;
    const targetY = Math.max(3.2, 3.8 + (player.posY * 0.35));
    const targetZ = player.mesh.position.z + this.baseOffset.z;

    const lerpRate = 24.0;
    this.currentPos.x += (targetX - this.currentPos.x) * Math.min(1.0, delta * lerpRate);
    this.currentPos.y += (targetY - this.currentPos.y) * Math.min(1.0, delta * lerpRate);
    this.currentPos.z += (targetZ - this.currentPos.z) * Math.min(1.0, delta * lerpRate);

    this.camera.position.copy(this.currentPos);

    // 3. Dynamic LookAt Target
    const lookAheadX = player.currentX * 0.2;
    const lookAheadY = 1.3 + player.posY * 0.25;
    const lookAheadZ = player.mesh.position.z + 16.0;

    this.lookTarget.set(lookAheadX, lookAheadY, lookAheadZ);
    this.camera.lookAt(this.lookTarget);
  }

  reset() {
    this.is360Mode = false;
    this.isCinematicMode = false;
    this.cinematicTime = 0;
    if (this.controls) this.controls.enabled = false;
    this.currentPos.set(0, 3.8, -7.2);
    this.camera.position.set(0, 3.8, -7.2);
    this.camera.fov = this.baseFOV;
    this.camera.updateProjectionMatrix();
  }
}
