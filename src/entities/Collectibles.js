// ===================================================================
// VIGHNAHARTA — DIVINE GOLDEN STARS (COLLECTIBLES)
// Floating, rotating golden sacred stars with particle halo and collection physics.
// ===================================================================

import * as THREE from 'three';

export class CollectibleFactory {
  constructor(shaderMaterials) {
    this.materials = shaderMaterials.materials;
  }

  createStar(x = 0, y = 1.0, z = 0) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.isCollected = false;
    group.baseY = y;

    // 1. Eight-Pointed Golden Star (Double Crossed Octahedron / Star Polyhedron)
    const starGeo1 = new THREE.OctahedronGeometry(0.42, 0);
    const starGeo2 = new THREE.OctahedronGeometry(0.42, 0);
    starGeo2.rotateY(Math.PI / 4);
    starGeo2.rotateX(Math.PI / 4);

    const starMesh1 = new THREE.Mesh(starGeo1, this.materials.divineStar);
    const starMesh2 = new THREE.Mesh(starGeo2, this.materials.divineStar);

    group.add(starMesh1);
    group.add(starMesh2);

    // 2. Glowing Golden Ring Halo around star
    const ringGeo = new THREE.TorusGeometry(0.55, 0.03, 8, 20);
    const ringMesh = new THREE.Mesh(ringGeo, this.materials.divineGold);
    group.add(ringMesh);

    // Store references for animation
    group.starMesh1 = starMesh1;
    group.starMesh2 = starMesh2;
    group.ringMesh = ringMesh;

    group.bounds = { radius: 0.75 };
    return group;
  }
}
