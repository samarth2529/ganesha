// ===================================================================
// VIGHNAHARTA — SACRED TEMPLE RUNNER TRACK & PUSHKARINI CANALS
// Royal Stone Causeway, Side Waterways with Blooming Lotuses & Lily Pads,
// Stepped Sandstone Ghats, Ornate Balustrades, Banyan Trees, and Toranas.
// 100% Recycled & Object-Pooled for 60 FPS performance.
// ===================================================================

import * as THREE from 'three';
import { ObstacleFactory } from '../entities/Obstacles.js';
import { CollectibleFactory } from '../entities/Collectibles.js';
import { Temple } from '../entities/Temple.js';

export class TrackManager {
  constructor(scene, shaderMaterials) {
    this.scene = scene;
    this.materials = shaderMaterials.materials;
    this.textures = shaderMaterials.textures;
    this.obstacleFactory = new ObstacleFactory(shaderMaterials);
    this.collectibleFactory = new CollectibleFactory(shaderMaterials);

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

    this.initPools();
    this.initTrack();
  }

  initPools() {
    // 1. Fixed Obstacle Pool (15 items)
    const types = ['LOW', 'HIGH', 'SOLID', 'LOW'];
    for (let i = 0; i < 15; i++) {
      const type = types[i % types.length];
      let obs;
      if (type === 'LOW') {
        obs = this.obstacleFactory.createLowCart();
      } else if (type === 'HIGH') {
        obs = this.obstacleFactory.createHighStall();
      } else {
        obs = this.obstacleFactory.createSolidPillar();
      }
      obs.visible = false;
      obs.frustumCulled = true;
      this.scene.add(obs);
      this.obstaclePool.push(obs);
    }

    // 2. Fixed Star Pool (30 items)
    for (let i = 0; i < 30; i++) {
      const star = this.collectibleFactory.createStar(0, 1.0, 0);
      star.visible = false;
      star.frustumCulled = true;
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

    // Outer Temple Courtyard Plaza (X = ±16.5m to ±32.0m)
    const plazaWidth = 16.0;
    const plazaGeo = new THREE.PlaneGeometry(plazaWidth, len);
    plazaGeo.rotateX(-Math.PI / 2);

    for (let side = -1; side <= 1; side += 2) {
      const plazaCenterX = side * (16.0 + plazaWidth / 2);

      const plaza = new THREE.Mesh(plazaGeo, this.materials.sandstone);
      plaza.position.set(plazaCenterX, 0, len / 2);
      plaza.receiveShadow = true;
      group.add(plaza);

      for (let bZ = 10.0; bZ < len; bZ += 20.0) {
        const brazier = this.createBrazierUrn();
        brazier.position.set(side * 17.5, 0, bZ);
        group.add(brazier);
      }

      const tree = this.createBanyanTree();
      tree.position.set(side * 24.5, 0, 22.0);
      group.add(tree);
    }

    // Carved Temple Boundary Walls
    const wallH = 10.0;
    const wallGeo = new THREE.BoxGeometry(1.6, wallH, len);
    for (let side = -1; side <= 1; side += 2) {
      const wall = new THREE.Mesh(wallGeo, this.materials.templeWall || this.materials.sandstone);
      wall.position.set(side * 32.5, wallH / 2, len / 2);
      wall.receiveShadow = true;
      group.add(wall);

      const corniceGeo = new THREE.BoxGeometry(2.2, 0.5, len);
      const cornice = new THREE.Mesh(corniceGeo, this.materials.sandstone);
      cornice.position.set(side * 32.5, wallH + 0.25, len / 2);
      group.add(cornice);
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
      group.add(plaza);

      // Himalayan Deodar Pines
      const pine = this.createDeodarPineTree(false);
      pine.position.set(side * 24.0, 0, 20.0);
      group.add(pine);

      // Mountain Stone Cliff Wall
      const cliffGeo = new THREE.BoxGeometry(2.0, 12.0, len);
      const cliff = new THREE.Mesh(cliffGeo, this.materials.cliffStone || this.materials.templeWall);
      cliff.position.set(side * 32.5, 6.0, len / 2);
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

      // Balustrade Posts & Glowing Diya Lamps (Warm Gold contrast against white snow!)
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

    // Outer Temple Plaza with Floodlit Gopuram Walls
    const plazaWidth = 16.0;
    const plazaGeo = new THREE.PlaneGeometry(plazaWidth, len);
    plazaGeo.rotateX(-Math.PI / 2);

    for (let side = -1; side <= 1; side += 2) {
      const plazaCenterX = side * (16.0 + plazaWidth / 2);
      const plaza = new THREE.Mesh(plazaGeo, this.materials.sandstone);
      plaza.position.set(plazaCenterX, 0, len / 2);
      group.add(plaza);

      for (let bZ = 8.0; bZ < len; bZ += 15.0) {
        const brazier = this.createBrazierUrn();
        brazier.position.set(side * 17.5, 0, bZ);
        group.add(brazier);
      }

      const wallH = 12.0;
      const wallGeo = new THREE.BoxGeometry(2.0, wallH, len);
      const wall = new THREE.Mesh(wallGeo, this.materials.gopuramTier || this.materials.templeWall);
      wall.position.set(side * 32.5, wallH / 2, len / 2);
      group.add(wall);
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

  initTrack() {
    this.spawnZ = 0;
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

      if (i > 0) {
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
    const starLane = lanes[(laneIdx + 1) % 3];

    // 1. Assign Obstacle from Pool
    const obs = this.obstaclePool.find(o => !o.visible);
    if (obs) {
      obs.visible = true;
      const zOffset = 15 + Math.random() * 12;
      const worldZ = segData.startZ + zOffset;
      obs.position.set(obstacleLane, 0, worldZ);
      obs.worldZ = worldZ;
      obs.segData = segData;
      if (!this.activeObstacles.includes(obs)) {
        this.activeObstacles.push(obs);
      }
    }

    // 2. Assign Stars in a row (3 stars)
    for (let s = 0; s < 3; s++) {
      const star = this.starPool.find(st => !st.visible);
      if (star) {
        star.visible = true;
        star.isCollected = false;
        const sZ = segData.startZ + 12 + s * 7.5;
        star.position.set(starLane, 1.2, sZ);
        star.worldZ = sZ;
        star.segData = segData;
        if (!this.activeStars.includes(star)) {
          this.activeStars.push(star);
        }
      }
    }
  }

  update(playerZ, delta) {
    // 1. Recycle Segments
    if (this.segments.length > 0) {
      const firstSeg = this.segments[0];
      if (playerZ - firstSeg.endZ > 15.0) {
        // Recycle obstacles & stars
        this.activeObstacles = this.activeObstacles.filter(obs => {
          if (obs.segData === firstSeg) {
            obs.visible = false;
            obs.segData = null;
            return false;
          }
          return true;
        });

        this.activeStars = this.activeStars.filter(star => {
          if (star.segData === firstSeg) {
            star.visible = false;
            star.segData = null;
            return false;
          }
          return true;
        });

        // Advance segment forward
        const newStartZ = this.spawnZ;
        const newBiome = this.getBiomeForZ(newStartZ);

        // If biome changed, rebuild the modular mesh cleanly
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

    // 2. Animate Stars
    for (let i = 0; i < this.activeStars.length; i++) {
      const star = this.activeStars[i];
      if (star.visible && !star.isCollected) {
        star.rotation.y += delta * 2.5;
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

  checkCollisions(player) {
    const pZ = player.mesh.position.z;
    const pX = player.currentX;
    const pY = player.posY;

    let nearMiss = false;

    // Check Obstacles
    for (let i = 0; i < this.activeObstacles.length; i++) {
      const obs = this.activeObstacles[i];
      if (obs.visible) {
        const dz = Math.abs(obs.worldZ - pZ);
        const dx = Math.abs(obs.position.x - pX);

        if (dz < 1.3) {
          if (dx < 1.4) {
            if (obs.actionRequired === 'JUMP') {
              if (pY < 0.7) return { hit: true, obstacle: obs };
            } else if (obs.actionRequired === 'SLIDE') {
              if (!player.isSliding) return { hit: true, obstacle: obs };
            } else {
              return { hit: true, obstacle: obs };
            }
          }
        }

        // Near-Miss detection: Narrowly avoided in adjacent lane or tight jump clearance
        if (!obs.nearMissChecked && dz < 1.8 && dz > 0.2) {
          if (dx >= 1.4 && dx <= 2.5) {
            obs.nearMissChecked = true;
            nearMiss = true;
          } else if (dx < 1.4 && obs.actionRequired === 'JUMP' && pY >= 0.7 && pY <= 1.4) {
            obs.nearMissChecked = true;
            nearMiss = true;
          }
        }
      }
    }

    // Check Stars
    const collected = [];
    for (let i = 0; i < this.activeStars.length; i++) {
      const star = this.activeStars[i];
      if (star.visible && !star.isCollected) {
        const dz = Math.abs(star.worldZ - pZ);
        if (dz < 1.2) {
          const dx = Math.abs(star.position.x - pX);
          const dy = Math.abs(star.position.y - (pY + 0.6));
          if (dx < 1.2 && dy < 1.5) {
            star.isCollected = true;
            star.visible = false;
            collected.push(star);
          }
        }
      }
    }

    return { hit: false, collected: collected, nearMiss: nearMiss };
  }

  reset() {
    this.activeObstacles.forEach(obs => { obs.visible = false; obs.segData = null; });
    this.activeStars.forEach(star => { star.visible = false; star.segData = null; });
    this.activeObstacles = [];
    this.activeStars = [];

    // Clear old segment meshes
    for (let seg of this.segments) {
      this.scene.remove(seg.mesh);
    }
    this.segments = [];
    this.initTrack();
  }
}
