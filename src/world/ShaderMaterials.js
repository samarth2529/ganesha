// ===================================================================
// VIGHNAHARTA PBR & SHADER MATERIALS SYSTEM
// Generates high-detail procedural textures, normal maps, roughness maps,
// and specialized GPU shaders for cloth, gold, stone, fire, and divine halos.
// ===================================================================

import * as THREE from 'three';

export class ShaderMaterials {
  constructor() {
    this.textures = {};
    this.materials = {};
    this.initProceduralTextures();
    this.initCoreMaterials();
  }

  initProceduralTextures() {
    // 1. Ancient Carved Temple Sandstone Texture & Normal Map
    this.textures.sandstoneAlbedo = this.createNoiseTexture('#d4a373', '#8b5a2b', 512, 'stone');
    this.textures.sandstoneNormal = this.createNormalMapFromNoise(512, 2.5);

    // 2. Temple Floor Pavers / Granite Stone
    this.textures.floorAlbedo = this.createTileTexture('#63524b', '#2c221c', 512);
    this.textures.floorNormal = this.createNormalMapFromNoise(512, 1.8);

    // 3. Ornate Carved Gold & Brass Texture
    this.textures.goldAlbedo = this.createGoldOrnamentTexture(512);
    this.textures.goldNormal = this.createNormalMapFromNoise(512, 3.0);

    // 4. Marigold Petal Texture
    this.textures.marigold = this.createMarigoldTexture(256);

    // 5. Sacred Rangoli Texture
    this.textures.rangoli = this.createRangoliTexture(512);

    // 6. Soft Radial Particle Dot Texture
    this.textures.particleDot = this.createParticleDotTexture(128);

    // 7. Ancient Temple Wall Carving Texture
    this.textures.wallAlbedo = this.createCarvedWallTexture(512);

    // 8. Sacred Water Ripple Texture
    this.textures.water = this.createWaterTexture(256);

    // 9. Banyan Tree Bark Texture
    this.textures.treeBark = this.createNoiseTexture('#3e2723', '#1b0000', 256, 'bark');

    // 10. Sacred Foliage Leaf Texture
    this.textures.foliage = this.createFoliageTexture(256);

    // 11. Dravidian Gopuram Tier Relief Texture & Normal Map
    this.textures.gopuramAlbedo = this.createDravidianGopuramTexture(512);
    this.textures.gopuramNormal = this.createNormalMapFromNoise(512, 3.2);

    // 12. Adhisthana Plinth Elephant & Lotus Carving Relief Texture
    this.textures.adhisthanaAlbedo = this.createDravidianAdhisthanaTexture(512);

    // 13. Dvarapala Guardian Deity Niche Relief Texture
    this.textures.dvarapalaAlbedo = this.createDvarapalaReliefTexture(512);

    // 14. Ancient Hoysala / Dravidian Sculpted Pillar Texture & Normal
    this.textures.mandapaPillarAlbedo = this.createAncientPillarTexture(512);

    // 15. Ancient Pillared Corridor Mandapa Back Wall Relief Texture
    this.textures.mandapaWallAlbedo = this.createAncientMandapaWallTexture(512);

    // 16. Stepped Stone Ceiling Slab Texture
    this.textures.mandapaCeilingAlbedo = this.createMandapaCeilingTexture(512);
  }

  createParticleDotTexture(size = 128) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(255, 230, 160, 0.8)');
    grad.addColorStop(0.7, 'rgba(255, 180, 50, 0.2)');
    grad.addColorStop(1, 'rgba(255, 180, 50, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    return new THREE.CanvasTexture(canvas);
  }

  createNoiseTexture(colorA, colorB, size = 512, pattern = 'stone') {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const col1 = new THREE.Color(colorA);
    const col2 = new THREE.Color(colorB);

    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        let n = Math.sin(x * 0.04) * Math.cos(y * 0.04) * 0.5 + 0.5;
        n += (Math.random() - 0.5) * 0.2;
        n = Math.max(0, Math.min(1, n));

        data[idx] = Math.floor((col1.r * (1 - n) + col2.r * n) * 255);
        data[idx + 1] = Math.floor((col1.g * (1 - n) + col2.g * n) * 255);
        data[idx + 2] = Math.floor((col1.b * (1 - n) + col2.b * n) * 255);
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  createTileTexture(baseColor, groutColor, size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = groutColor;
    ctx.fillRect(0, 0, size, size);

    const tileSize = size / 4;
    const padding = 6;

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const x = c * tileSize + padding;
        const y = r * tileSize + padding;
        const w = tileSize - padding * 2;
        const h = tileSize - padding * 2;

        const grad = ctx.createLinearGradient(x, y, x + w, y + h);
        grad.addColorStop(0, baseColor);
        grad.addColorStop(1, '#2c221c');
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, w, h);

        ctx.strokeStyle = 'rgba(255, 235, 200, 0.15)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 4);
    return tex;
  }

  createNormalMapFromNoise(size = 512, strength = 2.0) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    const heightMap = new Float32Array(size * size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const val = Math.sin(x * 0.08) * Math.cos(y * 0.08) * 0.5 + Math.random() * 0.15;
        heightMap[y * size + x] = val;
      }
    }

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const left = heightMap[y * size + ((x - 1 + size) % size)];
        const right = heightMap[y * size + ((x + 1) % size)];
        const up = heightMap[((y - 1 + size) % size) * size + x];
        const down = heightMap[((y + 1) % size) * size + x];

        const dx = (right - left) * strength;
        const dy = (down - up) * strength;
        const dz = 1.0;

        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const nx = (dx / len) * 0.5 + 0.5;
        const ny = (dy / len) * 0.5 + 0.5;
        const nz = (dz / len) * 0.5 + 0.5;

        const idx = (y * size + x) * 4;
        data[idx] = Math.floor(nx * 255);
        data[idx + 1] = Math.floor(ny * 255);
        data[idx + 2] = Math.floor(nz * 255);
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  createGoldOrnamentTexture(size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#b8860b';
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 4;

    const centerX = size / 2;
    const centerY = size / 2;

    for (let r = 30; r < size / 2; r += 40) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    return new THREE.CanvasTexture(canvas);
  }

  createMarigoldTexture(size = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(size/2, size/2, 4, size/2, size/2, size/2);
    grad.addColorStop(0, '#ff3838');
    grad.addColorStop(0.35, '#ff9f1a');
    grad.addColorStop(0.8, '#fffa65');
    grad.addColorStop(1, 'rgba(255, 250, 101, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }

  createRangoliTexture(size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, size, size);
    const c = size / 2;

    const petals = 12;
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2;
      ctx.save();
      ctx.translate(c, c);
      ctx.rotate(angle);

      ctx.fillStyle = i % 2 === 0 ? '#ff3838' : '#ff9f1a';
      ctx.beginPath();
      ctx.ellipse(0, 120, 35, 80, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(c, c, 70, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd700';
    ctx.fill();
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 6;
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
  }

  createCarvedWallTexture(size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Ancient Sandstone base
    ctx.fillStyle = '#b8864e';
    ctx.fillRect(0, 0, size, size);

    // Carved frieze bands and architectural reliefs
    ctx.fillStyle = '#9e6d38';
    ctx.fillRect(0, 0, size, 40);
    ctx.fillRect(0, size - 40, size, 40);
    ctx.fillRect(0, size / 2 - 20, size, 40);

    // Carved floral motifs and Sanskrit arches
    ctx.strokeStyle = '#d8a46e';
    ctx.lineWidth = 4;
    for (let x = 32; x < size; x += 64) {
      // Arches
      ctx.beginPath();
      ctx.arc(x, 120, 24, Math.PI, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, size - 120, 24, Math.PI, 0);
      ctx.stroke();

      // Diamond carvings
      ctx.beginPath();
      ctx.moveTo(x, size / 2 - 15);
      ctx.lineTo(x + 15, size / 2);
      ctx.lineTo(x, size / 2 + 15);
      ctx.lineTo(x - 15, size / 2);
      ctx.closePath();
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  createWaterTexture(size = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Rich Crystalline Maldives Turquoise Lagoon Gradient
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#009fb7');
    grad.addColorStop(0.35, '#00c4cc');
    grad.addColorStop(0.7, '#48dbfb');
    grad.addColorStop(1, '#E1F8F6');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Luminous water caustics webs (Sunlight refraction on seabed)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2.0;
    for (let i = 0; i < 24; i++) {
      ctx.beginPath();
      const y = (i / 24) * size + (Math.random() - 0.5) * 8;
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(size * 0.33, y + Math.sin(i * 1.2) * 14, size * 0.66, y - Math.cos(i * 1.5) * 14, size, y);
      ctx.stroke();
    }

    // Secondary fine turquoise ripples
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
    ctx.lineWidth = 3.0;
    for (let i = 0; i < 14; i++) {
      ctx.beginPath();
      const x = Math.random() * size;
      const y = Math.random() * size;
      ctx.arc(x, y, 12 + Math.random() * 24, 0, Math.PI * 2);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }

  createFoliageTexture(size = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#2d572c';
    ctx.fillRect(0, 0, size, size);

    // Leaf cluster highlights
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 4 + Math.random() * 8;
      ctx.fillStyle = Math.random() > 0.4 ? '#3e7e3c' : (Math.random() > 0.5 ? '#1e4620' : '#d48817');
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  createDravidianGopuramTexture(size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Warm illuminated golden-amber granite base (floodlit night stone)
    const baseGrad = ctx.createLinearGradient(0, 0, 0, size);
    baseGrad.addColorStop(0, '#f3b86e');
    baseGrad.addColorStop(0.5, '#d89445');
    baseGrad.addColorStop(1, '#9f6226');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, size, size);

    // Granite stone block courses
    ctx.strokeStyle = 'rgba(70, 35, 10, 0.4)';
    ctx.lineWidth = 2;
    const rowH = 32;
    for (let y = 0; y < size; y += rowH) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();

      // Staggered vertical joints
      const offset = (y / rowH) % 2 === 0 ? 0 : 32;
      for (let x = offset; x < size; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + rowH);
        ctx.stroke();
      }
    }

    // Carved Architectural Cornices & Kudu Horseshoe Arches
    for (let tier = 0; tier < 4; tier++) {
      const tierY = tier * 128;

      // Heavy Kapota Cornice with drop moldings
      ctx.fillStyle = '#fce2a6';
      ctx.fillRect(0, tierY, size, 14);
      ctx.fillStyle = '#6e3e14';
      ctx.fillRect(0, tierY + 14, size, 6);

      // Kudu Arches & Sculpted miniature niches
      for (let kX = 24; kX < size; kX += 64) {
        // Deep shadow inside niche
        ctx.fillStyle = '#422008';
        ctx.beginPath();
        ctx.arc(kX, tierY + 50, 16, Math.PI, 0);
        ctx.lineTo(kX + 16, tierY + 90);
        ctx.lineTo(kX - 16, tierY + 90);
        ctx.closePath();
        ctx.fill();

        // Carved deity silhouette in gold highlight
        ctx.fillStyle = '#fed68a';
        ctx.beginPath();
        ctx.arc(kX, tierY + 45, 6, 0, Math.PI * 2); // Mukut / Head
        ctx.fill();
        ctx.fillRect(kX - 8, tierY + 52, 16, 24);   // Torso & arms

        // Ornate Kudu horseshoe arch frame
        ctx.strokeStyle = '#ffecc0';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(kX, tierY + 50, 18, Math.PI, 0);
        ctx.stroke();

        // Kirtimukha finial crest on arch top
        ctx.fillStyle = '#fff4d0';
        ctx.beginPath();
        ctx.arc(kX, tierY + 30, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Pilaster columns between niches
      for (let pX = 56; pX < size; pX += 64) {
        ctx.fillStyle = '#e8a958';
        ctx.fillRect(pX - 4, tierY + 22, 8, 80);
        ctx.strokeStyle = '#fff0c8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(pX - 4, tierY + 22, 8, 80);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  createDravidianAdhisthanaTexture(size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Warm deep illuminated granite
    ctx.fillStyle = '#b6732e';
    ctx.fillRect(0, 0, size, size);

    // 1. Upana (Bottom molding)
    ctx.fillStyle = '#7a4515';
    ctx.fillRect(0, size - 40, size, 40);

    // 2. Gaja-Pitha (Row of Carved Temple Elephants along base)
    const elephantW = 48;
    for (let ex = 10; ex < size; ex += elephantW + 16) {
      const ey = size - 110;
      // Elephant Body
      ctx.fillStyle = '#fed18c';
      ctx.beginPath();
      ctx.arc(ex + 24, ey + 24, 18, 0, Math.PI * 2);
      ctx.fill();
      // Head & Trunk
      ctx.beginPath();
      ctx.arc(ex + 12, ey + 18, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(ex + 6, ey + 22, 6, 24); // Trunk curving
      // Ivory Tusk
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(ex + 8, ey + 28);
      ctx.lineTo(ex + 2, ey + 36);
      ctx.lineTo(ex + 10, ey + 34);
      ctx.closePath();
      ctx.fill();
      // Legs
      ctx.fillStyle = '#fed18c';
      ctx.fillRect(ex + 14, ey + 38, 8, 18);
      ctx.fillRect(ex + 28, ey + 38, 8, 18);
      // Howdah / ornamental saddle
      ctx.fillStyle = '#d94b18';
      ctx.fillRect(ex + 18, ey + 10, 14, 10);
    }

    // 3. Padma (Carved Lotus Petals band)
    const petalW = 24;
    for (let px = 0; px < size; px += petalW) {
      ctx.fillStyle = '#ffe2a6';
      ctx.beginPath();
      ctx.arc(px + petalW / 2, 140, petalW / 2, 0, Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#8a4b14';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 4. Kumuda (Rounded molding with golden highlight)
    const kumudaGrad = ctx.createLinearGradient(0, 60, 0, 120);
    kumudaGrad.addColorStop(0, '#e09848');
    kumudaGrad.addColorStop(0.5, '#fff0c0');
    kumudaGrad.addColorStop(1, '#66340a');
    ctx.fillStyle = kumudaGrad;
    ctx.fillRect(0, 60, size, 60);

    // 5. Yali / Rosette diamond carvings
    ctx.strokeStyle = '#ffeed0';
    ctx.lineWidth = 3;
    for (let dx = 20; dx < size; dx += 40) {
      ctx.beginPath();
      ctx.moveTo(dx, 20);
      ctx.lineTo(dx + 12, 35);
      ctx.lineTo(dx, 50);
      ctx.lineTo(dx - 12, 35);
      ctx.closePath();
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  createDvarapalaReliefTexture(size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Deep illuminated temple niche background
    ctx.fillStyle = '#261204';
    ctx.fillRect(0, 0, size, size);

    // Ornate Carved Archway Stone Frame (Makara Torana)
    ctx.strokeStyle = '#e69f4e';
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.arc(size / 2, 160, 150, Math.PI, 0);
    ctx.lineTo(size / 2 + 150, size - 20);
    ctx.lineTo(size / 2 - 150, size - 20);
    ctx.closePath();
    ctx.stroke();

    // Inner Gold Bevel
    ctx.strokeStyle = '#ffd885';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(size / 2, 160, 140, Math.PI, 0);
    ctx.lineTo(size / 2 + 140, size - 20);
    ctx.lineTo(size / 2 - 140, size - 20);
    ctx.stroke();

    // Dvarapala Guardian Deity Figure (Warm Stone Lit Relief)
    const cx = size / 2;

    // 1. Tall Conical Crown (Kirita Mukuta)
    ctx.fillStyle = '#ffdf96';
    ctx.beginPath();
    ctx.moveTo(cx, 40);
    ctx.lineTo(cx + 28, 120);
    ctx.lineTo(cx - 28, 120);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#8a420b';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Mukuta Jewels
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.arc(cx, 80, 7, 0, Math.PI * 2);
    ctx.fill();

    // 2. Head & Divine Halo (Prabhavali)
    ctx.fillStyle = 'rgba(255, 180, 50, 0.4)';
    ctx.beginPath();
    ctx.arc(cx, 130, 48, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fed38b';
    ctx.beginPath();
    ctx.arc(cx, 140, 26, 0, Math.PI * 2);
    ctx.fill();

    // Sacred Tilak & Eyes
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(cx - 3, 128, 6, 14);

    // 3. Broad Muscular Torso & Chest Jewels (Hara)
    ctx.fillStyle = '#f8b965';
    ctx.beginPath();
    ctx.moveTo(cx - 45, 170);
    ctx.lineTo(cx + 45, 170);
    ctx.lineTo(cx + 32, 270);
    ctx.lineTo(cx - 32, 270);
    ctx.closePath();
    ctx.fill();

    // Golden Sacred Thread (Yajnopavita) & Necklaces
    ctx.strokeStyle = '#fff0ba';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, 178, 25, 0, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 25, 170);
    ctx.lineTo(cx + 25, 270);
    ctx.stroke();

    // 4. Four Arms & Sacred Mace (Gada)
    // Left Arm resting on Mace
    ctx.fillStyle = '#e8a34f';
    ctx.fillRect(cx - 75, 180, 24, 75);
    // Right Arm in Tarjani / Abhaya mudra
    ctx.fillRect(cx + 50, 180, 24, 70);

    // Grand Heavy Gada (Mace)
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(cx - 78, 250, 18, 180); // Shaft
    ctx.beginPath();
    ctx.arc(cx - 69, 440, 28, 0, Math.PI * 2); // Head of Mace
    ctx.fill();
    ctx.strokeStyle = '#7a3e0b';
    ctx.lineWidth = 4;
    ctx.stroke();

    // 5. Waistband (Katisutra) & Draped Dhoti
    ctx.fillStyle = '#ffd175';
    ctx.fillRect(cx - 42, 270, 84, 20);

    ctx.fillStyle = '#d47f25';
    ctx.beginPath();
    ctx.moveTo(cx - 36, 290);
    ctx.lineTo(cx + 36, 290);
    ctx.lineTo(cx + 45, 430);
    ctx.lineTo(cx - 45, 430);
    ctx.closePath();
    ctx.fill();

    // Fold lines in stone
    ctx.strokeStyle = '#fff2c6';
    ctx.lineWidth = 2.5;
    for (let fY = 310; fY < 430; fY += 25) {
      ctx.beginPath();
      ctx.moveTo(cx - 35, fY);
      ctx.quadraticCurveTo(cx, fY + 15, cx + 35, fY);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  // Authentic Ancient Lathe-Turned & Sculpted Temple Pillar (Stambha) Texture
  createAncientPillarTexture(size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Warm weathered ancient granite/sandstone base
    const baseGrad = ctx.createLinearGradient(0, 0, 0, size);
    baseGrad.addColorStop(0, '#5a3d24');
    baseGrad.addColorStop(0.3, '#8e653e');
    baseGrad.addColorStop(0.7, '#6e4a2a');
    baseGrad.addColorStop(1, '#4e331b');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, size, size);

    // Stone grain noise
    for (let i = 0; i < 4000; i++) {
      const nx = Math.random() * size;
      const ny = Math.random() * size;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 230, 180, 0.12)' : 'rgba(20, 10, 5, 0.15)';
      ctx.fillRect(nx, ny, 2, 2);
    }

    // Carved Lathe-Turned Annular Rings & Mouldings
    const ringYPositions = [32, 70, 120, 175, 230, 290, 360, 420, 475];
    ringYPositions.forEach((y, idx) => {
      // Shaded groove under ring
      ctx.fillStyle = '#221105';
      ctx.fillRect(0, y, size, 8);

      // Highlighted convex bead ring
      const ringGrad = ctx.createLinearGradient(0, y - 12, 0, y);
      ringGrad.addColorStop(0, '#422510');
      ringGrad.addColorStop(0.5, '#deb07a');
      ringGrad.addColorStop(1, '#663914');
      ctx.fillStyle = ringGrad;
      ctx.fillRect(0, y - 12, size, 12);

      // Lotus petal / Bead chain carving on alternating rings
      if (idx % 2 === 0) {
        ctx.fillStyle = '#fedda2';
        for (let bx = 10; bx < size; bx += 20) {
          ctx.beginPath();
          ctx.arc(bx, y - 6, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    // Vertical fluting channels along pillar mid-shaft
    ctx.strokeStyle = 'rgba(25, 12, 5, 0.35)';
    ctx.lineWidth = 3;
    for (let fx = 16; fx < size; fx += 28) {
      ctx.beginPath();
      ctx.moveTo(fx, 130);
      ctx.lineTo(fx, 280);
      ctx.stroke();

      // Golden highlight on rib edge
      ctx.strokeStyle = 'rgba(255, 220, 150, 0.25)';
      ctx.beginPath();
      ctx.moveTo(fx + 2, 130);
      ctx.lineTo(fx + 2, 280);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(25, 12, 5, 0.35)';
    }

    // Carved miniature shrine devatas on lower shaft
    for (let nx = 32; nx < size; nx += 128) {
      // Miniature niche arch
      ctx.strokeStyle = '#ffd885';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(nx + 32, 440, 20, Math.PI, 0);
      ctx.lineTo(nx + 52, 490);
      ctx.lineTo(nx + 12, 490);
      ctx.closePath();
      ctx.stroke();

      // Deep niche shadow
      ctx.fillStyle = 'rgba(20, 8, 2, 0.6)';
      ctx.fill();

      // Deity silhouette
      ctx.fillStyle = '#e8b878';
      ctx.beginPath();
      ctx.arc(nx + 32, 450, 7, 0, Math.PI * 2); // head
      ctx.fill();
      ctx.fillRect(nx + 28, 458, 8, 22); // body
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  // Ancient Mandapa Colonnade Back Wall Texture
  createAncientMandapaWallTexture(size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Ancient Granite Ashlar Blocks
    ctx.fillStyle = '#61442d';
    ctx.fillRect(0, 0, size, size);

    // Stone block courses
    ctx.strokeStyle = '#28170c';
    ctx.lineWidth = 3;
    const rowH = 48;
    for (let y = 0; y < size; y += rowH) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();

      const offset = (y / rowH) % 2 === 0 ? 0 : 36;
      for (let x = offset; x < size; x += 72) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + rowH);
        ctx.stroke();
      }
    }

    // Recessed Devakoshtha Niche Shrines
    for (let nx = 64; nx < size; nx += 160) {
      // Shaded Niche Pocket
      ctx.fillStyle = '#1c0e05';
      ctx.fillRect(nx - 40, 100, 80, 220);

      // Carved Pilasters on Niche Flanks
      ctx.fillStyle = '#b07f4e';
      ctx.fillRect(nx - 46, 90, 10, 240);
      ctx.fillRect(nx + 36, 90, 10, 240);

      // Torana Arch Pediment over niche
      ctx.strokeStyle = '#ffd885';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(nx, 100, 44, Math.PI, 0);
      ctx.stroke();

      // Sculpted Dancing Deity Silhouette
      ctx.fillStyle = '#f0be7c';
      ctx.beginPath();
      ctx.arc(nx, 150, 12, 0, Math.PI * 2); // Head
      ctx.fill();
      ctx.fillRect(nx - 8, 164, 16, 40); // Torso
      ctx.fillRect(nx - 14, 204, 10, 50); // Left Leg
      ctx.fillRect(nx + 4, 204, 10, 50);  // Right Leg

      // Four Divine Arms
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#f0be7c';
      ctx.beginPath();
      ctx.moveTo(nx - 8, 172);
      ctx.lineTo(nx - 28, 150);
      ctx.moveTo(nx + 8, 172);
      ctx.lineTo(nx + 28, 150);
      ctx.moveTo(nx - 8, 180);
      ctx.lineTo(nx - 26, 195);
      ctx.moveTo(nx + 8, 180);
      ctx.lineTo(nx + 26, 195);
      ctx.stroke();
    }

    // Base Plinth Frieze: Elephant & Lion Procession
    ctx.fillStyle = '#422812';
    ctx.fillRect(0, size - 70, size, 70);
    ctx.strokeStyle = '#deb07a';
    ctx.lineWidth = 2;
    for (let ex = 20; ex < size; ex += 60) {
      ctx.fillStyle = '#d99e5b';
      ctx.beginPath();
      ctx.arc(ex + 14, size - 45, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(ex + 2, size - 40, 24, 20); // body
      ctx.fillRect(ex + 20, size - 35, 6, 26); // trunk
      ctx.fillRect(ex + 4, size - 20, 6, 16);  // legs
      ctx.fillRect(ex + 18, size - 20, 6, 16);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 1);
    return tex;
  }

  // Stepped Stone Slab Coffered Ceiling Texture
  createMandapaCeilingTexture(size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Ancient Soot-Aged Temple Stone
    ctx.fillStyle = '#4a3424';
    ctx.fillRect(0, 0, size, size);

    // Coffered Ceiling Grid
    const grid = 128;
    for (let cy = 0; cy < size; cy += grid) {
      for (let cx = 0; cx < size; cx += grid) {
        // Recessed pocket
        const grad = ctx.createRadialGradient(cx + grid/2, cy + grid/2, 10, cx + grid/2, cy + grid/2, grid/2);
        grad.addColorStop(0, '#755136');
        grad.addColorStop(0.8, '#331f10');
        grad.addColorStop(1, '#201208');
        ctx.fillStyle = grad;
        ctx.fillRect(cx + 6, cy + 6, grid - 12, grid - 12);

        // Center Carved Lotus Rosette (Padma-Mandala)
        const mx = cx + grid / 2;
        const my = cy + grid / 2;
        ctx.fillStyle = '#d69e62';
        for (let p = 0; p < 8; p++) {
          const angle = (p / 8) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(mx + Math.cos(angle) * 16, my + Math.sin(angle) * 16, 9, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#fedba0';
        ctx.beginPath();
        ctx.arc(mx, my, 8, 0, Math.PI * 2);
        ctx.fill();

        // Stone border bevel
        ctx.strokeStyle = '#deb07a';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx + 4, cy + 4, grid - 8, grid - 8);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    return tex;
  }

  initCoreMaterials() {
    this.materials.sandstone = new THREE.MeshStandardMaterial({
      color: 0xdeb887,
      roughness: 0.82,
      metalness: 0.05,
      map: this.textures.sandstoneAlbedo,
      normalMap: this.textures.sandstoneNormal,
      normalScale: new THREE.Vector2(0.8, 0.8)
    });

    // Sculpted Lathe-Turned Ancient Granite/Sandstone Mandapa Pillars
    this.materials.ancientGranitePillar = new THREE.MeshStandardMaterial({
      color: 0xcaa078,
      roughness: 0.65,
      metalness: 0.18,
      map: this.textures.mandapaPillarAlbedo,
      normalMap: this.textures.sandstoneNormal,
      normalScale: new THREE.Vector2(1.5, 1.5)
    });

    // Mandapa Colonnade Carved Inner Wall
    this.materials.mandapaWall = new THREE.MeshStandardMaterial({
      color: 0xb58c65,
      roughness: 0.82,
      metalness: 0.1,
      map: this.textures.mandapaWallAlbedo,
      normalMap: this.textures.sandstoneNormal,
      normalScale: new THREE.Vector2(1.2, 1.2)
    });

    // Heavy Stone Cross-Lintel Beams & Architraves
    this.materials.ancientStoneLintel = new THREE.MeshStandardMaterial({
      color: 0x9e754d,
      roughness: 0.75,
      metalness: 0.12,
      map: this.textures.sandstoneAlbedo,
      normalMap: this.textures.sandstoneNormal,
      normalScale: new THREE.Vector2(1.0, 1.0)
    });

    // Coffered Stone Ceiling Slabs
    this.materials.mandapaCeiling = new THREE.MeshStandardMaterial({
      color: 0x825e3c,
      roughness: 0.85,
      metalness: 0.08,
      map: this.textures.mandapaCeilingAlbedo,
      side: THREE.DoubleSide
    });

    this.materials.templeFloor = new THREE.MeshStandardMaterial({
      color: 0x7a695d,
      roughness: 0.4,
      metalness: 0.2,
      map: this.textures.floorAlbedo,
      normalMap: this.textures.floorNormal,
      normalScale: new THREE.Vector2(1.0, 1.0)
    });

    this.materials.divineGold = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.22,
      metalness: 0.95,
      emissive: 0x664400,
      emissiveIntensity: 0.35,
      map: this.textures.goldAlbedo,
      normalMap: this.textures.goldNormal
    });

    this.materials.templeBrass = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.38,
      metalness: 0.88,
      emissive: 0x332200,
      emissiveIntensity: 0.15
    });

    this.materials.saffronCloth = new THREE.MeshStandardMaterial({
      color: 0xff7700,
      roughness: 0.9,
      metalness: 0.02,
      side: THREE.DoubleSide
    });

    this.materials.crimsonCloth = new THREE.MeshStandardMaterial({
      color: 0xb71540,
      roughness: 0.75,
      metalness: 0.08,
      side: THREE.DoubleSide
    });

    this.materials.mushakFur = new THREE.MeshStandardMaterial({
      color: 0x966842,
      roughness: 0.7,
      metalness: 0.1,
      emissive: 0x221105,
      emissiveIntensity: 0.15
    });

    this.materials.mushakBelly = new THREE.MeshStandardMaterial({
      color: 0xf5ebd6,
      roughness: 0.85,
      metalness: 0.05
    });

    this.materials.ganeshaSkin = new THREE.MeshStandardMaterial({
      color: 0xe07a5f,
      roughness: 0.55,
      metalness: 0.15,
      emissive: 0x3d140e,
      emissiveIntensity: 0.2
    });

    this.materials.diyaFlame = new THREE.MeshBasicMaterial({
      color: 0xffeaa7,
      transparent: true,
      opacity: 0.95
    });

    this.materials.divineStar = new THREE.MeshStandardMaterial({
      color: 0xfffa65,
      emissive: 0xffaa00,
      emissiveIntensity: 0.85,
      roughness: 0.15,
      metalness: 0.9
    });

    this.materials.rangoli = new THREE.MeshStandardMaterial({
      map: this.textures.rangoli,
      transparent: true,
      roughness: 0.9,
      metalness: 0.0,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -4,
      depthWrite: false
    });

    // Outer Temple Perimeter Wall
    this.materials.templeWall = new THREE.MeshStandardMaterial({
      color: 0xcaa078,
      roughness: 0.85,
      metalness: 0.08,
      map: this.textures.wallAlbedo,
      normalMap: this.textures.sandstoneNormal,
      normalScale: new THREE.Vector2(1.2, 1.2)
    });

    // Sacred Ghats / Causeway Balustrade Stone
    this.materials.stoneRailing = new THREE.MeshStandardMaterial({
      color: 0x9b7858,
      roughness: 0.7,
      metalness: 0.15,
      map: this.textures.sandstoneAlbedo
    });

    // Sacred Water Canal / River (Crystal Clear Maldives Turquoise Lagoon)
    this.materials.sacredWater = new THREE.MeshStandardMaterial({
      color: 0x00c4cc,
      emissive: 0x003d44,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.88,
      roughness: 0.05,
      metalness: 0.2,
      map: this.textures.water
    });

    // Sacred Banyan Tree Foliage
    this.materials.treeFoliage = new THREE.MeshStandardMaterial({
      color: 0x3d7038,
      roughness: 0.8,
      metalness: 0.05,
      map: this.textures.foliage,
      side: THREE.DoubleSide
    });

    // Banyan Tree Bark
    this.materials.treeBark = new THREE.MeshStandardMaterial({
      color: 0x4a3525,
      roughness: 0.92,
      metalness: 0.02,
      map: this.textures.treeBark
    });

    // Valley Floor Lush Green Landscape
    this.materials.valleyTerrain = new THREE.MeshStandardMaterial({
      color: 0x2e5e24,
      roughness: 0.9,
      metalness: 0.02
    });

    // Deep Cliff Rock Face
    this.materials.cliffStone = new THREE.MeshStandardMaterial({
      color: 0x4a3220,
      roughness: 0.88,
      metalness: 0.05,
      map: this.textures.sandstoneAlbedo
    });

    // Low Drifting Atmospheric Mist / Cloud Planes
    this.materials.mistCloud = new THREE.MeshBasicMaterial({
      color: 0xffeedd,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    // River Sandbank / Ghat Sand
    this.materials.riverBedSand = new THREE.MeshStandardMaterial({
      color: 0xc49a6c,
      roughness: 0.95
    });

    // Tumbling Cliff Waterfall
    this.materials.waterfall = new THREE.MeshBasicMaterial({
      color: 0xd6f7fc,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide
    });

    // --- HIMALAYAN SNOW BIOME MATERIALS ---

    // 1. Pristine Himalayan Snow Blanket
    this.materials.himalayanSnow = new THREE.MeshStandardMaterial({
      color: 0xf2f8ff,
      roughness: 0.85,
      metalness: 0.05
    });

    // 2. Frosted Mountain Sandstone
    this.materials.frostedStone = new THREE.MeshStandardMaterial({
      color: 0xa89382,
      roughness: 0.8,
      metalness: 0.1,
      map: this.textures.sandstoneAlbedo
    });

    // 3. Translucent Crystalline Ice
    this.materials.frozenIce = new THREE.MeshStandardMaterial({
      color: 0xb5e8ff,
      emissive: 0x004466,
      emissiveIntensity: 0.2,
      roughness: 0.08,
      metalness: 0.35,
      transparent: true,
      opacity: 0.85
    });

    // 4. Himalayan Deodar Pine Needles
    this.materials.himalayanPine = new THREE.MeshStandardMaterial({
      color: 0x143422,
      roughness: 0.85,
      metalness: 0.02
    });

    // 5. Frozen Ice Waterfall
    this.materials.frozenWaterfall = new THREE.MeshBasicMaterial({
      color: 0xdcf4ff,
      transparent: true,
      opacity: 0.82,
      side: THREE.DoubleSide
    });

    // Glowing Brazier Fire / Sacred Homa Kund Flame
    this.materials.brazierFire = new THREE.MeshBasicMaterial({
      color: 0xffaa22
    });

    // --- DRAVIDIAN BRIHADEESWARAR TEMPLE MATERIALS ---
    // Warm Illuminated Granite (Floodlit Night Stone)
    this.materials.dravidianStone = new THREE.MeshStandardMaterial({
      color: 0xe6a862,
      roughness: 0.72,
      metalness: 0.12,
      emissive: 0x3d2109,
      emissiveIntensity: 0.18,
      map: this.textures.sandstoneAlbedo,
      normalMap: this.textures.gopuramNormal,
      normalScale: new THREE.Vector2(1.5, 1.5)
    });

    // Multi-Tiered Gopuram Carved Facade
    this.materials.gopuramTier = new THREE.MeshStandardMaterial({
      color: 0xf3b86e,
      roughness: 0.68,
      metalness: 0.15,
      emissive: 0x4a280c,
      emissiveIntensity: 0.22,
      map: this.textures.gopuramAlbedo,
      normalMap: this.textures.gopuramNormal,
      normalScale: new THREE.Vector2(1.8, 1.8)
    });

    // Carved Adhisthana Plinth Base with Elephants & Moldings
    this.materials.adhisthanaBase = new THREE.MeshStandardMaterial({
      color: 0xdeb076,
      roughness: 0.75,
      metalness: 0.1,
      emissive: 0x331904,
      emissiveIntensity: 0.15,
      map: this.textures.adhisthanaAlbedo,
      normalMap: this.textures.sandstoneNormal,
      normalScale: new THREE.Vector2(1.2, 1.2)
    });

    // Sculpted Dvarapala Guardian Deity Niche Panel
    this.materials.dvarapalaNiche = new THREE.MeshStandardMaterial({
      color: 0xffd394,
      roughness: 0.6,
      metalness: 0.18,
      emissive: 0x542908,
      emissiveIntensity: 0.25,
      map: this.textures.dvarapalaAlbedo
    });

    // Architectural Ground Floodlight Fixture
    this.materials.floodlightFixture = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.4,
      metalness: 0.8
    });

    // Floodlight Warm Amber Lens Glow
    this.materials.floodlightGlow = new THREE.MeshBasicMaterial({
      color: 0xffe294
    });

    // Manicured Round Topiary Shrub (From reference photograph)
    this.materials.topiaryShrub = new THREE.MeshStandardMaterial({
      color: 0x1f471e,
      roughness: 0.88,
      metalness: 0.04
    });

    // Courtyard Approach Metal/Stone Railing
    this.materials.templeRail = new THREE.MeshStandardMaterial({
      color: 0x2b2b2b,
      roughness: 0.35,
      metalness: 0.85
    });
  }
}
