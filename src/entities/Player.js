// ===================================================================
// VIGHNAHARTA — 3D HUMAN PLAYER CHARACTER (INDIAN DEVOTEE)
// Stylized young Indian devotee with dark hair, tilak, pristine
// white silk kurta with golden buttons, saffron pleated angavastram,
// white dhoti, and brown leather juttis.
// Fully articulated with procedural skeletal-like animation states.
// ===================================================================

import * as THREE from 'three';

export class Player {
  constructor(shaderMaterials) {
    this.materials = shaderMaterials.materials;
    this.mesh = new THREE.Group();
    this.mesh.name = "PlayerCharacter";

    // Movement & Physics state
    this.currentLane = 0; // -1: Left, 0: Center, 1: Right
    this.laneWidth = 3.2;
    this.targetX = 0;
    this.currentX = 0;

    this.posY = 0;
    this.velY = 0;
    this.gravity = -48.0;
    this.jumpStrength = 17.5;
    this.isGrounded = true;

    this.isSliding = false;
    this.slideTimer = 0;
    this.slideDuration = 0.65; // seconds

    this.isDead = false;
    this.isVictory = false;

    // Animation state
    this.animTime = 0;
    this.tiltZ = 0;

    this.buildCharacterMesh();
  }

  buildCharacterMesh() {
    this.root = new THREE.Group();
    this.mesh.add(this.root);

    // Dynamic materials for Player
    this.skinMat = new THREE.MeshStandardMaterial({
      color: 0xdfa06c, // Warm Indian skin tone
      roughness: 0.55,
      metalness: 0.05
    });

    this.hairMat = new THREE.MeshStandardMaterial({
      color: 0x24140c, // Rich dark brown styled hair
      roughness: 0.35,
      metalness: 0.1
    });

    this.kurtaMat = new THREE.MeshStandardMaterial({
      color: 0xfaf8f2, // Pristine white silk kurta
      roughness: 0.65,
      metalness: 0.1
    });

    this.angavastramMat = new THREE.MeshStandardMaterial({
      color: 0xe67e22, // Saffron orange pleated sash
      roughness: 0.6,
      metalness: 0.15
    });

    this.goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xffd700, // Sacred divine gold borders & buttons
      roughness: 0.25,
      metalness: 0.85
    });

    this.dhotiMat = new THREE.MeshStandardMaterial({
      color: 0xf5f3ea, // White pleated dhoti
      roughness: 0.7,
      metalness: 0.05
    });

    this.shoeMat = new THREE.MeshStandardMaterial({
      color: 0x6e3b1e, // Traditional brown leather juttis
      roughness: 0.45,
      metalness: 0.1
    });

    // Main Body Pivot (squash, stretch & bank rotation)
    this.bodyPivot = new THREE.Group();
    this.root.add(this.bodyPivot);

    // --- 1. TORSO (White Silk Kurta) ---
    this.torsoPivot = new THREE.Group();
    this.torsoPivot.position.y = 1.0;
    this.bodyPivot.add(this.torsoPivot);

    const torsoGeo = new THREE.CylinderGeometry(0.32, 0.28, 0.72, 14);
    this.torso = new THREE.Mesh(torsoGeo, this.kurtaMat);
    this.torso.position.y = 0.36;
    this.torso.castShadow = true;
    this.torsoPivot.add(this.torso);

    // Mandarin Golden Collar
    const collarGeo = new THREE.CylinderGeometry(0.18, 0.19, 0.08, 12);
    const collar = new THREE.Mesh(collarGeo, this.goldTrimMat);
    collar.position.set(0, 0.72, 0.02);
    this.torsoPivot.add(collar);

    // Vertical Golden Button Placket on Kurta Front
    const placketGeo = new THREE.BoxGeometry(0.06, 0.42, 0.02);
    const placket = new THREE.Mesh(placketGeo, this.goldTrimMat);
    placket.position.set(0, 0.45, 0.3);
    this.torsoPivot.add(placket);

    // Tiny Golden Buttons
    for (let b = 0; b < 3; b++) {
      const btnGeo = new THREE.SphereGeometry(0.02, 8, 6);
      const btn = new THREE.Mesh(btnGeo, this.goldTrimMat);
      btn.position.set(0, 0.55 - b * 0.1, 0.32);
      this.torsoPivot.add(btn);
    }

    // --- 2. SAFFRON ANGAVASTRAM SASH (Draped Across Waist & Shoulder) ---
    // Waist Sash
    const sashGeo = new THREE.CylinderGeometry(0.34, 0.32, 0.18, 14);
    const sash = new THREE.Mesh(sashGeo, this.angavastramMat);
    sash.position.set(0, 0.18, 0);
    sash.castShadow = true;
    this.torsoPivot.add(sash);

    // Golden Waist Brooch / Buckle
    const broochGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.02, 12);
    broochGeo.rotateX(Math.PI / 2);
    const brooch = new THREE.Mesh(broochGeo, this.goldTrimMat);
    brooch.position.set(0, 0.18, 0.34);
    this.torsoPivot.add(brooch);

    // Flowing Sash Drape (Hanging down front-left)
    this.sashDrape = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.55, 0.04), this.angavastramMat);
    this.sashDrape.position.set(0.12, -0.1, 0.3);
    this.sashDrape.rotation.z = -0.1;
    this.sashDrape.castShadow = true;
    this.torsoPivot.add(this.sashDrape);

    // Golden Border on Sash Drape Hem
    const sashHem = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.04, 0.05), this.goldTrimMat);
    sashHem.position.set(0, -0.27, 0.01);
    this.sashDrape.add(sashHem);

    // --- 3. HEAD & FACE ---
    this.headPivot = new THREE.Group();
    this.headPivot.position.set(0, 0.86, 0.02);
    this.torsoPivot.add(this.headPivot);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.12, 0.13, 0.14, 10);
    const neck = new THREE.Mesh(neckGeo, this.skinMat);
    neck.position.y = -0.05;
    this.headPivot.add(neck);

    // Stylized Face Head Mesh
    const headGeo = new THREE.SphereGeometry(0.24, 16, 14);
    headGeo.scale(0.92, 1.05, 0.95);
    this.headMesh = new THREE.Mesh(headGeo, this.skinMat);
    this.headMesh.position.y = 0.15;
    this.headMesh.castShadow = true;
    this.headPivot.add(this.headMesh);

    // Stylized Dark Brown Voluminous Hair
    const hairTopGeo = new THREE.SphereGeometry(0.26, 16, 12);
    hairTopGeo.scale(0.96, 0.95, 1.05);
    const hairTop = new THREE.Mesh(hairTopGeo, this.hairMat);
    hairTop.position.set(0, 0.23, -0.02);
    hairTop.castShadow = true;
    this.headPivot.add(hairTop);

    // Front Hair Swoop / Quiff
    const quiffGeo = new THREE.SphereGeometry(0.15, 12, 8);
    quiffGeo.scale(1.2, 0.7, 0.9);
    const quiff = new THREE.Mesh(quiffGeo, this.hairMat);
    quiff.position.set(0.04, 0.35, 0.12);
    quiff.rotation.set(-0.2, 0.15, 0.25);
    this.headPivot.add(quiff);

    // Sacred Tilak / Chandan on Forehead
    const tilakGeo = new THREE.BoxGeometry(0.025, 0.06, 0.01);
    const tilakMat = new THREE.MeshBasicMaterial({ color: 0xeb4d4b }); // Vermilion red bindi/tilak
    const tilak = new THREE.Mesh(tilakGeo, tilakMat);
    tilak.position.set(0, 0.22, 0.235);
    this.headPivot.add(tilak);

    // Big Expressive Devotee Eyes
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eyeIrisMat = new THREE.MeshBasicMaterial({ color: 0x2c1d11 }); // Warm deep brown eyes

    for (let side = -1; side <= 1; side += 2) {
      const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), eyeWhiteMat);
      eyeWhite.scale.set(1.2, 1.0, 0.5);
      eyeWhite.position.set(side * 0.09, 0.15, 0.21);
      this.headPivot.add(eyeWhite);

      const eyeIris = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 6), eyeIrisMat);
      eyeIris.position.set(side * 0.09, 0.15, 0.23);
      this.headPivot.add(eyeIris);

      // Cute Ears
      const earGeo = new THREE.SphereGeometry(0.06, 8, 6);
      earGeo.scale(0.5, 0.8, 0.6);
      const ear = new THREE.Mesh(earGeo, this.skinMat);
      ear.position.set(side * 0.23, 0.14, -0.02);
      this.headPivot.add(ear);
    }

    // --- 4. ARMS & HANDS ---
    this.leftArmPivot = new THREE.Group();
    this.leftArmPivot.position.set(-0.35, 0.62, 0);
    this.torsoPivot.add(this.leftArmPivot);

    this.rightArmPivot = new THREE.Group();
    this.rightArmPivot.position.set(0.35, 0.62, 0);
    this.torsoPivot.add(this.rightArmPivot);

    this.buildArm(this.leftArmPivot, true);
    this.buildArm(this.rightArmPivot, false);

    // --- 5. LOWER BODY (Pleated White Dhoti & Legs) ---
    this.hips = new THREE.Group();
    this.hips.position.y = 1.0;
    this.bodyPivot.add(this.hips);

    // Dhoti Main Center Pleats
    const dhotiCenterGeo = new THREE.BoxGeometry(0.48, 0.45, 0.4);
    const dhotiCenter = new THREE.Mesh(dhotiCenterGeo, this.dhotiMat);
    dhotiCenter.position.set(0, -0.15, 0);
    dhotiCenter.castShadow = true;
    this.hips.add(dhotiCenter);

    // Left Leg Pivot
    this.leftLegPivot = new THREE.Group();
    this.leftLegPivot.position.set(-0.16, -0.22, 0);
    this.hips.add(this.leftLegPivot);

    // Right Leg Pivot
    this.rightLegPivot = new THREE.Group();
    this.rightLegPivot.position.set(0.16, -0.22, 0);
    this.hips.add(this.rightLegPivot);

    this.buildLeg(this.leftLegPivot, true);
    this.buildLeg(this.rightLegPivot, false);
  }

  buildArm(armGroup, isLeft) {
    // Upper Arm (Kurta sleeve)
    const upperGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.32, 10);
    const upperArm = new THREE.Mesh(upperGeo, this.kurtaMat);
    upperArm.position.y = -0.16;
    upperArm.castShadow = true;
    armGroup.add(upperArm);

    // Golden Bangle on right wrist (Kada)
    const forearmGroup = new THREE.Group();
    forearmGroup.position.y = -0.32;
    armGroup.add(forearmGroup);
    armGroup.forearm = forearmGroup;

    // Forearm (Skin)
    const foreGeo = new THREE.CylinderGeometry(0.075, 0.065, 0.28, 8);
    const forearm = new THREE.Mesh(foreGeo, this.skinMat);
    forearm.position.y = -0.14;
    forearm.castShadow = true;
    forearmGroup.add(forearm);

    // Kada on wrist
    const kadaGeo = new THREE.TorusGeometry(0.07, 0.015, 6, 12);
    kadaGeo.rotateX(Math.PI / 2);
    const kada = new THREE.Mesh(kadaGeo, this.goldTrimMat);
    kada.position.y = -0.24;
    forearmGroup.add(kada);

    // Hand
    const handGeo = new THREE.SphereGeometry(0.06, 8, 6);
    handGeo.scale(0.8, 1.1, 0.6);
    const hand = new THREE.Mesh(handGeo, this.skinMat);
    hand.position.y = -0.31;
    forearmGroup.add(hand);
  }

  buildLeg(legGroup, isLeft) {
    // Upper Dhoti Thigh
    const thighGeo = new THREE.CylinderGeometry(0.16, 0.13, 0.42, 10);
    const thigh = new THREE.Mesh(thighGeo, this.dhotiMat);
    thigh.position.y = -0.21;
    thigh.castShadow = true;
    legGroup.add(thigh);

    // Knee / Lower Leg Group
    const lowerGroup = new THREE.Group();
    lowerGroup.position.y = -0.42;
    legGroup.add(lowerGroup);
    legGroup.lowerLeg = lowerGroup;

    // Lower Pleated Dhoti Shin
    const shinGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.38, 8);
    const shin = new THREE.Mesh(shinGeo, this.dhotiMat);
    shin.position.y = -0.19;
    shin.castShadow = true;
    lowerGroup.add(shin);

    // Traditional Leather Jutti Shoe
    const shoeGeo = new THREE.BoxGeometry(0.14, 0.09, 0.26);
    const shoe = new THREE.Mesh(shoeGeo, this.shoeMat);
    shoe.position.set(0, -0.41, 0.04);
    shoe.castShadow = true;
    lowerGroup.add(shoe);

    // Golden Jutti Tip Curve
    const toeGeo = new THREE.ConeGeometry(0.06, 0.1, 6);
    toeGeo.rotateX(Math.PI / 2);
    const toe = new THREE.Mesh(toeGeo, this.goldTrimMat);
    toe.position.set(0, -0.41, 0.18);
    lowerGroup.add(toe);
  }

  // --- Input Handlers ---

  changeLane(direction) {
    if (this.isDead || this.isVictory) return false;
    if (direction === 'RIGHT' && this.currentLane < 1) {
      this.currentLane++;
      this.targetX = -this.currentLane * this.laneWidth;
      return true;
    } else if (direction === 'LEFT' && this.currentLane > -1) {
      this.currentLane--;
      this.targetX = -this.currentLane * this.laneWidth;
      return true;
    }
    return false;
  }

  jump() {
    if (this.isDead || this.isVictory) return false;
    if (this.isGrounded) {
      this.velY = this.jumpStrength;
      this.isGrounded = false;
      this.isSliding = false;
      return true;
    }
    return false;
  }

  slide() {
    if (this.isDead || this.isVictory) return false;
    if (this.isGrounded && !this.isSliding) {
      this.isSliding = true;
      this.slideTimer = this.slideDuration;
      return true;
    } else if (!this.isGrounded) {
      // Quick fast drop down
      this.velY = -30.0;
      this.isSliding = true;
      this.slideTimer = this.slideDuration;
      return true;
    }
    return false;
  }

  triggerDeath() {
    this.isDead = true;
    this.velY = 10.0;
  }

  triggerVictory() {
    this.isVictory = true;
    this.targetX = 0;
    this.isSliding = false;
  }

  // --- Frame Update & Procedural Skeletal Animation ---

  update(delta, runnerSpeed) {
    this.animTime += delta * (this.isVictory ? 2.5 : (runnerSpeed * 0.6));

    // 1. Snappy Lane Shift Interpolation
    const lerpSpeed = 28.0;
    this.currentX += (this.targetX - this.currentX) * Math.min(1.0, delta * lerpSpeed);
    this.mesh.position.x = this.currentX;

    // Banking Lean based on lane shifting velocity
    const laneDelta = this.targetX - this.currentX;
    this.tiltZ = laneDelta * 0.08;

    // 2. Vertical Physics (Jump / Gravity)
    if (!this.isGrounded) {
      this.posY += this.velY * delta;
      this.velY += this.gravity * delta;

      if (this.posY <= 0) {
        this.posY = 0;
        this.velY = 0;
        this.isGrounded = true;
      }
    }
    this.mesh.position.y = this.posY;

    // 3. Slide Timer
    if (this.isSliding) {
      this.slideTimer -= delta;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
    }

    // 4. Procedural Animation States
    if (this.isDead) {
      // Tumble / fall
      this.bodyPivot.rotation.x += delta * 6.0;
      this.bodyPivot.position.y = Math.max(0.3, this.bodyPivot.position.y - delta * 2.0);
    } else if (this.isVictory) {
      // Respectful Namaste / Pranam Pose before Lord Ganesha
      this.bodyPivot.scale.set(1, 1, 1);
      this.bodyPivot.position.set(0, 0, 0);
      this.bodyPivot.rotation.set(0.12, 0, 0); // Gentle humble bow

      // Folded hands at chest in Namaste
      this.leftArmPivot.rotation.set(-0.9, -0.6, 0.4);
      this.rightArmPivot.rotation.set(-0.9, 0.6, -0.4);
      if (this.leftArmPivot.forearm) this.leftArmPivot.forearm.rotation.set(-0.8, -0.5, 0);
      if (this.rightArmPivot.forearm) this.rightArmPivot.forearm.rotation.set(-0.8, 0.5, 0);

      this.headPivot.rotation.set(-0.15 + Math.sin(this.animTime * 2) * 0.04, 0, 0);
      this.leftLegPivot.rotation.set(0, 0, 0);
      this.rightLegPivot.rotation.set(0, 0, 0);
    } else if (this.isSliding) {
      // Low Profile Knee Slide
      this.bodyPivot.scale.set(1, 0.55, 1.2);
      this.bodyPivot.position.y = -0.35;
      this.bodyPivot.rotation.set(0.4, 0, this.tiltZ); // Lean back on slide

      this.leftArmPivot.rotation.set(0.8, 0, -0.3);
      this.rightArmPivot.rotation.set(0.8, 0, 0.3);
      this.leftLegPivot.rotation.set(-1.1, 0, 0);
      this.rightLegPivot.rotation.set(-1.1, 0, 0);
    } else if (!this.isGrounded) {
      // Jump Arc (Spread arms & bent knees)
      const isRising = this.velY > 0;
      this.bodyPivot.scale.set(0.95, 1.08, 0.95);
      this.bodyPivot.position.y = 0;
      this.bodyPivot.rotation.set(isRising ? -0.2 : 0.15, 0, this.tiltZ);

      this.leftArmPivot.rotation.set(-1.2, 0, -0.6);
      this.rightArmPivot.rotation.set(-1.2, 0, 0.6);
      this.leftLegPivot.rotation.set(0.55, 0, -0.15);
      this.rightLegPivot.rotation.set(-0.35, 0, 0.15);
    } else {
      // Dynamic Sprinting Run Cycle
      const runAngle = this.animTime * 2.8;

      this.bodyPivot.scale.set(1, 1, 1);
      this.bodyPivot.position.y = Math.abs(Math.sin(runAngle)) * 0.08;
      this.bodyPivot.rotation.set(
        0.14 + Math.sin(runAngle) * 0.05, // Forward athletic run lean
        0,
        this.tiltZ
      );

      // Alternating Arm Swings
      this.leftArmPivot.rotation.set(Math.sin(runAngle) * 0.85, 0, -0.15);
      this.rightArmPivot.rotation.set(-Math.sin(runAngle) * 0.85, 0, 0.15);

      if (this.leftArmPivot.forearm) {
        this.leftArmPivot.forearm.rotation.x = -0.6 - Math.max(0, Math.sin(runAngle)) * 0.4;
      }
      if (this.rightArmPivot.forearm) {
        this.rightArmPivot.forearm.rotation.x = -0.6 - Math.max(0, -Math.sin(runAngle)) * 0.4;
      }

      // Alternating Leg Strides
      this.leftLegPivot.rotation.set(-Math.sin(runAngle) * 0.9, 0, 0);
      this.rightLegPivot.rotation.set(Math.sin(runAngle) * 0.9, 0, 0);

      if (this.leftLegPivot.lowerLeg) {
        this.leftLegPivot.lowerLeg.rotation.x = Math.max(0, -Math.sin(runAngle)) * 1.1;
      }
      if (this.rightLegPivot.lowerLeg) {
        this.rightLegPivot.lowerLeg.rotation.x = Math.max(0, Math.sin(runAngle)) * 1.1;
      }

      // Flowing sash flutter
      if (this.sashDrape) {
        this.sashDrape.rotation.x = 0.2 + Math.sin(runAngle * 2) * 0.25;
      }

      // Subtle Head Bobbing
      this.headPivot.rotation.x = Math.cos(runAngle) * 0.06;
    }
  }

  getBounds() {
    const height = this.isSliding ? 0.75 : 1.75;
    const width = 0.9;
    const depth = 1.0;

    return {
      minX: this.currentX - width / 2,
      maxX: this.currentX + width / 2,
      minY: this.posY,
      maxY: this.posY + height,
      minZ: this.mesh.position.z - depth / 2,
      maxZ: this.mesh.position.z + depth / 2,
      isSliding: this.isSliding,
      isJumping: !this.isGrounded && this.posY > 0.8
    };
  }

  reset() {
    this.currentLane = 0;
    this.targetX = 0;
    this.currentX = 0;
    this.posY = 0;
    this.velY = 0;
    this.isGrounded = true;
    this.isSliding = false;
    this.isDead = false;
    this.isVictory = false;
    this.mesh.position.set(0, 0, 0);
    this.mesh.rotation.set(0, 0, 0);
    this.bodyPivot.position.set(0, 0, 0);
    this.bodyPivot.rotation.set(0, 0, 0);
    this.bodyPivot.scale.set(1, 1, 1);
  }
}
