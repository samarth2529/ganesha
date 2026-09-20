// ===================================================================
// VIGHNAHARTA — MUSHAK (HERO CHARACTER)
// Fully articulated stylized-realistic divine mouse character
// with procedural skeletal-like animation state machine.
// ===================================================================

import * as THREE from 'three';

export class Mushak {
  constructor(shaderMaterials) {
    this.materials = shaderMaterials.materials;
    this.mesh = new THREE.Group();
    this.mesh.name = "Mushak";

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

    // Animation variables
    this.animTime = 0;
    this.runCycleSpeed = 16.0;
    this.tiltZ = 0;
    this.pitchX = 0;

    this.buildCharacterMesh();
  }

  buildCharacterMesh() {
    this.root = new THREE.Group();
    this.mesh.add(this.root);

    // Main Body Pivot (squash & stretch center)
    this.bodyPivot = new THREE.Group();
    this.root.add(this.bodyPivot);

    // 1. Torso
    const torsoGeo = new THREE.SphereGeometry(0.55, 18, 14);
    torsoGeo.scale(0.85, 0.75, 1.35); // Ellipsoidal cute plump body
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

    // 3. Sacred Crimson Saddle / Angavastram with Gold Trim (Form-Fitting, No Clipping)
    const saddleGeo = new THREE.SphereGeometry(0.558, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.36);
    saddleGeo.scale(0.86, 0.76, 0.85); // Matches torso ellipsoid contours perfectly
    this.saddle = new THREE.Mesh(saddleGeo, this.materials.crimsonCloth);
    this.saddle.position.set(0, 0.55, 0.04);
    this.saddle.castShadow = true;
    this.bodyPivot.add(this.saddle);

    // Golden border trim along the edge of the saddle
    const goldTrimGeo = new THREE.SphereGeometry(0.562, 24, 8, 0, Math.PI * 2, Math.PI * 0.32, Math.PI * 0.04);
    goldTrimGeo.scale(0.865, 0.765, 0.855);
    const goldTrim = new THREE.Mesh(goldTrimGeo, this.materials.divineGold);
    goldTrim.position.set(0, 0.55, 0.04);
    this.bodyPivot.add(goldTrim);

    // Sacred Golden Medallion / Lotus Emblem on top of saddle
    const medallionGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.02, 16);
    const medallion = new THREE.Mesh(medallionGeo, this.materials.divineGold);
    medallion.position.set(0, 0.97, 0.04);
    medallion.castShadow = true;
    this.bodyPivot.add(medallion);

    // Little Golden Bell on back/neck
    const bellGeo = new THREE.SphereGeometry(0.075, 12, 10);
    this.bell = new THREE.Mesh(bellGeo, this.materials.divineGold);
    this.bell.position.set(0, 0.76, 0.42);
    this.bell.castShadow = true;
    this.bodyPivot.add(this.bell);

    // 4. Head Group
    this.headPivot = new THREE.Group();
    this.headPivot.position.set(0, 0.75, 0.6);
    this.bodyPivot.add(this.headPivot);

    const headGeo = new THREE.SphereGeometry(0.38, 16, 14);
    headGeo.scale(0.85, 0.85, 1.1);
    this.head = new THREE.Mesh(headGeo, this.materials.mushakFur);
    this.head.castShadow = true;
    this.headPivot.add(this.head);

    // Snout / Muzzle
    const snoutGeo = new THREE.ConeGeometry(0.2, 0.38, 12);
    snoutGeo.rotateX(Math.PI / 2);
    this.snout = new THREE.Mesh(snoutGeo, this.materials.mushakBelly);
    this.snout.position.set(0, -0.05, 0.35);
    this.headPivot.add(this.snout);

    // Nose tip (glossy black/pink)
    const noseMat = new THREE.MeshStandardMaterial({ color: 0x2d1313, roughness: 0.2 });
    const noseGeo = new THREE.SphereGeometry(0.065, 10, 8);
    this.nose = new THREE.Mesh(noseGeo, noseMat);
    this.nose.position.set(0, 0.02, 0.54);
    this.headPivot.add(this.nose);

    // Whiskers (thin stylized whiskers)
    const whiskerMat = new THREE.LineBasicMaterial({ color: 0xefdcd0, transparent: true, opacity: 0.8 });
    this.whiskersGroup = new THREE.Group();
    for (let side = -1; side <= 1; side += 2) {
      for (let i = -1; i <= 1; i++) {
        const whiskerPoints = [
          new THREE.Vector3(side * 0.08, -0.02 + i * 0.03, 0.46),
          new THREE.Vector3(side * 0.38, -0.01 + i * 0.06, 0.52 + i * 0.04)
        ];
        const wGeo = new THREE.BufferGeometry().setFromPoints(whiskerPoints);
        const wLine = new THREE.Line(wGeo, whiskerMat);
        this.whiskersGroup.add(wLine);
      }
    }
    this.headPivot.add(this.whiskersGroup);

    // Expressive Eyes (Specular highlights + Golden divine ring)
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x110804,
      roughness: 0.1,
      metalness: 0.8
    });
    const eyeHighlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    for (let side = -1; side <= 1; side += 2) {
      const eyeGeo = new THREE.SphereGeometry(0.085, 12, 10);
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(side * 0.22, 0.12, 0.22);
      this.headPivot.add(eye);

      // Cute catchlight reflection
      const hlGeo = new THREE.SphereGeometry(0.028, 6, 6);
      const hl = new THREE.Mesh(hlGeo, eyeHighlightMat);
      hl.position.set(side * 0.25, 0.15, 0.28);
      this.headPivot.add(hl);
    }

    // Big expressive mouse ears with inner pink lining
    const earOuterMat = this.materials.mushakFur;
    const earInnerMat = new THREE.MeshStandardMaterial({ color: 0xf3a683, roughness: 0.6 });

    this.ears = [];
    for (let side = -1; side <= 1; side += 2) {
      const earPivot = new THREE.Group();
      earPivot.position.set(side * 0.28, 0.28, 0.05);

      const earOuterGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.03, 16);
      earOuterGeo.rotateZ(Math.PI / 2 * side);
      earOuterGeo.rotateY(0.2 * side);
      const earOuter = new THREE.Mesh(earOuterGeo, earOuterMat);
      earOuter.castShadow = true;
      earPivot.add(earOuter);

      const earInnerGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.035, 14);
      earInnerGeo.rotateZ(Math.PI / 2 * side);
      earInnerGeo.rotateY(0.2 * side);
      const earInner = new THREE.Mesh(earInnerGeo, earInnerMat);
      earPivot.add(earInner);

      this.headPivot.add(earPivot);
      this.ears.push(earPivot);
    }

    // 5. Front Paws with Golden Kadas
    this.frontLeftLeg = this.createPaw(-0.24, 0.35, 0.4, true);
    this.frontRightLeg = this.createPaw(0.24, 0.35, 0.4, true);
    this.bodyPivot.add(this.frontLeftLeg);
    this.bodyPivot.add(this.frontRightLeg);

    // 6. Hind Legs & Thighs with Golden Kadas
    this.backLeftLeg = this.createPaw(-0.35, 0.4, -0.32, false);
    this.backRightLeg = this.createPaw(0.35, 0.4, -0.32, false);
    this.bodyPivot.add(this.backLeftLeg);
    this.bodyPivot.add(this.backRightLeg);

    // 7. Multi-Joint Articulated Tail (5 chain links)
    this.tailJoints = [];
    let parentNode = this.bodyPivot;
    const tailSegCount = 5;
    const tailSegLength = 0.28;

    for (let i = 0; i < tailSegCount; i++) {
      const joint = new THREE.Group();
      if (i === 0) {
        joint.position.set(0, 0.35, -0.65);
      } else {
        joint.position.set(0, 0, -tailSegLength);
      }

      const radTop = 0.055 * (1 - i / tailSegCount * 0.7);
      const radBottom = 0.055 * (1 - (i + 1) / tailSegCount * 0.7);
      const segGeo = new THREE.CylinderGeometry(radBottom, radTop, tailSegLength, 8);
      segGeo.rotateX(Math.PI / 2);
      segGeo.translate(0, 0, -tailSegLength / 2);

      const segMesh = new THREE.Mesh(segGeo, this.materials.mushakBelly);
      segMesh.castShadow = true;
      joint.add(segMesh);

      parentNode.add(joint);
      this.tailJoints.push(joint);
      parentNode = joint;
    }
  }

  createPaw(x, y, z, isFront) {
    const legGroup = new THREE.Group();
    legGroup.position.set(x, y, z);

    // Thigh / upper arm
    const upperGeo = new THREE.CapsuleGeometry(isFront ? 0.09 : 0.16, 0.22, 8, 8);
    const upperMesh = new THREE.Mesh(upperGeo, this.materials.mushakFur);
    upperMesh.castShadow = true;
    legGroup.add(upperMesh);

    // Little cute paw
    const pawGeo = new THREE.SphereGeometry(isFront ? 0.08 : 0.11, 10, 8);
    pawGeo.scale(1, 0.5, 1.4);
    const pawMesh = new THREE.Mesh(pawGeo, this.materials.mushakBelly);
    pawMesh.position.set(0, -0.22, 0.08);
    pawMesh.castShadow = true;
    legGroup.add(pawMesh);

    // Tiny Golden Kada (Bangle) on ankle
    const kadaGeo = new THREE.TorusGeometry(isFront ? 0.075 : 0.11, 0.02, 6, 12);
    kadaGeo.rotateX(Math.PI / 2);
    const kada = new THREE.Mesh(kadaGeo, this.materials.divineGold);
    kada.position.set(0, -0.16, 0.02);
    legGroup.add(kada);

    return legGroup;
  }

  // --- Input Handlers ---

  changeLane(direction) {
    if (this.isDead || this.isVictory) return false;
    if (direction === 'LEFT' && this.currentLane > -1) {
      this.currentLane--;
      this.targetX = this.currentLane * this.laneWidth; // Left is -X (-3.2)
      return true;
    } else if (direction === 'RIGHT' && this.currentLane < 1) {
      this.currentLane++;
      this.targetX = this.currentLane * this.laneWidth; // Right is +X (+3.2)
      return true;
    }
    return false;
  }

  jump() {
    if (this.isDead || this.isVictory) return false;
    if (this.isGrounded) {
      this.velY = this.jumpStrength;
      this.isGrounded = false;
      this.isSliding = false; // Cancels slide on jump
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
      // Fast drop downwards
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

  // --- Frame Update & Procedural Animation ---

  update(delta, runnerSpeed) {
    this.animTime += delta * (this.isVictory ? 3.0 : (runnerSpeed * 0.8));

    // 1. Snappy & Responsive Lane Shift Interpolation
    const lerpSpeed = 28.0;
    this.currentX += (this.targetX - this.currentX) * Math.min(1.0, delta * lerpSpeed);
    this.mesh.position.x = this.currentX;

    // Banking Lean based on lane shifting velocity (leans into the turn)
    const laneDelta = this.targetX - this.currentX;
    this.tiltZ = laneDelta * 0.08;

    // 2. Vertical Physics (Jump / Fall)
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

    // 4. Procedural Character Animation States
    if (this.isDead) {
      // Stumble / tumble backward
      this.bodyPivot.rotation.x += delta * 8.0;
      this.bodyPivot.position.y = Math.max(0.2, this.bodyPivot.position.y - delta * 2.0);
    } else if (this.isVictory) {
      // Divine Namaskar & Respectful Bow
      this.mesh.rotation.y = 0;
      this.bodyPivot.scale.set(1, 1, 1);
      this.bodyPivot.position.set(0, 0, 0);
      this.bodyPivot.rotation.set(0.25, 0, 0); // Gentle bow
      this.headPivot.rotation.set(-0.25 + Math.sin(this.animTime * 2) * 0.05, 0, 0);
      // Gentle tail wag
      this.tailJoints.forEach((j, idx) => {
        j.rotation.y = Math.sin(this.animTime * 4 + idx * 0.5) * 0.2;
      });
    } else if (this.isSliding) {
      // Low Profile Skid Pose
      this.bodyPivot.scale.set(1.2, 0.45, 1.3);
      this.bodyPivot.position.y = -0.15;
      this.bodyPivot.rotation.set(-0.15, 0, this.tiltZ);
      this.headPivot.rotation.set(-0.2, 0, 0);

      this.frontLeftLeg.position.z = 0.6;
      this.frontRightLeg.position.z = 0.6;
      this.backLeftLeg.position.z = -0.55;
      this.backRightLeg.position.z = -0.55;

      // Tail drags along the floor
      this.tailJoints.forEach((j, idx) => {
        j.rotation.x = -0.15;
        j.rotation.y = Math.sin(this.animTime * 12 + idx) * 0.15;
      });
    } else if (!this.isGrounded) {
      // Jump Pose (Spring arc)
      const isRising = this.velY > 0;
      this.bodyPivot.scale.set(0.9, 1.15, 0.95);
      this.bodyPivot.position.y = 0;
      this.bodyPivot.rotation.set(isRising ? -0.3 : 0.2, 0, this.tiltZ);

      // Paws tuck in during jump
      this.frontLeftLeg.position.y = 0.48;
      this.frontRightLeg.position.y = 0.48;
      this.backLeftLeg.position.y = 0.45;
      this.backRightLeg.position.y = 0.45;

      // Tail arches gracefully
      this.tailJoints.forEach((j, idx) => {
        j.rotation.x = -0.3 + idx * 0.08;
        j.rotation.y = 0;
      });
    } else {
      // Energetic Running Gallop Cycle
      this.bodyPivot.scale.set(1, 1, 1);
      this.bodyPivot.position.y = Math.abs(Math.sin(this.animTime * 2)) * 0.12;
      this.bodyPivot.rotation.set(
        Math.sin(this.animTime * 2) * 0.08,
        0,
        this.tiltZ
      );

      // Head bobbing & whiskers twitch
      this.headPivot.rotation.x = Math.cos(this.animTime * 2) * 0.08;
      this.whiskersGroup.rotation.z = Math.sin(this.animTime * 10) * 0.05;

      // Ear bounce
      this.ears[0].rotation.z = Math.sin(this.animTime * 2) * 0.15;
      this.ears[1].rotation.z = -Math.sin(this.animTime * 2) * 0.15;

      // Dynamic Four-Legged Sprint Cycle
      const runAngle = this.animTime * 2;
      this.frontLeftLeg.position.z = 0.4 + Math.sin(runAngle) * 0.28;
      this.frontLeftLeg.position.y = 0.35 + Math.max(0, Math.cos(runAngle)) * 0.15;

      this.frontRightLeg.position.z = 0.4 - Math.sin(runAngle) * 0.28;
      this.frontRightLeg.position.y = 0.35 + Math.max(0, -Math.cos(runAngle)) * 0.15;

      this.backLeftLeg.position.z = -0.32 - Math.sin(runAngle) * 0.32;
      this.backLeftLeg.position.y = 0.4 + Math.max(0, -Math.cos(runAngle)) * 0.18;

      this.backRightLeg.position.z = -0.32 + Math.sin(runAngle) * 0.32;
      this.backRightLeg.position.y = 0.4 + Math.max(0, Math.cos(runAngle)) * 0.18;

      // Bell subtle jingle
      this.bell.rotation.z = Math.sin(runAngle * 2) * 0.3;

      // Tail sinusoidal whip wave
      this.tailJoints.forEach((j, idx) => {
        j.rotation.y = Math.sin(runAngle - idx * 0.8) * 0.35;
        j.rotation.x = 0.15 + Math.cos(runAngle - idx * 0.5) * 0.15;
      });
    }
  }

  // Bounding Box / Collision volume
  getBounds() {
    const height = this.isSliding ? 0.65 : 1.35;
    const width = 1.0;
    const depth = 1.2;

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
