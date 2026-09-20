// ===================================================================
// VIGHNAHARTA — SACRED COLLECTIBLES & OFFERINGS
// Golden Stars, Sacred Modaks (Region 1 Task), and Glowing Brass Diyas (Region 2 Task).
// ===================================================================

import * as THREE from 'three';

export class CollectibleFactory {
  constructor(shaderMaterials) {
    this.materials = shaderMaterials.materials;
  }

  // 1. Divine Golden Star
  createStar(x = 0, y = 1.0, z = 0) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.itemType = 'STAR';
    group.isCollected = false;
    group.baseY = y;

    const starGeo1 = new THREE.OctahedronGeometry(0.42, 0);
    const starGeo2 = new THREE.OctahedronGeometry(0.42, 0);
    starGeo2.rotateY(Math.PI / 4);
    starGeo2.rotateX(Math.PI / 4);

    const starMesh1 = new THREE.Mesh(starGeo1, this.materials.divineStar);
    const starMesh2 = new THREE.Mesh(starGeo2, this.materials.divineStar);
    group.add(starMesh1);
    group.add(starMesh2);

    const ringGeo = new THREE.TorusGeometry(0.55, 0.03, 8, 20);
    const ringMesh = new THREE.Mesh(ringGeo, this.materials.divineGold);
    group.add(ringMesh);

    group.starMesh1 = starMesh1;
    group.starMesh2 = starMesh2;
    group.ringMesh = ringMesh;

    return group;
  }

  // 2. Sacred Modak Offering (Region 1 Task)
  createModak(x = 0, y = 1.1, z = 0) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.itemType = 'MODAK';
    group.isCollected = false;
    group.baseY = y;

    // Modak Base & Pleated Cone
    const modakMat = new THREE.MeshStandardMaterial({
      color: 0xffeaa7, // Golden rice-flour dough
      roughness: 0.35,
      metalness: 0.15,
      emissive: 0xffbe76,
      emissiveIntensity: 0.4
    });

    const bodyGeo = new THREE.ConeGeometry(0.38, 0.65, 12);
    const body = new THREE.Mesh(bodyGeo, modakMat);
    body.position.y = 0.1;
    group.add(body);

    const baseGeo = new THREE.SphereGeometry(0.36, 12, 10);
    baseGeo.scale(1.0, 0.6, 1.0);
    const base = new THREE.Mesh(baseGeo, modakMat);
    base.position.y = -0.12;
    group.add(base);

    // Saffron/Kesar Strand on Top
    const kesarMat = new THREE.MeshBasicMaterial({ color: 0xe67e22 });
    const kesar = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 6), kesarMat);
    kesar.position.y = 0.48;
    group.add(kesar);

    // Golden Halo Ring
    const haloGeo = new THREE.TorusGeometry(0.52, 0.025, 8, 16);
    haloGeo.rotateX(Math.PI / 2);
    const halo = new THREE.Mesh(haloGeo, this.materials.divineGold);
    halo.position.y = 0;
    group.add(halo);

    group.ringMesh = halo;
    return group;
  }

  // 3. Sacred Brass Diya (Region 2 Task)
  createDiya(x = 0, y = 0.9, z = 0) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.itemType = 'DIYA';
    group.isCollected = false;
    group.baseY = y;

    // Brass Diya Bowl
    const bowlGeo = new THREE.CylinderGeometry(0.38, 0.18, 0.22, 12);
    const bowl = new THREE.Mesh(bowlGeo, this.materials.templeBrass);
    bowl.position.y = 0;
    group.add(bowl);

    // Oil reservoir
    const oilMat = new THREE.MeshStandardMaterial({ color: 0x8b6508, roughness: 0.2, metalness: 0.8 });
    const oil = new THREE.Mesh(new THREE.CircleGeometry(0.34, 12), oilMat);
    oil.rotation.x = -Math.PI / 2;
    oil.position.y = 0.11;
    group.add(oil);

    // Glowing Sacred Flame
    const flameGeo = new THREE.ConeGeometry(0.12, 0.38, 8);
    const flame = new THREE.Mesh(flameGeo, this.materials.diyaFlame);
    flame.position.set(0, 0.32, 0.12);
    group.add(flame);

    // Diya Light
    const diyaLight = new THREE.PointLight(0xffa502, 1.4, 4.0);
    diyaLight.position.set(0, 0.35, 0.12);
    group.add(diyaLight);

    return group;
  }
}
