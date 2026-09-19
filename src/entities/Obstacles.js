// ===================================================================
// VIGHNAHARTA — OBSTACLES SYSTEM
// Rich Indian festival obstacle models designed for responsive
// jump, slide, and lane-change runner gameplay.
// ===================================================================

import * as THREE from 'three';

export class ObstacleFactory {
  constructor(shaderMaterials) {
    this.materials = shaderMaterials.materials;
  }

  // Type 1: Festival Cart / Low Barrier (REQUIRES JUMP or LANE SWITCH)
  createLowCart() {
    const group = new THREE.Group();
    group.obstacleType = 'LOW';
    group.actionRequired = 'JUMP';

    // Wooden cart body
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.8 });
    const cartGeo = new THREE.BoxGeometry(2.4, 0.7, 1.4);
    const cart = new THREE.Mesh(cartGeo, woodMat);
    cart.position.y = 0.55;
    cart.castShadow = true;
    group.add(cart);

    // Two big wooden wheels
    const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.15, 14);
    wheelGeo.rotateZ(Math.PI / 2);
    for (let side = -1; side <= 1; side += 2) {
      const wheel = new THREE.Mesh(wheelGeo, woodMat);
      wheel.position.set(side * 1.3, 0.5, 0);
      wheel.castShadow = true;
      group.add(wheel);
    }

    // Brass Urns / Offerings stacked on cart
    for (let i = -1; i <= 1; i += 2) {
      const urn = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.18, 0.5, 10), this.materials.templeBrass);
      urn.position.set(i * 0.6, 1.15, 0);
      urn.castShadow = true;
      group.add(urn);
    }

    group.bounds = { width: 2.5, height: 1.0, depth: 1.5 };
    return group;
  }

  // Type 2: Festival Stall Canopy / Low Hanging Garland (REQUIRES SLIDE or LANE SWITCH)
  createHighStall() {
    const group = new THREE.Group();
    group.obstacleType = 'HIGH';
    group.actionRequired = 'SLIDE';

    // Two tall bamboo/wood posts on sides
    const postMat = new THREE.MeshStandardMaterial({ color: 0x5c3d2e, roughness: 0.9 });
    for (let side = -1; side <= 1; side += 2) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.2, 8), postMat);
      post.position.set(side * 1.25, 1.6, 0);
      post.castShadow = true;
      group.add(post);
    }

    // Overhead Saffron/Crimson Fabric Canopy (Passable underneath only by sliding)
    const canopyGeo = new THREE.BoxGeometry(2.7, 0.35, 1.8);
    const canopy = new THREE.Mesh(canopyGeo, this.materials.crimsonCloth);
    canopy.position.set(0, 1.85, 0);
    canopy.castShadow = true;
    group.add(canopy);

    // Hanging Marigold Torana Garlands under canopy
    const garlandGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.5, 8);
    garlandGeo.rotateZ(Math.PI / 2);
    const garland = new THREE.Mesh(garlandGeo, this.materials.saffronCloth);
    garland.position.set(0, 1.5, 0.4);
    group.add(garland);

    // Little hanging bells
    for (let i = -2; i <= 2; i++) {
      const bell = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), this.materials.divineGold);
      bell.position.set(i * 0.5, 1.35, 0.4);
      group.add(bell);
    }

    group.bounds = { width: 2.6, minHeight: 0.9, height: 3.2, depth: 1.6 };
    return group;
  }

  // Type 3: Carved Stone Pillar / Torana Block (MUST LANE SWITCH)
  createSolidPillar() {
    const group = new THREE.Group();
    group.obstacleType = 'SOLID';
    group.actionRequired = 'DODGE';

    const pillarGeo = new THREE.BoxGeometry(1.6, 4.0, 1.6);
    const pillar = new THREE.Mesh(pillarGeo, this.materials.sandstone);
    pillar.position.y = 2.0;
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    group.add(pillar);

    // Ornate top capital
    const capGeo = new THREE.BoxGeometry(2.0, 0.4, 2.0);
    const cap = new THREE.Mesh(capGeo, this.materials.sandstone);
    cap.position.y = 3.9;
    group.add(cap);

    // Glowing Diya mounted on pillar front
    const diya = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.1, 0.1, 8), this.materials.templeBrass);
    diya.position.set(0, 1.8, 0.85);
    group.add(diya);

    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 6), this.materials.diyaFlame);
    flame.position.set(0, 1.95, 0.85);
    group.add(flame);

    group.bounds = { width: 1.8, height: 4.0, depth: 1.8 };
    return group;
  }

  // Type 4: Large Brass Urli with Floating Lotuses (REQUIRES JUMP)
  createLotusUrli() {
    const group = new THREE.Group();
    group.obstacleType = 'LOW';
    group.actionRequired = 'JUMP';

    const urliGeo = new THREE.CylinderGeometry(1.1, 0.6, 0.6, 16);
    const urli = new THREE.Mesh(urliGeo, this.materials.templeBrass);
    urli.position.y = 0.35;
    urli.castShadow = true;
    group.add(urli);

    // Water surface inside bowl
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x1e3799,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85
    });
    const water = new THREE.Mesh(new THREE.CircleGeometry(0.95, 16), waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.62;
    group.add(water);

    // Floating Lotuses
    const lotusMat = new THREE.MeshStandardMaterial({ color: 0xff6b81, roughness: 0.4 });
    for (let i = 0; i < 3; i++) {
      const lotus = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), lotusMat);
      lotus.scale.set(1, 0.4, 1);
      const angle = (i / 3) * Math.PI * 2;
      lotus.position.set(Math.cos(angle) * 0.4, 0.66, Math.sin(angle) * 0.4);
      group.add(lotus);
    }

    group.bounds = { width: 2.2, height: 0.8, depth: 2.2 };
    return group;
  }
}
