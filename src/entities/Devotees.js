// ===================================================================
// VIGHNAHARTA — DEVOTEES & POOJA CEREMONY
// Devotees performing sacred Aarti, offering flower petals,
// and praying with folded hands around Bhagwan Ganesha.
// ===================================================================

import * as THREE from 'three';

export class DevoteesManager {
  constructor(shaderMaterials) {
    this.materials = shaderMaterials.materials;
    this.group = new THREE.Group();
    this.devotees = [];
    this.animTime = 0;

    this.createDevoteeCrowd();
  }

  createDevoteeCrowd() {
    // Array of crowd configurations around the shrine
    const crowdPositions = [
      // Left side devotees
      { x: -5.5, z: 2.0, rotY: 0.8, type: 'aarti_priest', cloth: 0xff6f00 },
      { x: -4.2, z: 4.5, rotY: 0.45, type: 'praying', cloth: 0xeb4d4b },
      { x: -6.8, z: 5.2, rotY: 0.6, type: 'flowers', cloth: 0xf0932b },
      { x: -3.8, z: 7.5, rotY: 0.25, type: 'kneeling', cloth: 0xffbe76 },

      // Right side devotees
      { x: 5.5, z: 2.0, rotY: -0.8, type: 'aarti_priest', cloth: 0xff793f },
      { x: 4.2, z: 4.5, rotY: -0.45, type: 'praying', cloth: 0xcd6133 },
      { x: 6.8, z: 5.2, rotY: -0.6, type: 'flowers', cloth: 0x2ed573 },
      { x: 3.8, z: 7.5, rotY: -0.25, type: 'kneeling', cloth: 0xfffa65 }
    ];

    crowdPositions.forEach(cfg => {
      const devotee = this.buildDevotee(cfg);
      this.group.add(devotee.mesh);
      this.devotees.push(devotee);
    });
  }

  buildDevotee(cfg) {
    const root = new THREE.Group();
    root.position.set(cfg.x, 0, cfg.z);
    root.rotation.y = cfg.rotY;

    const clothMat = new THREE.MeshStandardMaterial({
      color: cfg.cloth,
      roughness: 0.75,
      metalness: 0.05
    });

    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xc68642,
      roughness: 0.6,
      metalness: 0.1
    });

    let body, head, arms = [];

    if (cfg.type === 'kneeling') {
      // Kneeling posture
      const lowerGeo = new THREE.BoxGeometry(0.75, 0.45, 0.9);
      const lower = new THREE.Mesh(lowerGeo, clothMat);
      lower.position.y = 0.22;
      lower.castShadow = true;
      root.add(lower);

      const torsoGeo = new THREE.CapsuleGeometry(0.28, 0.65, 8, 12);
      body = new THREE.Mesh(torsoGeo, clothMat);
      body.position.set(0, 0.75, 0.1);
      body.rotation.x = 0.35;
      body.castShadow = true;
      root.add(body);

      const headGeo = new THREE.SphereGeometry(0.22, 12, 10);
      head = new THREE.Mesh(headGeo, skinMat);
      head.position.set(0, 1.25, 0.3);
      head.castShadow = true;
      root.add(head);

      // Folded hands in front on floor
      const armGeo = new THREE.CapsuleGeometry(0.08, 0.5, 6, 8);
      const lArm = new THREE.Mesh(armGeo, skinMat);
      lArm.position.set(-0.18, 0.65, 0.45);
      lArm.rotation.x = 0.9;
      root.add(lArm);

      const rArm = new THREE.Mesh(armGeo, skinMat);
      rArm.position.set(0.18, 0.65, 0.45);
      rArm.rotation.x = 0.9;
      root.add(rArm);
    } else {
      // Standing Devotee
      // Dhoti / Saree Lower
      const skirtGeo = new THREE.CylinderGeometry(0.35, 0.48, 1.2, 12);
      const skirt = new THREE.Mesh(skirtGeo, clothMat);
      skirt.position.y = 0.6;
      skirt.castShadow = true;
      root.add(skirt);

      // Torso
      const torsoGeo = new THREE.CapsuleGeometry(0.26, 0.7, 8, 12);
      body = new THREE.Mesh(torsoGeo, clothMat);
      body.position.y = 1.45;
      body.castShadow = true;
      root.add(body);

      // Head
      const headGeo = new THREE.SphereGeometry(0.22, 12, 10);
      head = new THREE.Mesh(headGeo, skinMat);
      head.position.y = 2.05;
      head.castShadow = true;
      root.add(head);

      // Arms & Sacred Props based on type
      if (cfg.type === 'aarti_priest') {
        // Holding glowing brass Aarti lamp
        const armGeo = new THREE.CapsuleGeometry(0.08, 0.55, 6, 8);
        const rArm = new THREE.Mesh(armGeo, skinMat);
        rArm.position.set(0.25, 1.55, 0.25);
        rArm.rotation.x = 1.1;
        root.add(rArm);
        arms.push(rArm);

        // Tiered Aarti Deepam
        const aartiLamp = new THREE.Group();
        aartiLamp.position.set(0.32, 1.6, 0.65);

        const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.15, 0.08, 10), this.materials.templeBrass);
        aartiLamp.add(plate);

        // Flickering flame on lamp
        const flame = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 8), this.materials.diyaFlame);
        flame.position.y = 0.15;
        aartiLamp.add(flame);

        root.add(aartiLamp);
        root.aartiLamp = aartiLamp;
      } else if (cfg.type === 'praying') {
        // Anjali Mudra (Folded hands at chest)
        const armGeo = new THREE.CapsuleGeometry(0.07, 0.45, 6, 8);
        const lArm = new THREE.Mesh(armGeo, skinMat);
        lArm.position.set(-0.16, 1.5, 0.22);
        lArm.rotation.set(0.8, -0.4, -0.3);
        root.add(lArm);

        const rArm = new THREE.Mesh(armGeo, skinMat);
        rArm.position.set(0.16, 1.5, 0.22);
        rArm.rotation.set(0.8, 0.4, 0.3);
        root.add(rArm);
      } else if (cfg.type === 'flowers') {
        // Holding flower basket / scattering petals
        const armGeo = new THREE.CapsuleGeometry(0.07, 0.5, 6, 8);
        const rArm = new THREE.Mesh(armGeo, skinMat);
        rArm.position.set(0.2, 1.45, 0.3);
        rArm.rotation.set(0.7, 0, 0.4);
        root.add(rArm);
        arms.push(rArm);

        // Flower bowl
        const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.12, 0.12, 10), this.materials.templeBrass);
        bowl.position.set(0.25, 1.35, 0.45);
        root.add(bowl);
      }
    }

    return {
      mesh: root,
      cfg: cfg,
      body: body,
      head: head,
      arms: arms,
      seed: Math.random() * 10
    };
  }

  update(delta) {
    this.animTime += delta;

    this.devotees.forEach(d => {
      const t = this.animTime * 2.0 + d.seed;

      // Gentle devotional sway
      if (d.body) {
        d.body.rotation.z = Math.sin(t * 0.8) * 0.04;
      }
      if (d.head) {
        d.head.rotation.x = Math.sin(t) * 0.05;
      }

      // Priest Aarti circular lamp motion
      if (d.cfg.type === 'aarti_priest' && d.mesh.aartiLamp) {
        const aartiRadius = 0.18;
        d.mesh.aartiLamp.position.x = 0.32 + Math.cos(t * 1.5) * aartiRadius;
        d.mesh.aartiLamp.position.y = 1.6 + Math.sin(t * 1.5) * aartiRadius;
      }

      // Flower tosser subtle arm gesture
      if (d.cfg.type === 'flowers' && d.arms.length > 0) {
        d.arms[0].rotation.x = 0.7 + Math.sin(t * 1.2) * 0.15;
      }
    });
  }
}
