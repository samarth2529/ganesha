// ===================================================================
// VIGHNAHARTA — SACRED TEMPLE RUNNER TRACK & PUSHKARINI CANALS
// Royal Stone Causeway, Side Waterways with Blooming Lotuses & Lily Pads,
// Stepped Sandstone Ghats, Ornate Balustrades, Banyan Trees, and Toranas.
// 100% Recycled & Object-Pooled for 60 FPS performance.
// ===================================================================

import * as THREE from 'three';
import { ObstacleFactory } from '../entities/Obstacles.js';
import { CollectibleFactory } from '../entities/Collectibles.js';
import { InteractableFactory } from '../entities/Interactables.js';
import { Temple } from '../entities/Temple.js';

export class TrackManager {
  constructor(scene, shaderMaterials) {
    this.scene = scene;
    this.materials = shaderMaterials.materials;
    this.textures = shaderMaterials.textures;
    this.obstacleFactory = new ObstacleFactory(shaderMaterials);
    this.collectibleFactory = new CollectibleFactory(shaderMaterials);
    this.interactableFactory = new InteractableFactory(shaderMaterials);

    this.segmentLength = 45.0;
    this.visibleSegments = 6;
    this.segments = [];
    this.spawnZ = 0;

    this.climaxTriggerDistance = 1500; // Grand Destination at 1500m

    // Instantiate 3D Hero Temple & load immediately on start so it's visible on horizon!
    this.heroTemple = new Temple(shaderMaterials, this.climaxTriggerDistance);
    this.scene.add(this.heroTemple.group);
    this.heroTemple.loadIfNeeded();

    // Pools
    this.obstaclePool = [];
    this.starPool = [];
    this.activeObstacles = [];
    this.activeStars = [];
    this.interactables = [];

    this.initInteractables();
    this.initPools();
    this.initTrack();
  }

  initInteractables() {
    // 5 Fixed Sacred Landmarks along the pilgrimage path
    // Task 2: Vighna 1 (Z = 280)
    const vighna1 = this.interactableFactory.createVighna(1, 280);
    this.scene.add(vighna1);
    this.interactables.push(vighna1);

    // Task 4: Festival Shrine (Z = 550)
    const shrine1 = this.interactableFactory.createFestivalShrine('SHRINE_1', 550);
    this.scene.add(shrine1);
    this.interactables.push(shrine1);

    // Task 6: Vighna 2 (Z = 920)
    const vighna2 = this.interactableFactory.createVighna(2, 920);
    this.scene.add(vighna2);
    this.interactables.push(vighna2);

    // Task 8: Temple Bell (Z = 1150)
    const bell1 = this.interactableFactory.createTempleBell('BELL_1', 1150);
    this.scene.add(bell1);
    this.interactables.push(bell1);

    // Task 9: Vighna 3 (Z = 1320)
    const vighna3 = this.interactableFactory.createVighna(3, 1320);
    this.scene.add(vighna3);
    this.interactables.push(vighna3);
  }

  initPools() {
    // 1. Fixed Obstacle Pool (16 items)
    const types = ['LOW', 'HIGH', 'SOLID', 'LOW_URLI'];
    for (let i = 0; i < 16; i++) {
      const type = types[i % types.length];
      let obs;
      if (type === 'LOW') {
        obs = this.obstacleFactory.createLowCart();
      } else if (type === 'HIGH') {
        obs = this.obstacleFactory.createHighStall();
      } else if (type === 'LOW_URLI') {
        obs = this.obstacleFactory.createLotusUrli();
      } else {
        obs = this.obstacleFactory.createSolidPillar();
      }
      obs.visible = false;
      obs.frustumCulled = true;
      obs.nearMissChecked = false;
      obs.hasHit = false;
      this.scene.add(obs);
      this.obstaclePool.push(obs);
    }

    // 2. Fixed Collectible Pools (Stars)
    this.starPool = [];
    this.activeCollectibles = [];

    // Stars (36 items)
    for (let i = 0; i < 36; i++) {
      const star = this.collectibleFactory.createStar(0, 1.2, 0);
      star.visible = false;
      star.frustumCulled = true;
      star.isCollected = false;
      this.scene.add(star);
      this.starPool.push(star);
    }
  }

  getBiomeForZ(z) {
    if (z < 350) return 'VALLEY';
    if (z < 750) return 'FOOTHILLS';
    if (z < 1200) return 'HIMALAYAN_SNOW';
    return 'TEMPLE_APPROACH';
  }

  createModularSegmentMesh(segIndex, startZ = 0) {
    const biome = this.getBiomeForZ(startZ);
    const len = this.segmentLength;

    if (biome === 'HIMALAYAN_SNOW') {
      return this.createSnowSegment(segIndex, len);
    } else if (biome === 'FOOTHILLS') {
      return this.createFoothillsSegment(segIndex, len);
    } else if (biome === 'TEMPLE_APPROACH') {
      return this.createTempleApproachSegment(segIndex, len);
    } else {
      return this.createValleySegment(segIndex, len);
    }
  }

  // -------------------------------------------------------------
  // BIOME 1: FESTIVAL VALLEY (0m - 350m)
  // -------------------------------------------------------------
  createValleySegment(segIndex, len) {
    const group = new THREE.Group();

    // Central Royal Causeway (Width 11m, 3 Running Lanes)
    const causewayGeo = new THREE.PlaneGeometry(11, len);
    causewayGeo.rotateX(-Math.PI / 2);
    const causeway = new THREE.Mesh(causewayGeo, this.materials.templeFloor);
    causeway.position.set(0, 0, len / 2);
    causeway.receiveShadow = true;
    causeway.frustumCulled = true;
    group.add(causeway);

    // Sacred Lotus Rangoli Medallion along center lane
    const rangoliGeo = new THREE.PlaneGeometry(4.2, 4.2);
    rangoliGeo.rotateX(-Math.PI / 2);
    const rangoli = new THREE.Mesh(rangoliGeo, this.materials.rangoli);
    rangoli.position.set(0, 0.02, len / 2);
    rangoli.receiveShadow = true;
    group.add(rangoli);

    // Ornate Carved Stone Balustrades & Diya Lamps (X = ±5.4m)
    const railMat = this.materials.stoneRailing || this.materials.sandstone;
    for (let side = -1; side <= 1; side += 2) {
      const railX = side * 5.4;

      const plinthGeo = new THREE.BoxGeometry(0.35, 0.45, len);
      const plinth = new THREE.Mesh(plinthGeo, railMat);
      plinth.position.set(railX, 0.22, len / 2);
      plinth.receiveShadow = true;
      group.add(plinth);

      const topRailGeo = new THREE.BoxGeometry(0.25, 0.12, len);
      const topRail = new THREE.Mesh(topRailGeo, this.materials.divineGold);
      topRail.position.set(railX, 0.65, len / 2);
      topRail.receiveShadow = true;
      group.add(topRail);

      for (let pZ = 5.0; pZ < len; pZ += 10.0) {
        const postGeo = new THREE.CylinderGeometry(0.2, 0.24, 0.85, 6);
        const post = new THREE.Mesh(postGeo, railMat);
        post.position.set(railX, 0.42, pZ);
        group.add(post);

        const diya = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.1, 0.12, 6), this.materials.templeBrass);
        diya.position.set(railX, 0.9, pZ);
        group.add(diya);

        const flame = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 5), this.materials.diyaFlame);
        flame.position.set(railX, 1.02, pZ);
        group.add(flame);
      }
    }

    // Sacred Lotus Water Canals / Pushkarini (X = ±5.8m to ±16.0m)
    const waterWidth = 10.5;
    const waterGeo = new THREE.PlaneGeometry(waterWidth, len);
    waterGeo.rotateX(-Math.PI / 2);

    for (let side = -1; side <= 1; side += 2) {
      const canalCenterX = side * (5.5 + waterWidth / 2);

      const water = new THREE.Mesh(waterGeo, this.materials.sacredWater);
      water.position.set(canalCenterX, -0.55, len / 2);
      water.receiveShadow = true;
      group.add(water);

      for (let step = 1; step <= 3; step++) {
        const stepWidth = 0.5;
        const stepGeo = new THREE.BoxGeometry(stepWidth, 0.2, len);
        const stepMesh = new THREE.Mesh(stepGeo, this.materials.sandstone);
        stepMesh.position.set(side * (5.5 + (step - 0.5) * stepWidth), -step * 0.18, len / 2);
        stepMesh.receiveShadow = true;
        group.add(stepMesh);
      }

      for (let l = 0; l < 3; l++) {
        const lotus = this.createFloatingLotus();
        const lX = canalCenterX + ((l % 2 === 0 ? -1 : 1) * (1.6 + (l * 1.4) % 2.8));
        const lZ = 6.0 + l * 14.0;
        lotus.position.set(lX, -0.54, lZ);
        lotus.rotation.y = l * 1.9 + side;
        group.add(lotus);
      }
    }

    // Outer Festival Terraces & Plazas (X = ±16.0m to ±32.0m)
    const plazaWidth = 16.0;
    const plazaGeo = new THREE.PlaneGeometry(plazaWidth, len);
    plazaGeo.rotateX(-Math.PI / 2);

    for (let side = -1; side <= 1; side += 2) {
      const plazaCenterX = side * (16.0 + plazaWidth / 2);
      const plaza = new THREE.Mesh(plazaGeo, this.materials.valleyTerrain || this.materials.sandstone);
      plaza.position.set(plazaCenterX, 0, len / 2);
      plaza.receiveShadow = true;
      group.add(plaza);

      // Sacred Festival Homa Flaming Urns
      for (let bZ = 8.0; bZ < len; bZ += 15.0) {
        const brazier = this.createBrazierUrn();
        brazier.position.set(side * 17.5, 0, bZ);
        group.add(brazier);
      }

      // Sacred Banyan & Neem Trees with lush foliage
      const tree = this.createBanyanTree();
      tree.position.set(side * 24.0, 0, 20.0);
      group.add(tree);

      // Carved Sandstone Boundary Wall
      const wallH = 10.0;
      const wallGeo = new THREE.BoxGeometry(2.0, wallH, len);
      const wall = new THREE.Mesh(wallGeo, this.materials.sandstone);
      wall.position.set(side * 32.5, wallH / 2, len / 2);
      wall.receiveShadow = true;
      group.add(wall);

      // Decorative Golden Wall Coping
      const copingGeo = new THREE.BoxGeometry(2.4, 0.4, len);
      const coping = new THREE.Mesh(copingGeo, this.materials.divineGold);
      coping.position.set(side * 32.5, wallH + 0.2, len / 2);
      group.add(coping);
    }

    if (segIndex % 2 === 1) {
      const toranaArch = this.createGrandToranaArch();
      toranaArch.position.set(0, 0, len / 2);
      group.add(toranaArch);
    }

    return group;
  }

  // -------------------------------------------------------------
  // BIOME 2: DEODAR FOOTHILLS (350m - 750m)
  // -------------------------------------------------------------
  createFoothillsSegment(segIndex, len) {
    const group = new THREE.Group();

    // Central Stone Viaduct Causeway
    const causewayGeo = new THREE.PlaneGeometry(11, len);
    causewayGeo.rotateX(-Math.PI / 2);
    const causeway = new THREE.Mesh(causewayGeo, this.materials.frostedStone || this.materials.templeFloor);
    causeway.position.set(0, 0, len / 2);
    causeway.receiveShadow = true;
    group.add(causeway);

    // Light Frost Trim on Edges
    for (let side = -1; side <= 1; side += 2) {
      const curbGeo = new THREE.BoxGeometry(0.6, 0.15, len);
      const curb = new THREE.Mesh(curbGeo, this.materials.himalayanSnow);
      curb.position.set(side * 5.2, 0.08, len / 2);
      group.add(curb);
    }

    // Balustrades with Glowing Diyas
    for (let side = -1; side <= 1; side += 2) {
      const railX = side * 5.4;
      const plinthGeo = new THREE.BoxGeometry(0.35, 0.45, len);
      const plinth = new THREE.Mesh(plinthGeo, this.materials.frostedStone || this.materials.sandstone);
      plinth.position.set(railX, 0.22, len / 2);
      group.add(plinth);

      const topRailGeo = new THREE.BoxGeometry(0.25, 0.12, len);
      const topRail = new THREE.Mesh(topRailGeo, this.materials.divineGold);
      topRail.position.set(railX, 0.65, len / 2);
      group.add(topRail);

      for (let pZ = 5.0; pZ < len; pZ += 10.0) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.85, 6), this.materials.frostedStone || this.materials.sandstone);
        post.position.set(railX, 0.42, pZ);
        group.add(post);

        const diya = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.1, 0.12, 6), this.materials.templeBrass);
        diya.position.set(railX, 0.9, pZ);
        group.add(diya);

        const flame = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 5), this.materials.diyaFlame);
        flame.position.set(railX, 1.02, pZ);
        group.add(flame);
      }
    }

    // Mountain Stream Rapids Canals
    const waterWidth = 10.5;
    const waterGeo = new THREE.PlaneGeometry(waterWidth, len);
    waterGeo.rotateX(-Math.PI / 2);

    for (let side = -1; side <= 1; side += 2) {
      const canalCenterX = side * (5.5 + waterWidth / 2);
      const water = new THREE.Mesh(waterGeo, this.materials.sacredWater);
      water.position.set(canalCenterX, -0.6, len / 2);
      group.add(water);

      // River Rocks in stream
      for (let r = 0; r < 4; r++) {
        const rockGeo = new THREE.DodecahedronGeometry(0.6 + (r % 2) * 0.4);
        const rock = new THREE.Mesh(rockGeo, this.materials.frostedStone || this.materials.cliffStone);
        rock.position.set(canalCenterX + (r % 2 === 0 ? -1.8 : 1.8), -0.4, 6.0 + r * 11.0);
        group.add(rock);
      }
    }

    // Outer Mountain Terraces with Himalayan Deodar Pines
    const plazaWidth = 16.0;
    const plazaGeo = new THREE.PlaneGeometry(plazaWidth, len);
    plazaGeo.rotateX(-Math.PI / 2);

    for (let side = -1; side <= 1; side += 2) {
      const plazaCenterX = side * (16.0 + plazaWidth / 2);
      const plaza = new THREE.Mesh(plazaGeo, this.materials.valleyTerrain || this.materials.sandstone);
      plaza.position.set(plazaCenterX, 0, len / 2);
      plaza.receiveShadow = true;
      group.add(plaza);

      // Himalayan Deodar Pines
      const pine = this.createDeodarPineTree(false);
      pine.position.set(side * 24.0, 0, 20.0);
      group.add(pine);

      // Mountain Stone Cliff Wall
      const cliffGeo = new THREE.BoxGeometry(2.0, 12.0, len);
      const cliff = new THREE.Mesh(cliffGeo, this.materials.cliffStone || this.materials.sandstone);
      cliff.position.set(side * 32.5, 6.0, len / 2);
      cliff.receiveShadow = true;
      group.add(cliff);
    }

    if (segIndex % 2 === 1) {
      const arch = this.createGrandToranaArch();
      arch.position.set(0, 0, len / 2);
      group.add(arch);
    }

    return group;
  }

  // -------------------------------------------------------------
  // BIOME 3: HIMALAYAN SNOW PASSAGE (750m - 1200m)
  // -------------------------------------------------------------
  createSnowSegment(segIndex, len) {
    const group = new THREE.Group();

    // 1. Central Frosted Sandstone Causeway
    const causewayGeo = new THREE.PlaneGeometry(11, len);
    causewayGeo.rotateX(-Math.PI / 2);
    const causeway = new THREE.Mesh(causewayGeo, this.materials.frostedStone || this.materials.templeFloor);
    causeway.position.set(0, 0, len / 2);
    causeway.receiveShadow = true;
    group.add(causeway);

    // Sacred Snow Lotus Mandala Medallion (Polygonal Offset)
    const snowMedallionGeo = new THREE.PlaneGeometry(4.2, 4.2);
    snowMedallionGeo.rotateX(-Math.PI / 2);
    const snowMedallion = new THREE.Mesh(snowMedallionGeo, this.materials.rangoli);
    snowMedallion.position.set(0, 0.02, len / 2);
    group.add(snowMedallion);

    // Deep Snow Blanket Drifts on Edges of Runway
    for (let side = -1; side <= 1; side += 2) {
      const driftGeo = new THREE.BoxGeometry(0.8, 0.25, len);
      const drift = new THREE.Mesh(driftGeo, this.materials.himalayanSnow);
      drift.position.set(side * 5.0, 0.12, len / 2);
      drift.receiveShadow = true;
      group.add(drift);
    }

    // 2. Frost-Rimmed Balustrades with Warm Glowing Brass Diyas
    for (let side = -1; side <= 1; side += 2) {
      const railX = side * 5.4;

      // Frosted Stone Plinth
      const plinthGeo = new THREE.BoxGeometry(0.35, 0.45, len);
      const plinth = new THREE.Mesh(plinthGeo, this.materials.frostedStone || this.materials.stoneRailing);
      plinth.position.set(railX, 0.22, len / 2);
      group.add(plinth);

      // Gold-Trimmed Railing Top Bar
      const topRailGeo = new THREE.BoxGeometry(0.25, 0.12, len);
      const topRail = new THREE.Mesh(topRailGeo, this.materials.divineGold);
      topRail.position.set(railX, 0.65, len / 2);
      group.add(topRail);

      // Balustrade Posts & Glowing Diya Lamps
      for (let pZ = 5.0; pZ < len; pZ += 10.0) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.85, 6), this.materials.frostedStone || this.materials.sandstone);
        post.position.set(railX, 0.42, pZ);
        group.add(post);

        // Snow Cap on top of post
        const snowCap = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.12, 6), this.materials.himalayanSnow);
        snowCap.position.set(railX, 0.86, pZ);
        group.add(snowCap);

        const diya = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.1, 0.12, 6), this.materials.templeBrass);
        diya.position.set(railX, 0.94, pZ);
        group.add(diya);

        const flame = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 5), this.materials.diyaFlame);
        flame.position.set(railX, 1.07, pZ);
        group.add(flame);
      }
    }

    // 3. Crystalline Frozen Ice Canals & Glacial Rapids
    const waterWidth = 10.5;
    const iceGeo = new THREE.PlaneGeometry(waterWidth, len);
    iceGeo.rotateX(-Math.PI / 2);

    for (let side = -1; side <= 1; side += 2) {
      const canalCenterX = side * (5.5 + waterWidth / 2);

      // Translucent Frozen Ice Surface
      const iceMesh = new THREE.Mesh(iceGeo, this.materials.frozenIce || this.materials.sacredWater);
      iceMesh.position.set(canalCenterX, -0.5, len / 2);
      group.add(iceMesh);

      // Stepped Frosted Ghats
      for (let step = 1; step <= 3; step++) {
        const stepWidth = 0.5;
        const stepGeo = new THREE.BoxGeometry(stepWidth, 0.2, len);
        const stepMesh = new THREE.Mesh(stepGeo, this.materials.frostedStone);
        stepMesh.position.set(side * (5.5 + (step - 0.5) * stepWidth), -step * 0.18, len / 2);
        group.add(stepMesh);
      }

      // Ice Crystals & Frost Rocks in frozen canal
      for (let c = 0; c < 3; c++) {
        const crystalGeo = new THREE.ConeGeometry(0.4 + (c % 2) * 0.2, 1.2 + (c % 2) * 0.5, 5);
        const crystal = new THREE.Mesh(crystalGeo, this.materials.frozenIce);
        crystal.position.set(canalCenterX + (c % 2 === 0 ? -1.5 : 1.5), 0.1, 8.0 + c * 14.0);
        crystal.rotation.z = (c % 2 === 0 ? 0.2 : -0.2);
        group.add(crystal);
      }
    }

    // 4. Outer Pristine Himalayan Snow Blanket Terraces & Snow Deodars
    const terraceWidth = 16.0;
    const snowTerraceGeo = new THREE.PlaneGeometry(terraceWidth, len);
    snowTerraceGeo.rotateX(-Math.PI / 2);

    for (let side = -1; side <= 1; side += 2) {
      const terraceCenterX = side * (16.0 + terraceWidth / 2);

      const terrace = new THREE.Mesh(snowTerraceGeo, this.materials.himalayanSnow);
      terrace.position.set(terraceCenterX, 0, len / 2);
      terrace.receiveShadow = true;
      group.add(terrace);

      // Sacred Snow Homa Fire Kund / Flaming Urn
      for (let bZ = 12.0; bZ < len; bZ += 20.0) {
        const brazier = this.createSnowBrazierUrn();
        brazier.position.set(side * 17.5, 0, bZ);
        group.add(brazier);
      }

      // Snow-Laden Himalayan Deodar Pine Trees
      const snowPine = this.createDeodarPineTree(true);
      snowPine.position.set(side * 24.5, 0, 22.0);
      group.add(snowPine);
    }

    // 5. Himalayan Snow Cliff Boundary Walls & Frozen Waterfalls
    const cliffH = 14.0;
    const cliffGeo = new THREE.BoxGeometry(2.0, cliffH, len);

    for (let side = -1; side <= 1; side += 2) {
      const cliff = new THREE.Mesh(cliffGeo, this.materials.cliffStone || this.materials.sandstone);
      cliff.position.set(side * 32.5, cliffH / 2, len / 2);
      cliff.receiveShadow = true;
      group.add(cliff);

      // Snow Cap along top of cliff
      const snowTopGeo = new THREE.BoxGeometry(3.0, 0.6, len);
      const snowTop = new THREE.Mesh(snowTopGeo, this.materials.himalayanSnow);
      snowTop.position.set(side * 32.5, cliffH + 0.3, len / 2);
      group.add(snowTop);

      // Frozen Ice Waterfall cascading down cliff
      const wfGeo = new THREE.PlaneGeometry(3.5, cliffH - 2);
      wfGeo.rotateY(side === 1 ? -Math.PI / 2 : Math.PI / 2);
      const wf = new THREE.Mesh(wfGeo, this.materials.frozenWaterfall || this.materials.frozenIce);
      wf.position.set(side * 31.4, (cliffH - 2) / 2 + 1.0, len / 2);
      group.add(wf);
    }

    // 6. Snow-Dusted Himalayan Torana Gateway Arch
    if (segIndex % 2 === 1) {
      const snowTorana = this.createSnowToranaArch();
      snowTorana.position.set(0, 0, len / 2);
      group.add(snowTorana);
    }

    return group;
  }

  // -------------------------------------------------------------
  // BIOME 4: GOLDEN TEMPLE APPROACH (1200m - 1500m)
  // -------------------------------------------------------------
  createTempleApproachSegment(segIndex, len) {
    const group = new THREE.Group();

    // Royal Dravidian Temple Paving
    const causewayGeo = new THREE.PlaneGeometry(11, len);
    causewayGeo.rotateX(-Math.PI / 2);
    const causeway = new THREE.Mesh(causewayGeo, this.materials.dravidianStone || this.materials.templeFloor);
    causeway.position.set(0, 0, len / 2);
    causeway.receiveShadow = true;
    group.add(causeway);

    // Glowing Golden Lotus Rangoli
    const rangoliGeo = new THREE.PlaneGeometry(4.8, 4.8);
    rangoliGeo.rotateX(-Math.PI / 2);
    const rangoli = new THREE.Mesh(rangoliGeo, this.materials.rangoli);
    rangoli.position.set(0, 0.02, len / 2);
    group.add(rangoli);

    // Royal Dravidian Carved Railing with Elephant Moldings & Golden Diyas
    for (let side = -1; side <= 1; side += 2) {
      const railX = side * 5.4;

      const plinthGeo = new THREE.BoxGeometry(0.4, 0.5, len);
      const plinth = new THREE.Mesh(plinthGeo, this.materials.adhisthanaBase || this.materials.sandstone);
      plinth.position.set(railX, 0.25, len / 2);
      group.add(plinth);

      const topRailGeo = new THREE.BoxGeometry(0.3, 0.15, len);
      const topRail = new THREE.Mesh(topRailGeo, this.materials.divineGold);
      topRail.position.set(railX, 0.72, len / 2);
      group.add(topRail);

      for (let pZ = 4.0; pZ < len; pZ += 8.0) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.95, 8), this.materials.dravidianStone || this.materials.sandstone);
        post.position.set(railX, 0.48, pZ);
        group.add(post);

        const diya = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.12, 0.15, 8), this.materials.divineGold);
        diya.position.set(railX, 1.02, pZ);
        group.add(diya);

        const flame = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.25, 6), this.materials.diyaFlame);
        flame.position.set(railX, 1.18, pZ);
        group.add(flame);
      }
    }

    // Sacred Pushkarini Water Canals
    const waterWidth = 10.5;
    const waterGeo = new THREE.PlaneGeometry(waterWidth, len);
    waterGeo.rotateX(-Math.PI / 2);

    for (let side = -1; side <= 1; side += 2) {
      const canalCenterX = side * (5.5 + waterWidth / 2);
      const water = new THREE.Mesh(waterGeo, this.materials.sacredWater);
      water.position.set(canalCenterX, -0.55, len / 2);
      group.add(water);

      for (let l = 0; l < 3; l++) {
        const lotus = this.createFloatingLotus();
        lotus.position.set(canalCenterX + ((l % 2 === 0 ? -1 : 1) * 2.0), -0.54, 6.0 + l * 14.0);
        group.add(lotus);
      }
    }

    // Authentic Royal Dravidian Temple Pillared Mandapa Colonnades along both flanks
    for (let side = -1; side <= 1; side += 2) {
      const mandapa = this.createTempleMandapaColonnade(side, len, 'TEMPLE_APPROACH');
      group.add(mandapa);
    }

    if (segIndex % 2 === 1) {
      const toranaArch = this.createGrandToranaArch();
      toranaArch.position.set(0, 0, len / 2);
      group.add(toranaArch);
    }

    return group;
  }

  // Helper: Himalayan Deodar Pine Tree (With optional Snow Caps)
  createDeodarPineTree(withSnow = false) {
    const group = new THREE.Group();

    // Tall Straight Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.6, 6.0, 6);
    const trunk = new THREE.Mesh(trunkGeo, this.materials.treeBark || this.materials.sandstone);
    trunk.position.y = 3.0;
    group.add(trunk);

    // Multi-Tiered Conical Pine Foliage Tiers
    const tiers = 4;
    const needleMat = this.materials.himalayanPine || this.materials.treeFoliage;

    for (let t = 0; t < tiers; t++) {
      const tierH = 2.4 - t * 0.2;
      const tierRadius = 3.0 - t * 0.6;
      const tierY = 4.0 + t * 1.8;

      const coneGeo = new THREE.ConeGeometry(tierRadius, tierH, 7);
      const cone = new THREE.Mesh(coneGeo, needleMat);
      cone.position.y = tierY;
      group.add(cone);

      if (withSnow) {
        // Pure White Snow Cap over Pine Tier
        const snowCapGeo = new THREE.ConeGeometry(tierRadius * 0.9, tierH * 0.45, 7);
        const snowCap = new THREE.Mesh(snowCapGeo, this.materials.himalayanSnow);
        snowCap.position.y = tierY + tierH * 0.35;
        group.add(snowCap);
      }
    }

    return group;
  }

  // Helper: Snow-Dusted Grand Torana Arch
  createSnowToranaArch() {
    const group = new THREE.Group();
    const archH = 8.5;
    const spanW = 12.0;
    const stoneMat = this.materials.frostedStone || this.materials.sandstone;

    for (let side = -1; side <= 1; side += 2) {
      const pBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 1.6), stoneMat);
      pBase.position.set(side * (spanW / 2), 0.6, 0);
      group.add(pBase);

      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, archH, 8), stoneMat);
      col.position.set(side * (spanW / 2), archH / 2 + 1.2, 0);
      group.add(col);

      const cap = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 1.4), this.materials.divineGold);
      cap.position.set(side * (spanW / 2), archH + 1.2, 0);
      group.add(cap);

      // Snow atop pillar cap
      const sCap = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.2, 1.5), this.materials.himalayanSnow);
      sCap.position.set(side * (spanW / 2), archH + 1.5, 0);
      group.add(sCap);
    }

    const beamGeo = new THREE.BoxGeometry(spanW + 2.4, 0.9, 1.4);
    const beam = new THREE.Mesh(beamGeo, stoneMat);
    beam.position.set(0, archH + 1.8, 0);
    group.add(beam);

    // Snow blanket on top of arch beam
    const sBeamGeo = new THREE.BoxGeometry(spanW + 2.4, 0.3, 1.5);
    const sBeam = new THREE.Mesh(sBeamGeo, this.materials.himalayanSnow);
    sBeam.position.set(0, archH + 2.35, 0);
    group.add(sBeam);

    const crestGeo = new THREE.ConeGeometry(0.8, 1.6, 6);
    const crest = new THREE.Mesh(crestGeo, this.materials.divineGold);
    crest.position.set(0, archH + 3.0, 0);
    group.add(crest);

    // Warm hanging brass bells under snow Torana
    for (let b = -2; b <= 2; b++) {
      const bell = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), this.materials.divineGold);
      bell.position.set(b * 2.2, archH + 1.0, 0);
      group.add(bell);
    }

    return group;
  }

  // Helper: Snow Brazier with Warm Sacred Fire
  createSnowBrazierUrn() {
    const group = new THREE.Group();
    const stoneMat = this.materials.frostedStone || this.materials.sandstone;

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, 0.4, 6), stoneMat);
    base.position.y = 0.2;
    group.add(base);

    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 1.4, 6), this.materials.templeBrass);
    col.position.y = 1.1;
    group.add(col);

    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.35, 0.5, 8), this.materials.templeBrass);
    bowl.position.y = 2.0;
    group.add(bowl);

    // Snow rim around brazier bowl
    const snowRim = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.08, 6, 12), this.materials.himalayanSnow);
    snowRim.rotation.x = Math.PI / 2;
    snowRim.position.y = 2.22;
    group.add(snowRim);

    // Radiant Homa Kund Flame
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.95, 6), this.materials.diyaFlame);
    flame.position.y = 2.65;
    group.add(flame);

    return group;
  }

  createFloatingLotus() {
    const group = new THREE.Group();

    // 1. Large Emerald Green Lotus Leaf (Lily Pad)
    const padGeo = new THREE.CircleGeometry(0.85, 8);
    padGeo.rotateX(-Math.PI / 2);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x1e6634,
      roughness: 0.6,
      metalness: 0.1
    });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.y = 0.01;
    group.add(pad);

    // 2. Blooming Pink Lotus Flower
    const lotusMat = new THREE.MeshStandardMaterial({
      color: 0xff5c98,
      roughness: 0.35,
      metalness: 0.1
    });

    // 8 Outer Petals
    const petalCount = 8;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petalGeo = new THREE.SphereGeometry(0.24, 6, 5);
      petalGeo.scale(0.55, 0.25, 1.2);
      const petal = new THREE.Mesh(petalGeo, lotusMat);
      petal.position.set(Math.cos(angle) * 0.3, 0.12, Math.sin(angle) * 0.3);
      petal.rotation.y = -angle + Math.PI / 2;
      petal.rotation.x = 0.45;
      group.add(petal);
    }

    // 4 Inner Upright Petals
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const inPetalGeo = new THREE.SphereGeometry(0.18, 5, 4);
      inPetalGeo.scale(0.5, 0.3, 1.0);
      const inPetal = new THREE.Mesh(inPetalGeo, lotusMat);
      inPetal.position.set(Math.cos(angle) * 0.15, 0.18, Math.sin(angle) * 0.15);
      inPetal.rotation.y = -angle + Math.PI / 2;
      inPetal.rotation.x = 0.7;
      group.add(inPetal);
    }

    // Gold Pollen Core
    const centerGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.12, 6);
    const center = new THREE.Mesh(centerGeo, this.materials.divineGold);
    center.position.y = 0.15;
    group.add(center);

    // Glowing Floating Water Candle Diya
    const diyaBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.08, 6), this.materials.templeBrass);
    diyaBase.position.set(0.52, 0.06, 0.48);
    group.add(diyaBase);

    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 4), this.materials.diyaFlame);
    flame.position.set(0.52, 0.16, 0.48);
    group.add(flame);

    return group;
  }

  createBrazierUrn() {
    const group = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, 0.4, 6), this.materials.sandstone);
    base.position.y = 0.2;
    group.add(base);

    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 1.4, 6), this.materials.templeBrass);
    col.position.y = 1.1;
    group.add(col);

    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.35, 0.5, 8), this.materials.templeBrass);
    bowl.position.y = 2.0;
    group.add(bowl);

    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.8, 6), this.materials.diyaFlame);
    flame.position.y = 2.6;
    group.add(flame);

    return group;
  }

  createBanyanTree() {
    const group = new THREE.Group();
    const trunkGeo = new THREE.CylinderGeometry(0.6, 0.9, 4.5, 6);
    const trunk = new THREE.Mesh(trunkGeo, this.materials.wood || this.materials.sandstone);
    trunk.position.y = 2.25;
    group.add(trunk);

    const folMat = this.materials.foliage || new THREE.MeshStandardMaterial({ color: 0x2e5a1c, roughness: 0.8 });
    const canGeo = new THREE.SphereGeometry(3.2, 7, 5);
    canGeo.scale(1.2, 0.8, 1.2);
    const canopy = new THREE.Mesh(canGeo, folMat);
    canopy.position.y = 5.2;
    group.add(canopy);

    return group;
  }

  createGrandToranaArch() {
    const group = new THREE.Group();
    const archH = 8.5;
    const spanW = 12.0;

    for (let side = -1; side <= 1; side += 2) {
      const pBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 1.6), this.materials.sandstone);
      pBase.position.set(side * (spanW / 2), 0.6, 0);
      group.add(pBase);

      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, archH, 8), this.materials.sandstone);
      col.position.set(side * (spanW / 2), archH / 2 + 1.2, 0);
      group.add(col);

      const cap = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 1.4), this.materials.divineGold);
      cap.position.set(side * (spanW / 2), archH + 1.2, 0);
      group.add(cap);
    }

    const beamGeo = new THREE.BoxGeometry(spanW + 2.4, 0.9, 1.4);
    const beam = new THREE.Mesh(beamGeo, this.materials.sandstone);
    beam.position.set(0, archH + 1.8, 0);
    group.add(beam);

    const crestGeo = new THREE.ConeGeometry(0.8, 1.6, 6);
    const crest = new THREE.Mesh(crestGeo, this.materials.divineGold);
    crest.position.set(0, archH + 3.0, 0);
    group.add(crest);

    return group;
  }

  // Helper: Authentic Sculpted Ancient Temple Pillar (Stambha)
  createOrnateTemplePillar(pillarMat, isSnow = false) {
    const pillarGroup = new THREE.Group();
    const stoneMat = pillarMat || this.materials.ancientGranitePillar || this.materials.sandstone;
    const goldMat = this.materials.divineGold;
    const brassMat = this.materials.templeBrass;

    // 1. Upana & Jagati (Stepped Square Plinth Base)
    const base1 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.4, 1.5), stoneMat);
    base1.position.y = 0.2;
    base1.receiveShadow = true;
    pillarGroup.add(base1);

    const base2 = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.35, 1.25), stoneMat);
    base2.position.y = 0.55;
    base2.receiveShadow = true;
    pillarGroup.add(base2);

    // Gold trim band on plinth
    const goldTrim = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.08, 1.28), goldMat);
    goldTrim.position.y = 0.74;
    pillarGroup.add(goldTrim);

    // 2. Lower Carved Drum (Octagonal section with Devata relief niches)
    const octDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.58, 1.8, 8), stoneMat);
    octDrum.position.y = 1.65;
    octDrum.receiveShadow = true;
    pillarGroup.add(octDrum);

    // Miniature Carved Deity Shrine Niches on 4 cardinal faces of lower drum
    for (let f = 0; f < 4; f++) {
      const angle = (f * Math.PI) / 2;
      const nicheFrame = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.6, 0.12), goldMat);
      nicheFrame.position.set(Math.sin(angle) * 0.54, 1.65, Math.cos(angle) * 0.54);
      nicheFrame.rotation.y = angle;
      pillarGroup.add(nicheFrame);
    }

    // 3. Lathe-Turned Annular Rings / Discs (Kumbha, Padma, Kani)
    const ring1 = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.15, 16), stoneMat);
    ring1.position.y = 2.62;
    pillarGroup.add(ring1);

    const goldRing = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.64, 0.08, 16), brassMat);
    goldRing.position.y = 2.74;
    pillarGroup.add(goldRing);

    const ring2 = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.14, 16), stoneMat);
    ring2.position.y = 2.85;
    pillarGroup.add(ring2);

    // 4. Fluted Cylindrical Mid-Drum Shaft (Stambha Shaft)
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 2.6, 12), stoneMat);
    shaft.position.y = 4.2;
    shaft.receiveShadow = true;
    pillarGroup.add(shaft);

    // Middle ornamental bead ring
    const midRing = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.12, 12), goldMat);
    midRing.position.y = 4.2;
    pillarGroup.add(midRing);

    // 5. Upper Neck & Capital (Kumbha, Phalaka, Abacus)
    const neckRing = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.44, 0.25, 12), stoneMat);
    neckRing.position.y = 5.62;
    pillarGroup.add(neckRing);

    // Flaring bell capital (Padma Capital)
    const capital = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.5, 0.45, 12), stoneMat);
    capital.position.y = 5.95;
    pillarGroup.add(capital);

    // Square Abacus Slab (Phalaka)
    const abacus = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.25, 1.6), stoneMat);
    abacus.position.y = 6.3;
    pillarGroup.add(abacus);

    // 6. Sculpted Cruciform Corbel Brackets (Potika / Yali Brackets)
    const corbelX = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 0.7), stoneMat);
    corbelX.position.y = 6.6;
    pillarGroup.add(corbelX);

    const corbelZ = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 1.8), stoneMat);
    corbelZ.position.y = 6.6;
    pillarGroup.add(corbelZ);

    const corbelFinial = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.15, 0.85), goldMat);
    corbelFinial.position.y = 6.85;
    pillarGroup.add(corbelFinial);

    // Frosting/Snow Top if in Himalayan biome
    if (isSnow) {
      const snowCap = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.18, 1.85), this.materials.himalayanSnow);
      snowCap.position.y = 6.95;
      pillarGroup.add(snowCap);
    }

    return pillarGroup;
  }

  // Helper: Authentic Ancient Indian Temple Pillared Mandapa Colonnade
  createTempleMandapaColonnade(side, len, biome = 'VALLEY') {
    const colonnadeGroup = new THREE.Group();

    const isSnow = biome === 'SNOW';
    const isApproach = biome === 'TEMPLE_APPROACH';

    // Select authentic materials based on biome
    const pillarMat = isSnow ? (this.materials.frostedStone || this.materials.ancientGranitePillar) : this.materials.ancientGranitePillar;
    const wallMat = isApproach ? (this.materials.gopuramTier || this.materials.mandapaWall) : this.materials.mandapaWall;
    const lintelMat = isSnow ? (this.materials.frostedStone || this.materials.ancientStoneLintel) : this.materials.ancientStoneLintel;
    const ceilingMat = this.materials.mandapaCeiling;
    const floorMat = isSnow ? (this.materials.frostedStone || this.materials.templeFloor) : this.materials.templeFloor;

    const corridorWidth = 18.0;
    const floorCenterX = side * (16.0 + corridorWidth / 2); // X = side * 25.0m

    // 1. Mandapa Stone Corridor Floor Platform (Paved Gallery)
    const floorGeo = new THREE.PlaneGeometry(corridorWidth, len);
    floorGeo.rotateX(-Math.PI / 2);
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.set(floorCenterX, 0.01, len / 2);
    floor.receiveShadow = true;
    colonnadeGroup.add(floor);

    // Stepped Adhisthana Plinth Edge along the Canal boundary (X = side * 16.0m)
    const plinthStepGeo = new THREE.BoxGeometry(0.8, 0.35, len);
    const plinthStep = new THREE.Mesh(plinthStepGeo, this.materials.adhisthanaBase || pillarMat);
    plinthStep.position.set(side * 16.0, 0.15, len / 2);
    plinthStep.receiveShadow = true;
    colonnadeGroup.add(plinthStep);

    // 2. Double Row of Ornate Sculpted Mandapa Pillars (Stambhavali)
    const frontRowX = side * 17.5;
    const rearRowX = side * 25.5;

    const pillarSpacing = 6.0;
    for (let pZ = 0; pZ <= len; pZ += pillarSpacing) {
      // Front Row Pillar
      const frontPillar = this.createOrnateTemplePillar(pillarMat, isSnow);
      frontPillar.position.set(frontRowX, 0, pZ);
      colonnadeGroup.add(frontPillar);

      // Rear Row Pillar (Deep multi-layered corridor perspective)
      const rearPillar = this.createOrnateTemplePillar(pillarMat, isSnow);
      rearPillar.position.set(rearRowX, 0, pZ);
      colonnadeGroup.add(rearPillar);

      // Transverse Stone Cross-Lintel Tie-Beam
      const tieBeamGeo = new THREE.BoxGeometry(16.5, 0.65, 0.85);
      const tieBeam = new THREE.Mesh(tieBeamGeo, lintelMat);
      tieBeam.position.set(side * 25.5, 7.05, pZ);
      tieBeam.receiveShadow = true;
      colonnadeGroup.add(tieBeam);

      // Hanging Bronze Chain Temple Lamp (Thooku Vilakku) between pillar rows
      if (Math.round(pZ) % 12 === 0) {
        const lampMidX = side * 21.5;
        // Hanging chain
        const chainGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.8, 4);
        const chain = new THREE.Mesh(chainGeo, this.materials.templeBrass);
        chain.position.set(lampMidX, 5.8, pZ);
        colonnadeGroup.add(chain);

        // Hanging Diya Bowl
        const lampBowlGeo = new THREE.CylinderGeometry(0.4, 0.15, 0.25, 8);
        const lampBowl = new THREE.Mesh(lampBowlGeo, this.materials.templeBrass);
        lampBowl.position.set(lampMidX, 4.8, pZ);
        colonnadeGroup.add(lampBowl);

        // Radiant Glowing Oil Flame
        const lampFlameGeo = new THREE.ConeGeometry(0.1, 0.35, 5);
        const lampFlame = new THREE.Mesh(lampFlameGeo, this.materials.diyaFlame);
        lampFlame.position.set(lampMidX, 5.05, pZ);
        colonnadeGroup.add(lampFlame);
      }
    }

    // 3. Continuous Longitudinal Stone Architrave Beam Lintels
    const lintelGeo = new THREE.BoxGeometry(0.9, 0.65, len + 0.5);
    const frontLintel = new THREE.Mesh(lintelGeo, lintelMat);
    frontLintel.position.set(frontRowX, 7.05, len / 2);
    frontLintel.receiveShadow = true;
    colonnadeGroup.add(frontLintel);

    const rearLintel = new THREE.Mesh(lintelGeo, lintelMat);
    rearLintel.position.set(rearRowX, 7.05, len / 2);
    rearLintel.receiveShadow = true;
    colonnadeGroup.add(rearLintel);

    // 4. Heavy Stone Slab Coffered Ceiling (Mandapa Vitana)
    const ceilingGeo = new THREE.BoxGeometry(corridorWidth, 0.4, len);
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.position.set(floorCenterX, 7.55, len / 2);
    ceiling.receiveShadow = true;
    colonnadeGroup.add(ceiling);

    // 5. Projecting Sloping Stone Chhajja Eaves (Sunshade Cornice over front gallery)
    const chhajjaGeo = new THREE.BoxGeometry(1.6, 0.25, len);
    const chhajja = new THREE.Mesh(chhajjaGeo, lintelMat);
    chhajja.position.set(side * (17.5 - side * 0.9), 7.25, len / 2);
    chhajja.rotation.z = side * 0.18;
    colonnadeGroup.add(chhajja);

    // Roof Parapet with Miniature Shikhara / Kudu Frieze
    const parapetGeo = new THREE.BoxGeometry(0.6, 0.75, len);
    const parapet = new THREE.Mesh(parapetGeo, pillarMat);
    parapet.position.set(side * 17.2, 8.1, len / 2);
    colonnadeGroup.add(parapet);

    // Miniature Shikhara finials along roof edge
    for (let fz = 3.0; fz < len; fz += 6.0) {
      const finialGeo = new THREE.ConeGeometry(0.35, 0.7, 6);
      const finial = new THREE.Mesh(finialGeo, this.materials.divineGold);
      finial.position.set(side * 17.2, 8.8, fz);
      colonnadeGroup.add(finial);
    }

    // 6. Solid Carved Inner Back Sanctorum Wall
    const wallH = 12.0;
    const wallGeo = new THREE.BoxGeometry(2.0, wallH, len);
    const backWall = new THREE.Mesh(wallGeo, wallMat);
    backWall.position.set(side * 33.5, wallH / 2, len / 2);
    backWall.receiveShadow = true;
    colonnadeGroup.add(backWall);

    // Upper Wall Cornice Molding
    const wallCorniceGeo = new THREE.BoxGeometry(2.4, 0.6, len);
    const wallCornice = new THREE.Mesh(wallCorniceGeo, lintelMat);
    wallCornice.position.set(side * 33.5, wallH + 0.3, len / 2);
    colonnadeGroup.add(wallCornice);

    // Himalayan Snow caps on roof/wall if Snow biome
    if (isSnow) {
      const snowRoofGeo = new THREE.BoxGeometry(corridorWidth + 1.0, 0.35, len);
      const snowRoof = new THREE.Mesh(snowRoofGeo, this.materials.himalayanSnow);
      snowRoof.position.set(floorCenterX, 7.9, len / 2);
      colonnadeGroup.add(snowRoof);

      const snowWallGeo = new THREE.BoxGeometry(2.8, 0.4, len);
      const snowWall = new THREE.Mesh(snowWallGeo, this.materials.himalayanSnow);
      snowWall.position.set(side * 33.5, wallH + 0.8, len / 2);
      colonnadeGroup.add(snowWall);
    }

    return colonnadeGroup;
  }

  initTrack(startZ = 0) {
    this.spawnZ = startZ;
    for (let i = 0; i < this.visibleSegments; i++) {
      const segMesh = this.createModularSegmentMesh(i, this.spawnZ);
      segMesh.position.z = this.spawnZ;
      this.scene.add(segMesh);

      const segData = {
        mesh: segMesh,
        startZ: this.spawnZ,
        endZ: this.spawnZ + this.segmentLength,
        biome: this.getBiomeForZ(this.spawnZ)
      };
      this.segments.push(segData);

      if (i > 0 || startZ > 0) {
        this.populateSegment(segData);
      }

      this.spawnZ += this.segmentLength;
    }
  }

  populateSegment(segData) {
    if (segData.startZ >= this.climaxTriggerDistance - 60) return;

    const lanes = [-3.2, 0, 3.2];
    const laneIdx = Math.floor(Math.random() * 3);
    const obstacleLane = lanes[laneIdx];
    const itemLane = lanes[(laneIdx + 1) % 3];
    const altLane = lanes[(laneIdx + 2) % 3];

    // 1. Assign Obstacle from Pool (Strictly in Regions 1, 2, 3; Region 4 has wide open passage)
    if (segData.startZ < 1200) {
      const obs = this.obstaclePool.find(o => !o.visible);
      if (obs) {
        obs.visible = true;
        obs.nearMissChecked = false;
        obs.hasHit = false;
        obs.trialPassed = false;
        const zOffset = 15 + Math.random() * 12;
        const worldZ = segData.startZ + zOffset;
        obs.position.set(obstacleLane, 0, worldZ);
        obs.worldZ = worldZ;
        obs.segData = segData;
        if (!this.activeObstacles.includes(obs)) {
          this.activeObstacles.push(obs);
        }
      }
    }

    // 2. Sacred Golden Stars (3 in a row along available lane)
    for (let s = 0; s < 3; s++) {
      const star = this.starPool.find(st => !st.visible);
      if (star) {
        star.visible = true;
        star.isCollected = false;
        const sZ = segData.startZ + 8 + s * 8.0;
        star.position.set(altLane, 1.2, sZ);
        star.worldZ = sZ;
        star.segData = segData;
        if (!this.activeCollectibles.includes(star)) {
          this.activeCollectibles.push(star);
        }
      }
    }
  }

  update(playerZ, delta) {
    // 1. Recycle Segments
    if (this.segments.length > 0) {
      const firstSeg = this.segments[0];
      if (playerZ - firstSeg.endZ > 15.0) {
        // Recycle obstacles
        this.activeObstacles = this.activeObstacles.filter(obs => {
          if (obs.segData === firstSeg) {
            obs.visible = false;
            obs.segData = null;
            obs.nearMissChecked = false;
            obs.hasHit = false;
            return false;
          }
          return true;
        });

        // Recycle all collectibles (Stars, Modaks, Diyas)
        this.activeCollectibles = this.activeCollectibles.filter(item => {
          if (item.segData === firstSeg) {
            item.visible = false;
            item.segData = null;
            item.isCollected = false;
            return false;
          }
          return true;
        });

        // Advance segment forward
        const newStartZ = this.spawnZ;
        const newBiome = this.getBiomeForZ(newStartZ);

        if (firstSeg.biome !== newBiome) {
          this.scene.remove(firstSeg.mesh);
          const newMesh = this.createModularSegmentMesh(this.segments.length, newStartZ);
          newMesh.position.z = newStartZ;
          this.scene.add(newMesh);
          firstSeg.mesh = newMesh;
          firstSeg.biome = newBiome;
        } else {
          firstSeg.mesh.position.z = newStartZ;
        }

        firstSeg.startZ = newStartZ;
        firstSeg.endZ = newStartZ + this.segmentLength;

        this.segments.shift();
        this.segments.push(firstSeg);

        this.populateSegment(firstSeg);
        this.spawnZ += this.segmentLength;
      }
    }

    // 2. Animate Collectibles
    for (let i = 0; i < this.activeCollectibles.length; i++) {
      const item = this.activeCollectibles[i];
      if (item.visible && !item.isCollected) {
        item.rotation.y += delta * 2.5;
      }
    }

    // 3. Animate Interactables (Vighnas, Shrines, Temple Bell)
    for (let i = 0; i < this.interactables.length; i++) {
      const obj = this.interactables[i];
      if (obj.visible) {
        if (obj.interactType === 'VIGHNA') {
          if (obj.ring) obj.ring.rotation.z += delta * 1.5;
          if (obj.omOrb) {
            obj.omOrb.rotation.y += delta * 2.0;
            obj.omOrb.position.y = 2.4 + Math.sin(Date.now() * 0.004) * 0.15;
          }
        } else if (obj.interactType === 'BELL') {
          if (obj.bellMesh) {
            obj.bellMesh.rotation.z = Math.sin(Date.now() * 0.003) * 0.05;
          }
        }
      }
    }

    // Animate sacred water flow
    if (this.textures && this.textures.water) {
      this.textures.water.offset.y -= delta * 0.25;
    }
  }

  getCurrentStage(distance) {
    const stages = [
      { name: "FESTIVAL ENTRANCE",       maxDist: 350,  fogColor: 0x5a2810, lightColor: 0xffeed4, skyTint: 0x3a1808, snowIntensity: 0.0 },
      { name: "DEODAR FOOTHILLS",        maxDist: 750,  fogColor: 0x485868, lightColor: 0xfff0dc, skyTint: 0x2e3c4a, snowIntensity: 0.0 },
      { name: "HIMALAYAN SNOW PASSAGE",  maxDist: 1200, fogColor: 0x6e8898, lightColor: 0xfff8ee, skyTint: 0x3d5265, snowIntensity: 1.0 },
      { name: "ROYAL TEMPLE APPROACH",   maxDist: 1500, fogColor: 0x5a2408, lightColor: 0xffe4b0, skyTint: 0x2e0e04, snowIntensity: 0.0 },
      { name: "SACRED SANCTUM",          maxDist: Infinity, fogColor: 0x3e1204, lightColor: 0xffbe68, skyTint: 0x220802, snowIntensity: 0.0 }
    ];
    for (let s of stages) {
      if (distance < s.maxDist) return s;
    }
    return stages[stages.length - 1];
  }

  getNearbyInteractable(playerZ, playerX, maxRange = 18.0) {
    for (let i = 0; i < this.interactables.length; i++) {
      const obj = this.interactables[i];
      if (!obj.isCleared) {
        const dz = obj.targetZ - playerZ;
        // In front of player within maxRange, or just passed within 3m
        if (dz >= -3.0 && dz <= maxRange) {
          return obj;
        }
      }
    }
    return null;
  }

  clearInteractable(interactId) {
    for (let i = 0; i < this.interactables.length; i++) {
      const obj = this.interactables[i];
      if (obj.interactId === interactId || (obj.interactType === 'VIGHNA' && `VIGHNA_${obj.vighnaId}` === interactId)) {
        obj.isCleared = true;
        // Float and fade out clearance animation
        let elapsed = 0;
        const anim = () => {
          elapsed += 0.03;
          obj.position.y += 0.15;
          obj.scale.multiplyScalar(0.94);
          if (elapsed < 1.0) {
            requestAnimationFrame(anim);
          } else {
            obj.visible = false;
          }
        };
        requestAnimationFrame(anim);
        return obj;
      }
    }
    return null;
  }

  checkCollisions(player) {
    const pZ = player.mesh.position.z;
    const pX = player.currentX;
    const pY = player.posY;

    let hit = false;
    let hitObstacle = null;
    let nearMiss = false;

    // 1. Check Obstacles
    for (let i = 0; i < this.activeObstacles.length; i++) {
      const obs = this.activeObstacles[i];
      if (obs.visible && !obs.hasHit) {
        const dz = Math.abs(obs.worldZ - pZ);
        const dx = Math.abs(obs.position.x - pX);

        if (dz < 1.8 && dx < 1.6) {
          if (obs.actionRequired === 'JUMP') {
            if (pY < 0.75) {
              hit = true;
              hitObstacle = obs;
              obs.hasHit = true;
            }
          } else if (obs.actionRequired === 'SLIDE') {
            if (!player.isSliding) {
              hit = true;
              hitObstacle = obs;
              obs.hasHit = true;
            }
          } else {
            hit = true;
            hitObstacle = obs;
            obs.hasHit = true;
          }
        }

        if (!obs.nearMissChecked && !obs.hasHit && dz < 2.4 && dz > 0.3) {
          if (dx >= 1.6 && dx <= 2.8) {
            obs.nearMissChecked = true;
            nearMiss = true;
          } else if (dx < 1.6 && obs.actionRequired === 'JUMP' && pY >= 0.75 && pY <= 1.6) {
            obs.nearMissChecked = true;
            nearMiss = true;
          } else if (dx < 1.6 && obs.actionRequired === 'SLIDE' && player.isSliding) {
            obs.nearMissChecked = true;
            nearMiss = true;
          }
        }
      }
    }

    // 2. Check Collectibles (Stars)
    const collected = [];
    for (let i = 0; i < this.activeCollectibles.length; i++) {
      const item = this.activeCollectibles[i];
      if (item.visible && !item.isCollected) {
        const dz = Math.abs(item.worldZ - pZ);
        if (dz < 1.5) {
          const dx = Math.abs(item.position.x - pX);
          const dy = Math.abs(item.position.y - (pY + 0.8));
          if (dx < 1.5 && dy < 1.8) {
            item.isCollected = true;
            item.visible = false;
            collected.push(item);
          }
        }
      }
    }

    return { hit, obstacle: hitObstacle, collected, nearMiss };
  }

  reset(startZ = 0) {
    this.obstaclePool.forEach(obs => {
      obs.visible = false;
      obs.segData = null;
      obs.nearMissChecked = false;
      obs.hasHit = false;
    });
    this.starPool.forEach(st => {
      st.visible = false;
      st.segData = null;
      st.isCollected = false;
    });
    this.activeObstacles = [];
    this.activeCollectibles = [];

    // Reset Interactables
    this.interactables.forEach(obj => {
      obj.isCleared = false;
      obj.visible = true;
      obj.scale.set(1, 1, 1);
      obj.position.set(0, 0, obj.targetZ);
    });

    // Clear old segment meshes
    for (let seg of this.segments) {
      this.scene.remove(seg.mesh);
    }
    this.segments = [];
    this.initTrack(startZ);
  }
}
