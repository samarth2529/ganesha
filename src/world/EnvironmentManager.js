// ===================================================================
// VIGHNAHARTA — SACRED CELESTIAL ENVIRONMENT & BACKDROP
// Radiant Golden Sunset Sky, Layered Himalayan Ridges, Gopurams,
// and Soaring Bird Flock Silhouettes.
// ===================================================================

import * as THREE from 'three';

export class EnvironmentManager {
  constructor(scene, shaderMaterials) {
    this.scene = scene;
    this.materials = shaderMaterials.materials;
    this.textures = shaderMaterials.textures;
    this.group = new THREE.Group();
    this.group.name = "WorldEnvironment";
    this.animTime = 0;

    this.buildSkyDome();
    this.buildDistantMountains();
    this.buildDistantGopurams();
    this.buildSoaringBirds();

    this.scene.add(this.group);
  }

  buildSkyDome() {
    const skyGeo = new THREE.SphereGeometry(300, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
    
    const skyMat = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x240a42) },
        midColor: { value: new THREE.Color(0xd64c0e) },
        bottomColor: { value: new THREE.Color(0xff8c18) },
        horizonGlow: { value: new THREE.Color(0xffbf40) },
        offset: { value: 20 },
        exponent: { value: 0.55 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 midColor;
        uniform vec3 bottomColor;
        uniform vec3 horizonGlow;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          float factor = max(0.0, min(1.0, pow(max(h, 0.0), exponent)));
          vec3 sky = mix(bottomColor, mix(midColor, topColor, factor), factor);
          
          float horizonFade = clamp((1.0 - h * 2.5), 0.0, 1.0);
          sky = mix(sky, horizonGlow, horizonFade * 0.4);
          
          gl_FragColor = vec4(sky, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false
    });

    this.skyDome = new THREE.Mesh(skyGeo, skyMat);
    this.skyDome.position.y = -10;
    this.group.add(this.skyDome);

    // Radiant Golden Sun Disk
    const sunGeo = new THREE.CircleGeometry(32, 32);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xfff8d6,
      side: THREE.DoubleSide
    });
    this.sunDisk = new THREE.Mesh(sunGeo, sunMat);
    this.sunDisk.position.set(0, 58, 1400);
    this.group.add(this.sunDisk);

    // Divine Golden Halo Ring
    const haloGeo = new THREE.RingGeometry(32, 75, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xffa020,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.set(0, 58, 1398);
    this.group.add(halo);
  }

  buildDistantMountains() {
    const mountainMatNear = new THREE.MeshStandardMaterial({ color: 0x3d1a08, roughness: 0.95 });
    const mountainMatFar = new THREE.MeshStandardMaterial({ color: 0x240e06, roughness: 0.98 });
    const snowMat = this.materials.himalayanSnow || new THREE.MeshStandardMaterial({ color: 0xf5faff, roughness: 0.85 });
    const frostedMat = this.materials.frostedStone || mountainMatNear;

    // Layer 1: Mid Ridge (Grounded in valley floor at Y = -35m)
    const segments = 14;
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < segments; i++) {
        const z = (i / segments) * 1600 - 100;
        const isSnowBiome = (z >= 600 && z <= 1300);
        const height = (isSnowBiome ? 75 : 55) + Math.sin(i * 1.5) * 20 + Math.cos(i * 2.8) * 12;
        const width = 110 + Math.random() * 35;

        const peakGeo = new THREE.ConeGeometry(width / 2, height, 5);
        const peak = new THREE.Mesh(peakGeo, isSnowBiome ? frostedMat : mountainMatNear);
        peak.position.set(side * (95 + Math.random() * 30), height / 2 - 35, z);
        peak.rotation.y = Math.random() * Math.PI;
        peak.matrixAutoUpdate = false;
        peak.updateMatrix();
        this.group.add(peak);

        // Snow Cap on Himalayan Peaks
        if (isSnowBiome) {
          const capH = height * 0.45;
          const capW = (width / 2) * 0.48;
          const capGeo = new THREE.ConeGeometry(capW, capH, 5);
          const snowCap = new THREE.Mesh(capGeo, snowMat);
          snowCap.position.set(peak.position.x, height - 35 - capH / 2, z);
          snowCap.rotation.y = peak.rotation.y;
          snowCap.matrixAutoUpdate = false;
          snowCap.updateMatrix();
          this.group.add(snowCap);
        }
      }
    }

    // Layer 2: Massive Far Himalayan Horizon Peaks (Grounded)
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 9; i++) {
        const z = i * 200;
        const isSnowBiome = (z >= 550 && z <= 1350);
        const h = (isSnowBiome ? 120 : 95) + Math.sin(i * 2.2) * 35;
        const w = 180 + Math.random() * 50;
        const peak = new THREE.Mesh(new THREE.ConeGeometry(w / 2, h, 4), isSnowBiome ? frostedMat : mountainMatFar);
        peak.position.set(side * (170 + Math.random() * 35), h / 2 - 38, z);
        peak.matrixAutoUpdate = false;
        peak.updateMatrix();
        this.group.add(peak);

        // Snow Cap on Horizon Giants
        if (isSnowBiome) {
          const capH = h * 0.42;
          const capW = (w / 2) * 0.44;
          const capGeo = new THREE.ConeGeometry(capW, capH, 4);
          const snowCap = new THREE.Mesh(capGeo, snowMat);
          snowCap.position.set(peak.position.x, h - 38 - capH / 2, z);
          snowCap.rotation.y = peak.rotation.y;
          snowCap.matrixAutoUpdate = false;
          snowCap.updateMatrix();
          this.group.add(snowCap);
        }
      }
    }
  }

  updateSkyColors(topHex, midHex, bottomHex, glowHex) {
    if (this.skyDome && this.skyDome.material && this.skyDome.material.uniforms) {
      const u = this.skyDome.material.uniforms;
      u.topColor.value.lerp(new THREE.Color(topHex), 0.05);
      u.midColor.value.lerp(new THREE.Color(midHex), 0.05);
      u.bottomColor.value.lerp(new THREE.Color(bottomHex), 0.05);
      u.horizonGlow.value.lerp(new THREE.Color(glowHex), 0.05);
    }
  }

  buildDistantGopurams() {
    const gopuramMat = this.materials.gopuramTier || this.materials.sandstone;
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 7; i++) {
        const z = 80 + i * 180 + Math.random() * 30;
        if (z > 1300) continue;

        const gop = this.createDistantGopuram(gopuramMat);
        gop.position.set(side * (65 + Math.random() * 15), 0, z);
        gop.scale.set(1.2, 1.2, 1.2);
        gop.matrixAutoUpdate = false;
        gop.updateMatrix();
        this.group.add(gop);
      }
    }
  }

  createDistantGopuram(mat) {
    const group = new THREE.Group();
    const tiers = 5;
    let currentWidth = 14;
    let currentHeight = 0;

    for (let t = 0; t < tiers; t++) {
      const tierH = 4.2 - t * 0.4;
      const tierGeo = new THREE.BoxGeometry(currentWidth, tierH, currentWidth * 0.8);
      const tier = new THREE.Mesh(tierGeo, mat);
      tier.position.y = currentHeight + tierH / 2;
      group.add(tier);

      currentHeight += tierH;
      currentWidth *= 0.78;
    }

    const roofGeo = new THREE.CylinderGeometry(currentWidth * 0.45, currentWidth * 0.5, currentWidth * 1.1, 8);
    roofGeo.rotateZ(Math.PI / 2);
    const roof = new THREE.Mesh(roofGeo, mat);
    roof.position.set(0, currentHeight + currentWidth * 0.35, 0);
    group.add(roof);

    const kalashaGeo = new THREE.ConeGeometry(0.6, 2.8, 6);
    const kalasha = new THREE.Mesh(kalashaGeo, this.materials.divineGold);
    kalasha.position.set(0, currentHeight + currentWidth * 0.7 + 1.4, 0);
    group.add(kalasha);

    return group;
  }

  buildSoaringBirds() {
    this.birds = [];
    const birdCount = 14;
    const birdMat = new THREE.MeshBasicMaterial({ color: 0x1f0d04, side: THREE.DoubleSide });

    // V-shaped wing geometry
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(-0.7, 0.4);
    shape.lineTo(-0.5, 0.5);
    shape.lineTo(0, 0.15);
    shape.lineTo(0.5, 0.5);
    shape.lineTo(0.7, 0.4);
    shape.closePath();

    const birdGeo = new THREE.ShapeGeometry(shape);

    for (let i = 0; i < birdCount; i++) {
      const bird = new THREE.Mesh(birdGeo, birdMat);
      bird.position.set(
        (Math.random() - 0.5) * 140,
        -5 + Math.random() * 25, // Soaring below and around viaduct bridge
        Math.random() * 1200
      );
      bird.rotation.x = -Math.PI / 2;
      bird.userData = {
        baseX: bird.position.x,
        speedZ: 8.0 + Math.random() * 12.0,
        wingSpeed: 4.0 + Math.random() * 3.0,
        sway: Math.random() * Math.PI * 2
      };
      this.group.add(bird);
      this.birds.push(bird);
    }
  }

  update(playerZ, delta) {
    this.animTime += delta;

    if (this.skyDome) {
      this.skyDome.position.z = playerZ;
    }

    // Animate soaring birds gliding forward
    if (this.birds) {
      for (let i = 0; i < this.birds.length; i++) {
        const b = this.birds[i];
        b.position.z += b.userData.speedZ * delta;
        b.position.x = b.userData.baseX + Math.sin(this.animTime * 0.8 + b.userData.sway) * 12.0;
        b.rotation.z = Math.sin(this.animTime * b.userData.wingSpeed) * 0.2;

        // Wrap birds around player
        if (b.position.z > playerZ + 200) {
          b.position.z = playerZ - 80;
        }
      }
    }
  }
}
