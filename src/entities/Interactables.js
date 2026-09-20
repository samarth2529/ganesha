// ===================================================================
// VIGHNAHARTA — 3D INTERACTIVE OBJECTS (VIGHNAS, SHRINES, TEMPLE BELLS)
// Ornate Indian mythological interactables with glowing aura shaders,
// proximity detection, and satisfying clearance animations.
// ===================================================================

import * as THREE from 'three';

export class InteractableFactory {
  constructor(shaderMaterials) {
    this.materials = shaderMaterials.materials;
  }

  // 1. Mystical Vighna Barrier (Vighna 1, 2, 3)
  createVighna(vighnaId, zPosition) {
    const group = new THREE.Group();
    group.interactId = `VIGHNA_${vighnaId}`;
    group.interactType = 'VIGHNA';
    group.vighnaId = vighnaId;
    group.promptText = `CLEAR VIGHNA ${vighnaId}`;
    group.isCleared = false;
    group.targetZ = zPosition;
    group.position.set(0, 0, zPosition);

    // Cosmic mystic portal ring
    const ringGeo = new THREE.TorusGeometry(2.4, 0.16, 16, 32);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x9b59b6,
      emissive: 0x8e44ad,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 2.4;
    group.add(ring);
    group.ring = ring;

    // Glowing Inner Energy Trishula / Runes
    const trishulaGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8);
    const goldMat = this.materials.divineGold;
    const shaft = new THREE.Mesh(trishulaGeo, goldMat);
    shaft.position.y = 2.4;
    group.add(shaft);

    // Trishula side prongs
    const prongGeo = new THREE.TorusGeometry(0.6, 0.06, 8, 16, Math.PI);
    const prong = new THREE.Mesh(prongGeo, goldMat);
    prong.position.set(0, 3.2, 0);
    prong.rotation.z = Math.PI;
    group.add(prong);

    // Stone Guardian Pillars on sides
    for (let side = -1; side <= 1; side += 2) {
      const pillarGeo = new THREE.BoxGeometry(0.8, 4.0, 0.8);
      const pillar = new THREE.Mesh(pillarGeo, this.materials.sandstone);
      pillar.position.set(side * 3.2, 2.0, 0);
      pillar.castShadow = true;
      group.add(pillar);

      // Top glowing Diya on each pillar
      const diyaGeo = new THREE.CylinderGeometry(0.3, 0.18, 0.2, 10);
      const diya = new THREE.Mesh(diyaGeo, this.materials.templeBrass);
      diya.position.set(side * 3.2, 4.1, 0);
      group.add(diya);

      const flameGeo = new THREE.ConeGeometry(0.12, 0.28, 8);
      const flameMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.set(side * 3.2, 4.3, 0);
      group.add(flame);
    }

    // Sacred Om glyph plaque in center
    const omGeo = new THREE.SphereGeometry(0.45, 16, 12);
    const omMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xff8800,
      emissiveIntensity: 0.9,
      roughness: 0.1
    });
    const omOrb = new THREE.Mesh(omGeo, omMat);
    omOrb.position.y = 2.4;
    group.add(omOrb);
    group.omOrb = omOrb;

    return group;
  }

  // 2. Sacred Festival Shrine Altar (Task 4)
  createFestivalShrine(interactId, zPosition) {
    const group = new THREE.Group();
    group.interactId = interactId;
    group.interactType = 'SHRINE';
    group.promptText = 'MAKE SACRED OFFERING';
    group.isCleared = false;
    group.targetZ = zPosition;
    group.position.set(0, 0, zPosition);

    // Sandstone tiered altar base
    const baseGeo1 = new THREE.BoxGeometry(3.6, 0.5, 2.2);
    const base1 = new THREE.Mesh(baseGeo1, this.materials.sandstone);
    base1.position.y = 0.25;
    base1.castShadow = true;
    base1.receiveShadow = true;
    group.add(base1);

    const baseGeo2 = new THREE.BoxGeometry(2.6, 0.5, 1.6);
    const base2 = new THREE.Mesh(baseGeo2, this.materials.sandstone);
    base2.position.y = 0.7;
    base2.castShadow = true;
    group.add(base2);

    // Central Brass Urli with Sacred Lotus Offerings
    const urliGeo = new THREE.CylinderGeometry(0.65, 0.45, 0.35, 16);
    const urli = new THREE.Mesh(urliGeo, this.materials.templeBrass);
    urli.position.y = 1.1;
    urli.castShadow = true;
    group.add(urli);

    // Floating sacred modaks / offerings
    const offeringMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffaa00,
      emissiveIntensity: 0.6
    });
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const modak = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.3, 8), offeringMat);
      modak.position.set(Math.cos(angle) * 0.3, 1.4, Math.sin(angle) * 0.3);
      group.add(modak);
    }

    // Two side brass Diyas with glowing flame
    for (let side = -1; side <= 1; side += 2) {
      const diya = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.15, 0.18, 10), this.materials.templeBrass);
      diya.position.set(side * 1.3, 0.6, 0);
      group.add(diya);

      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 6), new THREE.MeshBasicMaterial({ color: 0xff6600 }));
      flame.position.set(side * 1.3, 0.78, 0);
      group.add(flame);
    }

    // Sacred Marigold Canopy
    const canopyGeo = new THREE.CylinderGeometry(0.06, 0.06, 3.2, 8);
    canopyGeo.rotateZ(Math.PI / 2);
    const garland = new THREE.Mesh(canopyGeo, this.materials.saffronCloth);
    garland.position.set(0, 2.2, 0);
    group.add(garland);

    return group;
  }

  // 3. Sacred Temple Bell Mechanism (Task 8)
  createTempleBell(interactId, zPosition) {
    const group = new THREE.Group();
    group.interactId = interactId;
    group.interactType = 'BELL';
    group.promptText = 'RING SACRED BELL';
    group.isCleared = false;
    group.targetZ = zPosition;
    group.position.set(0, 0, zPosition);

    // Stone Gateway Arch
    for (let side = -1; side <= 1; side += 2) {
      const colGeo = new THREE.CylinderGeometry(0.3, 0.35, 3.8, 12);
      const col = new THREE.Mesh(colGeo, this.materials.sandstone);
      col.position.set(side * 2.0, 1.9, 0);
      col.castShadow = true;
      group.add(col);
    }

    const archBeamGeo = new THREE.BoxGeometry(4.6, 0.6, 0.9);
    const archBeam = new THREE.Mesh(archBeamGeo, this.materials.sandstone);
    archBeam.position.set(0, 3.8, 0);
    archBeam.castShadow = true;
    group.add(archBeam);

    // Giant Bronze Temple Bell
    const bellGroup = new THREE.Group();
    bellGroup.position.set(0, 3.2, 0);
    group.add(bellGroup);
    group.bellMesh = bellGroup;

    // Bell body
    const bellGeo = new THREE.CylinderGeometry(0.25, 0.8, 1.2, 16);
    const bell = new THREE.Mesh(bellGeo, this.materials.templeBrass);
    bell.position.y = -0.6;
    bell.castShadow = true;
    bellGroup.add(bell);

    // Bell rim & dome
    const domeGeo = new THREE.SphereGeometry(0.35, 14, 10);
    const dome = new THREE.Mesh(domeGeo, this.materials.templeBrass);
    dome.position.y = 0;
    bellGroup.add(dome);

    const clapperGeo = new THREE.SphereGeometry(0.18, 10, 8);
    const clapper = new THREE.Mesh(clapperGeo, this.materials.divineGold);
    clapper.position.y = -1.1;
    bellGroup.add(clapper);

    return group;
  }
}
