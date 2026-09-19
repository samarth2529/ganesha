// ===================================================================
// VIGHNAHARTA — 3D BRIHADEESWARAR TEMPLE GLB (OPTIMIZED RUNTIME)
// Lazy-loaded on approach, single light compatibility, zero particle lag.
// Preserves authentic GLB geometry, proportions, and PBR stone materials.
// ===================================================================

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { Ganesha } from './Ganesha.js';

export class Temple {
  constructor(shaderMaterials, baseZ = 1500) {
    this.materials = shaderMaterials.materials;
    this.textures = shaderMaterials.textures;
    this.baseZ = baseZ;

    this.group = new THREE.Group();
    this.group.name = "BrihadeeswararTempleHero";
    this.group.position.set(0, 0, this.baseZ);

    this.isLoaded = false;
    this.isLoading = false;

    // Dedicated Pivot for Temple GLB model
    this.templePivot = new THREE.Group();
    this.group.add(this.templePivot);

    // Build Courtyard Base
    this.buildCourtyardPlinth();
    this.buildFestivalDecorations();

    // Inner Sanctum (Ganesha)
    this.buildSanctumSanctorum();
  }

  buildCourtyardPlinth() {
    // Grand Granite Plinth Base
    const plinthW = 120;
    const plinthL = 160;
    const plinthH = 2.0;

    const plinthGeo = new THREE.BoxGeometry(plinthW, plinthH, plinthL);
    const plinth = new THREE.Mesh(plinthGeo, this.materials.adhisthanaBase || this.materials.sandstone);
    plinth.position.set(0, -plinthH / 2, plinthL / 2 - 20);
    plinth.receiveShadow = true;
    plinth.matrixAutoUpdate = false;
    plinth.updateMatrix();
    this.group.add(plinth);

    // Polished Temple Courtyard Floor Pavers
    const floorGeo = new THREE.PlaneGeometry(plinthW - 4, plinthL - 4);
    floorGeo.rotateX(-Math.PI / 2);
    const floor = new THREE.Mesh(floorGeo, this.materials.templeFloor);
    floor.position.set(0, 0.05, plinthL / 2 - 20);
    floor.receiveShadow = true;
    floor.matrixAutoUpdate = false;
    floor.updateMatrix();
    this.group.add(floor);

    // Grand Entrance Rangoli Medallion
    const rangoliGeo = new THREE.PlaneGeometry(16, 16);
    rangoliGeo.rotateX(-Math.PI / 2);
    const rangoli = new THREE.Mesh(rangoliGeo, this.materials.rangoli);
    rangoli.position.set(0, 0.08, 12.0);
    rangoli.receiveShadow = true;
    rangoli.matrixAutoUpdate = false;
    rangoli.updateMatrix();
    this.group.add(rangoli);
  }

  buildFestivalDecorations() {
    // Static Festival Flags flanking entrance
    const flagMat = this.materials.saffronCloth;
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 4; i++) {
        const flagZ = -15 + i * 14;
        const poleGeo = new THREE.CylinderGeometry(0.08, 0.1, 7.5, 6);
        const pole = new THREE.Mesh(poleGeo, this.materials.templeBrass);
        pole.position.set(side * 14.0, 3.75, flagZ);
        pole.matrixAutoUpdate = false;
        pole.updateMatrix();
        this.group.add(pole);

        const bannerGeo = new THREE.PlaneGeometry(2.4, 1.4);
        const banner = new THREE.Mesh(bannerGeo, flagMat);
        banner.position.set(side * 14.0 + (side * 1.2), 6.5, flagZ);
        banner.rotation.y = Math.PI / 2;
        banner.matrixAutoUpdate = false;
        banner.updateMatrix();
        this.group.add(banner);
      }
    }

    // Static Oil Lamps
    for (let side = -1; side <= 1; side += 2) {
      for (let k = 0; k < 4; k++) {
        const kZ = -10 + k * 18;
        const lamp = this.createKuthuVilakku();
        lamp.position.set(side * 10.5, 0, kZ);
        lamp.matrixAutoUpdate = false;
        lamp.updateMatrix();
        this.group.add(lamp);
      }
    }
  }

  createKuthuVilakku() {
    const group = new THREE.Group();
    const brass = this.materials.templeBrass;
    const gold = this.materials.divineGold;

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 0.4, 8), brass);
    base.position.y = 0.2;
    group.add(base);

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 3.2, 6), brass);
    stem.position.y = 1.8;
    group.add(stem);

    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.35, 0.2, 8), gold);
    bowl.position.y = 3.5;
    group.add(bowl);

    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.25, 5), this.materials.diyaFlame);
      flame.position.set(Math.cos(angle) * 0.55, 3.7, Math.sin(angle) * 0.55);
      group.add(flame);
    }

    return group;
  }

  buildSanctumSanctorum() {
    // Bhagwan Ganesha in Garbhagudi Sanctum
    this.ganesha = new Ganesha({ materials: this.materials, textures: this.textures });
    this.ganesha.mesh.position.set(0, 0, 42.0);
    this.group.add(this.ganesha.mesh);
  }

  loadIfNeeded() {
    if (this.isLoaded || this.isLoading) return;
    this.isLoading = true;
    if (this.ganesha) {
      this.ganesha.loadIfNeeded();
    }
    this.isLoaded = true;
    this.isLoading = false;
  }

  loadTempleGLB() {
    const loader = new GLTFLoader();

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    loader.setDRACOLoader(dracoLoader);

    const candidateUrls = [
      '/assets/brihadeeswarar_temple.glb',
      '/assets/models/temple.glb',
      '/assets/temple.glb',
      'assets/brihadeeswarar_temple.glb',
      'assets/models/temple.glb',
      'assets/temple.glb'
    ];

    const tryLoad = (idx) => {
      if (idx >= candidateUrls.length) {
        console.error('[Vighnaharta] Failed to load Temple GLB from all candidate URLs.');
        this.isLoading = false;
        return;
      }

      const url = candidateUrls[idx];
      console.log(`[Vighnaharta] Loading 3D Brihadeeswarar Temple GLB from: ${url}`);

      loader.load(
        url,
        (gltf) => {
          console.log('[Vighnaharta] 3D Brihadeeswarar Temple GLB loaded successfully!', gltf);
          this.isLoaded = true;
          this.isLoading = false;
          this.templeScene = gltf.scene;

          // 1. Compute bounding box and proportions
          const box = new THREE.Box3().setFromObject(this.templeScene);
          const size = new THREE.Vector3();
          box.getSize(size);
          const center = new THREE.Vector3();
          box.getCenter(center);

          // 2. Scale temple (~58m majestic height)
          const targetHeight = 58.0;
          const maxDim = Math.max(size.y, Math.max(size.x, size.z));
          const scale = maxDim > 0 ? (targetHeight / maxDim) : 1.0;

          this.templeScene.position.set(-center.x, -box.min.y, -center.z);
          this.templePivot.scale.set(scale, scale, scale);

          if (size.x > size.z) {
            this.templePivot.rotation.y = -Math.PI / 2;
          } else {
            this.templePivot.rotation.y = Math.PI;
          }

          this.templePivot.position.set(0, 0, 36.0);

          // 3. Optimization: Configure PBR materials, colorSpace, and shadows
          this.templeScene.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = false;
              child.receiveShadow = true;
              child.frustumCulled = true;
              child.matrixAutoUpdate = false;
              child.updateMatrix();

              if (child.material) {
                child.material.side = THREE.DoubleSide;
                if (child.material.map) {
                  child.material.map.colorSpace = THREE.SRGBColorSpace;
                }
              }
            }
          });

          this.templePivot.add(this.templeScene);
        },
        undefined,
        (err) => {
          console.warn(`[Vighnaharta] Could not load temple from ${url}:`, err);
          tryLoad(idx + 1);
        }
      );
    };

    tryLoad(0);
  }

  update(delta) {
    // Zero continuous animation overhead
  }
}
