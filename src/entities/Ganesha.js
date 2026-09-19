// ===================================================================
// VIGHNAHARTA — 3D BHAGWAN GANESHA (OPTIMIZED RUNTIME GLB)
// Lazy loaded, zero redundant draw calls, clean PBR presentation.
// ===================================================================

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export class Ganesha {
  constructor(shaderMaterials) {
    this.materials = shaderMaterials.materials;
    this.textures = shaderMaterials.textures;
    this.mesh = new THREE.Group();
    this.mesh.name = "GaneshaGLB";
    this.isLoaded = false;
    this.isLoading = false;
    
    // Dedicated Pivot for Ganesha GLB model
    this.ganeshaPivot = new THREE.Group();
    this.mesh.add(this.ganeshaPivot);

    this.buildSacredAltar();
  }

  buildSacredAltar() {
    // 1. Solid Multi-Tiered Altar on Floor (y = 0)
    const altarGroup = new THREE.Group();

    // Tier 1: Ground Octagonal Base
    const base1Geo = new THREE.CylinderGeometry(9.0, 9.8, 1.0, 8);
    const base1 = new THREE.Mesh(base1Geo, this.materials.templeFloor);
    base1.position.y = 0.5;
    base1.receiveShadow = true;
    base1.matrixAutoUpdate = false;
    base1.updateMatrix();
    altarGroup.add(base1);

    // Tier 2: Carved Bronze Altar Step
    const base2Geo = new THREE.CylinderGeometry(7.6, 8.2, 1.2, 8);
    const base2Mat = new THREE.MeshStandardMaterial({
      color: 0x6e4726,
      roughness: 0.55,
      metalness: 0.75
    });
    const base2 = new THREE.Mesh(base2Geo, base2Mat);
    base2.position.y = 1.6;
    base2.receiveShadow = true;
    base2.matrixAutoUpdate = false;
    base2.updateMatrix();
    altarGroup.add(base2);

    // Gold Trim Ring
    const trimGeo = new THREE.TorusGeometry(7.8, 0.12, 6, 24);
    trimGeo.rotateX(Math.PI / 2);
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.25,
      metalness: 0.95
    });
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.y = 2.2;
    trim.matrixAutoUpdate = false;
    trim.updateMatrix();
    altarGroup.add(trim);

    // Tier 3: Lotus Petals (Padmasana) - 12 count
    const petalCount = 12;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petalGeo = new THREE.SphereGeometry(1.1, 6, 6);
      petalGeo.scale(0.55, 0.28, 1.3);
      const petal = new THREE.Mesh(petalGeo, base2Mat);
      petal.position.set(Math.cos(angle) * 6.2, 2.35, Math.sin(angle) * 6.2);
      petal.rotation.y = -angle + Math.PI / 2;
      petal.rotation.x = 0.32;
      petal.matrixAutoUpdate = false;
      petal.updateMatrix();
      altarGroup.add(petal);
    }

    altarGroup.matrixAutoUpdate = false;
    altarGroup.updateMatrix();
    this.mesh.add(altarGroup);

    // 2. Flanking Brass Kuthu Vilakku (Oil Lamps)
    for (let side = -1; side <= 1; side += 2) {
      const vilakku = this.createKuthuVilakku();
      vilakku.position.set(side * 8.5, 0, 4.5);
      vilakku.matrixAutoUpdate = false;
      vilakku.updateMatrix();
      this.mesh.add(vilakku);
    }
  }

  loadIfNeeded() {
    if (this.isLoaded || this.isLoading) return;
    this.isLoading = true;
    this.loadGaneshaGLB();
  }

  loadGaneshaGLB() {
    const loader = new GLTFLoader();

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    loader.setDRACOLoader(dracoLoader);

    const modelUrls = [
      '/assets/ganesha_.glb',
      '/assets/ganesha.glb',
      'assets/ganesha_.glb',
      'assets/ganesha.glb'
    ];

    const tryLoad = (urlIndex) => {
      if (urlIndex >= modelUrls.length) {
        console.error('[Vighnaharta] Failed to load ganesha_.glb from all candidate paths.');
        this.isLoading = false;
        return;
      }

      const url = modelUrls[urlIndex];
      console.log(`[Vighnaharta] Loading new Ganesha GLB model from: ${url}`);

      loader.load(
        url,
        (gltf) => {
          console.log('[Vighnaharta] New Ganesha 3D Model loaded successfully!', gltf);
          this.isLoaded = true;
          this.isLoading = false;
          this.gltfScene = gltf.scene;

          // 1. Calculate bounding box & dimensions
          const box = new THREE.Box3().setFromObject(this.gltfScene);
          const size = new THREE.Vector3();
          box.getSize(size);
          const center = new THREE.Vector3();
          box.getCenter(center);

          // 2. Scale & Center (18m tall grand sanctum presence)
          const targetHeight = 18.0;
          const scale = size.y > 0 ? (targetHeight / size.y) : 10.0;

          this.gltfScene.position.set(-center.x, -box.min.y, -center.z);

          this.ganeshaPivot.scale.set(scale, scale, scale);
          this.ganeshaPivot.position.set(0, 0.2, 0);
          this.ganeshaPivot.rotation.y = Math.PI;

          // 3. Configure materials, textures, and shadows
          this.gltfScene.traverse((child) => {
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

          this.ganeshaPivot.add(this.gltfScene);
        },
        undefined,
        (error) => {
          console.warn(`[Vighnaharta] Error loading Ganesha from ${url}:`, error);
          tryLoad(urlIndex + 1);
        }
      );
    };

    tryLoad(0);
  }

  createKuthuVilakku() {
    const group = new THREE.Group();
    const brass = this.materials.templeBrass;
    const gold = this.materials.divineGold;

    // Solid base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.5, 10), brass);
    base.position.y = 0.25;
    group.add(base);

    // Stem
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 4.0, 8), brass);
    stem.position.y = 2.4;
    group.add(stem);

    // Oil Bowl
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.4, 0.25, 10), gold);
    bowl.position.y = 4.4;
    group.add(bowl);

    // 5 Diya Flames
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.28, 5), this.materials.diyaFlame);
      flame.position.set(Math.cos(angle) * 0.65, 4.6, Math.sin(angle) * 0.65);
      group.add(flame);
    }

    // Top Crest Finial
    const finial = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 6), gold);
    finial.position.y = 5.0;
    group.add(finial);

    return group;
  }

  update(delta) {
    // Zero CPU physics/particles overhead
  }
}
