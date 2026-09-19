// ===================================================================
// VIGHNAHARTA — HIGH-PERFORMANCE VFX SYSTEM
// Floating marigold petals (single Points draw call), footstep dust,
// and golden sparkle bursts. Ultra-optimized for steady 60 FPS.
// ===================================================================

import * as THREE from 'three';

export class VFXManager {
  constructor(scene, shaderMaterials) {
    this.scene = scene;
    this.materials = shaderMaterials.materials;
    this.textures = shaderMaterials.textures;
    this.animTime = 0;
    this.snowIntensity = 0;

    this.bursts = [];
    this.initDustSwirls();
    this.initSnowfall();
  }

  // High-Performance Himalayan Snowfall System (Single Points Draw Call, 140 Flakes)
  // Strictly rendered ONLY when snowIntensity > 0 (750m - 1200m)
  initSnowfall() {
    const count = 140;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const sways = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 36;
      positions[i * 3 + 1] = 1.0 + Math.random() * 12.0;
      positions[i * 3 + 2] = Math.random() * 85;
      speeds[i] = 1.8 + Math.random() * 2.2;
      sways[i] = Math.random() * Math.PI * 2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.snowSpeeds = speeds;
    this.snowSways = sways;

    const snowMat = new THREE.PointsMaterial({
      size: 0.35,
      map: this.textures.particleDot,
      color: 0xf0f8ff,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.snowParticles = new THREE.Points(geometry, snowMat);
    this.snowParticles.frustumCulled = false;
    this.snowParticles.visible = false;
    this.scene.add(this.snowParticles);
  }

  setSnowIntensity(factor) {
    this.snowIntensity = THREE.MathUtils.clamp(factor, 0.0, 1.0);
    if (this.snowParticles) {
      if (this.snowIntensity <= 0.001) {
        this.snowParticles.visible = false;
        this.snowParticles.material.opacity = 0.0;
      } else {
        this.snowParticles.visible = true;
        this.snowParticles.material.opacity = this.snowIntensity * 0.85;
      }
    }
  }

  reset() {
    this.setSnowIntensity(0.0);
    this.dustParticles.forEach(p => { p.visible = false; });
  }

  // Footstep Dust Pool (10 meshes)
  initDustSwirls() {
    this.dustParticles = [];
    const maxParticles = 10;
    const geo = new THREE.SphereGeometry(0.12, 4, 4);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xd4a373,
      transparent: true,
      opacity: 0.45
    });

    for (let i = 0; i < maxParticles; i++) {
      const p = new THREE.Mesh(geo, mat.clone());
      p.visible = false;
      p.life = 0;
      p.maxLife = 0.35;
      this.scene.add(p);
      this.dustParticles.push(p);
    }
  }

  spawnFootstepDust(pos, isSlide = false) {
    const p = this.dustParticles.find(item => !item.visible);
    if (!p) return;

    p.visible = true;
    p.life = p.maxLife;
    p.position.copy(pos);
    p.position.y = 0.1;
    p.position.x += (Math.random() - 0.5) * 0.2;
    p.scale.set(isSlide ? 1.8 : 1.0, 1.0, isSlide ? 1.8 : 1.0);
    // Use cool white frost dust in snow
    if (this.snowIntensity > 0.5) {
      p.material.color.setHex(0xe8f4ff);
      p.material.opacity = isSlide ? 0.75 : 0.55;
    } else {
      p.material.color.setHex(0xd4a373);
      p.material.opacity = isSlide ? 0.6 : 0.45;
    }
  }

  // Golden Star Burst
  createStarBurst(pos) {
    const count = 8;
    const group = new THREE.Group();
    group.position.copy(pos);

    const particles = [];
    const geo = new THREE.SphereGeometry(0.08, 4, 4);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.95
    });

    for (let i = 0; i < count; i++) {
      const p = new THREE.Mesh(geo, mat);
      const angle = (i / count) * Math.PI * 2;
      const speed = 3.0 + Math.random() * 2.5;

      p.velocity = new THREE.Vector3(
        Math.cos(angle) * speed,
        2.0 + Math.random() * 2.0,
        Math.sin(angle) * speed
      );
      group.add(p);
      particles.push(p);
    }

    this.scene.add(group);
    this.bursts.push({
      group: group,
      particles: particles,
      life: 0.45,
      maxLife: 0.45
    });
  }

  update(delta, playerPos, runnerSpeed) {
    this.animTime += delta;

    // Update Himalayan Snowfall ONLY when snowIntensity > 0 and visible
    if (this.snowParticles && this.snowParticles.visible && playerPos && this.snowIntensity > 0.01) {
      const sAttr = this.snowParticles.geometry.attributes.position;
      const sCount = sAttr.count;

      for (let i = 0; i < sCount; i++) {
        let x = sAttr.getX(i);
        let y = sAttr.getY(i);
        let z = sAttr.getZ(i);

        x += Math.sin(this.animTime * 2.0 + this.snowSways[i]) * 0.04;
        y -= this.snowSpeeds[i] * delta * 1.2;

        if (y < 0.1 || z < playerPos.z - 10) {
          y = 8.0 + Math.random() * 6.0;
          x = playerPos.x + (Math.random() - 0.5) * 32;
          z = playerPos.z + 10 + Math.random() * 65;
        }

        sAttr.setXYZ(i, x, y, z);
      }
      sAttr.needsUpdate = true;
    }

    // Update Footstep Dust
    for (let i = 0; i < this.dustParticles.length; i++) {
      const p = this.dustParticles[i];
      if (p.visible) {
        p.life -= delta;
        if (p.life <= 0) {
          p.visible = false;
        } else {
          p.position.y += delta * 0.35;
        }
      }
    }

    // Update Sparkle Bursts
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i];
      b.life -= delta;
      if (b.life <= 0) {
        this.scene.remove(b.group);
        this.bursts.splice(i, 1);
      } else {
        const ratio = b.life / b.maxLife;
        for (let j = 0; j < b.particles.length; j++) {
          const p = b.particles[j];
          p.position.addScaledVector(p.velocity, delta);
          p.material.opacity = ratio;
        }
      }
    }
  }
}
