// ===================================================================
// VIGHNAHARTA — MUSHAK AI COMPANION & GUIDE (FINAL REGION EXCLUSIVE)
// Intelligent divine companion that appears in Region 4 (Royal Temple Approach)
// to guide the player toward Bhagwan Ganesha with dynamic pathfinding,
// speed matching, scouting surges, and golden guide spark trails.
// ===================================================================

import * as THREE from 'three';

export class MushakGuide {
  constructor(shaderMaterials) {
    this.materials = shaderMaterials.materials;
    this.mesh = new THREE.Group();
    this.mesh.name = "MushakGuideCompanion";

    this.active = false;
    this.worldZ = 0;
    this.currentX = 1.6;
    this.targetX = 1.6;
    this.posY = 0;

    this.leadZOffset = 2.0; // Distance ahead of player
    this.animTime = 0;
    this.isVictory = false;
    this.scoutTimer = 0;

    this.buildCharacterMesh();
    this.mesh.visible = false;
  }

  buildCharacterMesh() {
    this.root = new THREE.Group();
    this.mesh.add(this.root);

    // Scale Mushak slightly to feel like a cute divine companion pet
    this.root.scale.set(0.85, 0.85, 0.85);

    this.bodyPivot = new THREE.Group();
    this.root.add(this.bodyPivot);

    // 1. Torso
    const torsoGeo = new THREE.SphereGeometry(0.55, 18, 14);
    torsoGeo.scale(0.85, 0.75, 1.35);
    this.torso = new THREE.Mesh(torsoGeo, this.materials.mushakFur);
    this.torso.castShadow = true;
    this.torso.position.set(0, 0.55, 0);
    this.bodyPivot.add(this.torso);

    // 2. Cream Underbelly
    const bellyGeo = new THREE.SphereGeometry(0.48, 14, 12);
    bellyGeo.scale(0.75, 0.6, 1.1);
    this.belly = new THREE.Mesh(bellyGeo, this.materials.mushakBelly);
    this.belly.position.set(0, 0.45, -0.05);
    this.belly.rotation.x = 0.1;
    this.bodyPivot.add(this.belly);

    // 3. Sacred Crimson Saddle with Gold Trim
    const saddleGeo = new THREE.SphereGeometry(0.558, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.36);
    saddleGeo.scale(0.86, 0.76, 0.85);
    this.saddle = new THREE.Mesh(saddleGeo, this.materials.crimsonCloth);
    this.saddle.position.set(0, 0.55, 0.04);
    this.saddle.castShadow = true;
    this.bodyPivot.add(this.saddle);

    // Golden Medallion
    const medallionGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.02, 16);
    const medallion = new THREE.Mesh(medallionGeo, this.materials.divineGold);
    medallion.position.set(0, 0.97, 0.04);
    this.bodyPivot.add(medallion);

    // Golden Neck Bell
    const bellGeo = new THREE.SphereGeometry(0.075, 12, 10);
    this.bell = new THREE.Mesh(bellGeo, this.materials.divineGold);
    this.bell.position.set(0, 0.76, 0.42);
    this.bodyPivot.add(this.bell);

    // 4. Head Group
    this.headPivot = new THREE.Group();
    this.headPivot.position.set(0, 0.75, 0.6);
    this.bodyPivot.add(this.headPivot);

    const headGeo = new THREE.SphereGeometry(0.38, 16, 14);
    headGeo.scale(0.88, 0.82, 1.15);
    this.head = new THREE.Mesh(headGeo, this.materials.mushakFur);
    this.head.castShadow = true;
    this.headPivot.add(this.head);

    // Snout
    const snoutGeo = new THREE.ConeGeometry(0.2, 0.38, 12);
    snoutGeo.rotateX(Math.PI / 2);
    this.snout = new THREE.Mesh(snoutGeo, this.materials.mushakBelly);
    this.snout.position.set(0, -0.05, 0.35);
    this.headPivot.add(this.snout);

    // Nose tip
    const noseMat = new THREE.MeshStandardMaterial({ color: 0x2d1313, roughness: 0.2 });
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 8), noseMat);
    nose.position.set(0, 0.02, 0.54);
    this.headPivot.add(nose);

    // Ears
    this.ears = [];
    for (let side = -1; side <= 1; side += 2) {
      const earGroup = new THREE.Group();
      earGroup.position.set(side * 0.28, 0.32, -0.05);

      const outer = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 10), this.materials.mushakFur);
      outer.scale.set(0.25, 1.0, 0.9);
      earGroup.add(outer);

      const inner = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 8), this.materials.mushakBelly);
      inner.scale.set(0.18, 0.85, 0.75);
      inner.position.set(side * 0.02, -0.02, 0.03);
      earGroup.add(inner);

      this.headPivot.add(earGroup);
      this.ears.push(earGroup);
    }

    // 5. Legs
    this.frontLeftLeg = this.buildLeg(true, true);
    this.frontRightLeg = this.buildLeg(true, false);
    this.backLeftLeg = this.buildLeg(false, true);
    this.backRightLeg = this.buildLeg(false, false);

    this.bodyPivot.add(this.frontLeftLeg);
    this.bodyPivot.add(this.frontRightLeg);
    this.bodyPivot.add(this.backLeftLeg);
    this.bodyPivot.add(this.backRightLeg);

    // 6. Tail
    this.tailJoints = [];
    let parentJoint = this.bodyPivot;
    for (let i = 0; i < 6; i++) {
      const joint = new THREE.Group();
      if (i === 0) {
        joint.position.set(0, 0.42, -0.65);
      } else {
        joint.position.set(0, 0.02, -0.16);
      }
      const segMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.04 - i * 0.005, 0.045 - i * 0.005, 0.16, 8), this.materials.mushakBelly);
      segMesh.rotation.x = Math.PI / 2;
      joint.add(segMesh);
      parentJoint.add(joint);
      this.tailJoints.push(joint);
      parentJoint = joint;
    }

    // 7. Divine Guide Light Aura
    this.guideLight = new THREE.PointLight(0xffd700, 1.8, 8.0);
    this.guideLight.position.set(0, 0.8, 0);
    this.mesh.add(this.guideLight);
  }

  buildLeg(isFront, isLeft) {
    const legGroup = new THREE.Group();
    const side = isLeft ? -1 : 1;
    legGroup.position.set(side * (isFront ? 0.32 : 0.38), isFront ? 0.35 : 0.4, isFront ? 0.4 : -0.32);

    const upper = new THREE.Mesh(new THREE.SphereGeometry(isFront ? 0.14 : 0.22, 10, 8), this.materials.mushakFur);
    upper.scale.set(0.8, 1.2, 0.9);
    legGroup.add(upper);

    const paw = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.18), this.materials.mushakBelly);
    paw.position.set(0, -0.22, 0.05);
    paw.castShadow = true;
    legGroup.add(paw);

    return legGroup;
  }

  spawnAt(playerX, playerZ) {
    this.active = true;
    this.mesh.visible = true;
    this.currentX = playerX > 0 ? playerX - 1.8 : playerX + 1.8;
    this.targetX = this.currentX;
    this.worldZ = playerZ - 1.0;
    this.mesh.position.set(this.currentX, 0, this.worldZ);
    this.isVictory = false;
  }

  update(delta, player, runnerSpeed) {
    if (!this.active) return;

    this.animTime += delta * (this.isVictory ? 3.0 : (runnerSpeed * 0.8));
    this.scoutTimer += delta;

    if (this.isVictory) {
      // Respectful bow beside player at Lotus Altar
      this.mesh.position.set(1.4, 0, player.mesh.position.z + 0.5);
      this.bodyPivot.position.set(0, 0, 0);
      this.bodyPivot.rotation.set(0.25, -0.2, 0);
      this.headPivot.rotation.set(-0.25 + Math.sin(this.animTime * 2) * 0.05, 0, 0);
      return;
    }

    // Dynamic Companion AI Guidance Behavior:
    // 1. Periodically surges ahead to scout and guide player forward
    const scoutWave = Math.sin(this.scoutTimer * 0.8);
    const desiredLeadZ = 2.2 + scoutWave * 1.5; // Stays 1.0m to 3.7m ahead
    const targetZ = player.mesh.position.z + desiredLeadZ;

    // Smooth Z velocity matching player
    this.worldZ += (targetZ - this.worldZ) * Math.min(1.0, delta * 8.0);
    this.mesh.position.z = this.worldZ;

    // 2. Lateral Path Alignment: stays comfortably in an adjacent lane or beside player
    let desiredX = player.currentX + (player.currentX >= 0 ? -1.6 : 1.6);
    desiredX = THREE.MathUtils.clamp(desiredX, -3.2, 3.2);

    this.currentX += (desiredX - this.currentX) * Math.min(1.0, delta * 12.0);
    this.mesh.position.x = this.currentX;

    // 3. Four-legged sprinting animation matching runner speed
    const runAngle = this.animTime * 2;
    this.bodyPivot.position.y = Math.abs(Math.sin(runAngle)) * 0.1;
    this.bodyPivot.rotation.set(
      Math.sin(runAngle) * 0.06,
      (desiredX - this.currentX) * 0.08,
      (desiredX - this.currentX) * 0.06
    );

    this.frontLeftLeg.position.z = 0.4 + Math.sin(runAngle) * 0.25;
    this.frontRightLeg.position.z = 0.4 - Math.sin(runAngle) * 0.25;
    this.backLeftLeg.position.z = -0.32 - Math.sin(runAngle) * 0.28;
    this.backRightLeg.position.z = -0.32 + Math.sin(runAngle) * 0.28;

    // Ear bounce & tail whip
    this.ears[0].rotation.z = Math.sin(runAngle) * 0.12;
    this.ears[1].rotation.z = -Math.sin(runAngle) * 0.12;
    this.tailJoints.forEach((j, idx) => {
      j.rotation.y = Math.sin(runAngle - idx * 0.6) * 0.25;
    });

    // Pulsing divine guide light
    if (this.guideLight) {
      this.guideLight.intensity = 1.5 + Math.sin(this.scoutTimer * 3.0) * 0.5;
    }
  }

  triggerVictory() {
    this.isVictory = true;
  }

  reset() {
    this.active = false;
    this.mesh.visible = false;
    this.isVictory = false;
    this.worldZ = 0;
    this.currentX = 1.6;
    this.mesh.position.set(1.6, 0, 0);
  }
}
