import * as THREE from 'three';

/**
 * Procedural texture generators for Subway Surfers arcade railway aesthetics.
 * Vibrant daylight urban railway, graffiti street art, red/orange subway trains, mystery boxes, and powerups.
 */

// Procedural railway bed with ballast stone, wooden sleepers, and shining steel rails
export function createRailwayTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Warm sunlight ballast rock gravel base
  ctx.fillStyle = '#333842';
  ctx.fillRect(0, 0, 1024, 1024);

  // Gravel grain noise
  const imgData = ctx.getImageData(0, 0, 1024, 1024);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 36;
    data[i] = Math.max(0, Math.min(255, data[i] + grain));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + grain + 2));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + grain + 6));
  }
  ctx.putImageData(imgData, 0, 0);

  // Track retaining curbs (concrete edges with yellow hazard trim)
  ctx.fillStyle = '#1e2530';
  ctx.fillRect(0, 0, 42, 1024);
  ctx.fillRect(982, 0, 42, 1024);

  // Vibrant yellow safety curb lines
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(42, 0);
  ctx.lineTo(42, 1024);
  ctx.moveTo(982, 0);
  ctx.lineTo(982, 1024);
  ctx.stroke();

  // 3 Track Centers across 1024px:
  // Track -1 (Left): X ~ 205
  // Track 0 (Center): X ~ 512
  // Track 1 (Right): X ~ 819
  const trackCenters = [205, 512, 819];
  const railGauge = 112;
  const sleeperCount = 16;
  const sleeperHeight = 32;
  const sleeperSpacing = 1024 / sleeperCount;

  // Draw Wooden Railway Ties (Travessas de carris)
  for (const cx of trackCenters) {
    for (let s = 0; s < sleeperCount; s++) {
      const y = s * sleeperSpacing + 6;
      const sleeperWidth = 176;
      const sx = cx - sleeperWidth / 2;

      // Dark rich wood
      ctx.fillStyle = '#452718';
      ctx.fillRect(sx, y, sleeperWidth, sleeperHeight);
      ctx.strokeStyle = '#27150c';
      ctx.lineWidth = 2;
      ctx.strokeRect(sx, y, sleeperWidth, sleeperHeight);

      // Steel tie plates / rail spikes
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(cx - railGauge / 2 - 8, y + 8, 16, sleeperHeight - 16);
      ctx.fillRect(cx + railGauge / 2 - 8, y + 8, 16, sleeperHeight - 16);
    }
  }

  // Draw Polished Steel Rails
  for (const cx of trackCenters) {
    const railL = cx - railGauge / 2;
    const railR = cx + railGauge / 2;

    for (const rx of [railL, railR]) {
      // Cast rail shadow
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(rx - 8, 0, 16, 1024);

      // Silver polished rail top with bright sunlight gleam
      const grad = ctx.createLinearGradient(rx - 5, 0, rx + 5, 0);
      grad.addColorStop(0, '#64748b');
      grad.addColorStop(0.3, '#cbd5e1');
      grad.addColorStop(0.5, '#ffffff'); // bright sun gleam
      grad.addColorStop(0.7, '#94a3b8');
      grad.addColorStop(1, '#475569');

      ctx.fillStyle = grad;
      ctx.fillRect(rx - 5, 0, 10, 1024);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural texture for Subway Trains with vibrant graffiti tags
export function createSubwayTrainTexture(primaryColor: string = '#dc2626'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Train metal base
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 512, 512);

  // Vibrant train car body
  ctx.fillStyle = primaryColor;
  ctx.fillRect(0, 110, 512, 230);

  // Bold Subway racing/caution stripes
  ctx.fillStyle = '#fbbf24'; // Yellow stripe
  ctx.fillRect(0, 90, 512, 20);
  ctx.fillStyle = '#ffffff'; // White stripe
  ctx.fillRect(0, 340, 512, 16);
  ctx.fillStyle = '#0f172a'; // Lower chassis skirt
  ctx.fillRect(0, 356, 512, 156);

  // Passenger windows
  const winCount = 4;
  const winW = 72;
  const winH = 52;
  const spacing = 512 / winCount;

  for (let i = 0; i < winCount; i++) {
    const wx = i * spacing + 28;
    const wy = 165;

    // Window rubber seal
    ctx.fillStyle = '#020617';
    ctx.fillRect(wx - 4, wy - 4, winW + 8, winH + 8);

    // Glass reflection
    const winGrad = ctx.createLinearGradient(wx, wy, wx, wy + winH);
    winGrad.addColorStop(0, '#38bdf8');
    winGrad.addColorStop(0.5, '#0284c7');
    winGrad.addColorStop(1, '#0c4a6e');
    ctx.fillStyle = winGrad;
    ctx.fillRect(wx, wy, winW, winH);

    // Diagonal sun glare reflection
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.moveTo(wx + 10, wy);
    ctx.lineTo(wx + 26, wy);
    ctx.lineTo(wx + 6, wy + winH);
    ctx.lineTo(wx, wy + winH);
    ctx.closePath();
    ctx.fill();
  }

  // Subway Surfers authentic Graffiti Street Art Tag on the side
  ctx.save();
  ctx.font = '900 42px "Arial Black", sans-serif';
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 10;

  const tags = ['SUBWAY', 'SURFERS', 'JAKE', 'FRESH', 'SPEED'];
  const tagText = tags[Math.floor(Math.random() * tags.length)];

  ctx.fillStyle = '#ec4899'; // Vibrant magenta spray paint
  ctx.strokeStyle = '#fef08a'; // Bright yellow border
  ctx.lineWidth = 7;
  ctx.strokeText(tagText, 130, 310);
  ctx.fillText(tagText, 130, 310);

  // Graffiti paint drips and splatters
  ctx.fillStyle = '#06b6d4';
  ctx.beginPath();
  ctx.arc(75, 295, 10, 0, Math.PI * 2);
  ctx.arc(390, 305, 8, 0, Math.PI * 2);
  ctx.arc(410, 280, 5, 0, Math.PI * 2);
  ctx.fill();

  // Drip lines
  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(170, 315);
  ctx.lineTo(170, 335);
  ctx.moveTo(260, 315);
  ctx.lineTo(260, 342);
  ctx.stroke();

  ctx.restore();

  // Metal ridges along bottom
  ctx.fillStyle = '#334155';
  for (let r = 0; r < 5; r++) {
    ctx.fillRect(0, 375 + r * 18, 512, 6);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural texture for Subway Surfers Mystery Box with Question Mark (?)
export function createMysteryBoxTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Deep Royal Purple background
  ctx.fillStyle = '#7e22ce';
  ctx.fillRect(0, 0, 256, 256);

  // Golden diagonal gift wrapping stripes
  ctx.fillStyle = '#fbbf24';
  const stripeW = 28;
  for (let i = -256; i < 512; i += stripeW * 3) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + stripeW, 0);
    ctx.lineTo(i + stripeW + 256, 256);
    ctx.lineTo(i + 256, 256);
    ctx.closePath();
    ctx.fill();
  }

  // Golden frame border
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, 242, 242);

  // Big Bold Golden Question Mark (?)
  ctx.save();
  ctx.font = '900 130px "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fde047';
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 12;
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 10;
  ctx.strokeText('?', 128, 128);
  ctx.fillText('?', 128, 128);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Brick tunnel texture for subway arch overpasses
export function createBrickTunnelTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#7c2d12'; // Red clay brick
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#431407';
  ctx.lineWidth = 3;

  const rows = 16;
  const cols = 8;
  const h = 256 / rows;
  const w = 256 / cols;

  for (let r = 0; r < rows; r++) {
    const y = r * h;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();

    const offset = (r % 2) * (w / 2);
    for (let c = 0; c < cols + 1; c++) {
      const x = c * w - offset;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + h);
      ctx.stroke();
    }
  }

  // Graffiti tag on brick wall
  ctx.font = '900 24px sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('SUBWAY', 26, 140);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Hoverboard deck texture
export function createHoverboardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Metallic deck base
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 256, 512);

  // Flame graphic (Red/Orange/Yellow)
  const grad = ctx.createLinearGradient(0, 0, 256, 512);
  grad.addColorStop(0, '#ef4444');
  grad.addColorStop(0.5, '#f97316');
  grad.addColorStop(1, '#eab308');
  ctx.fillStyle = grad;

  ctx.beginPath();
  ctx.moveTo(30, 60);
  ctx.lineTo(226, 60);
  ctx.lineTo(190, 450);
  ctx.lineTo(66, 450);
  ctx.closePath();
  ctx.fill();

  // Grip tape black pads
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(50, 100, 156, 120);
  ctx.fillRect(60, 280, 136, 120);

  // Neon cyan center lightning bolt
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(128, 110);
  ctx.lineTo(110, 240);
  ctx.lineTo(146, 240);
  ctx.lineTo(128, 380);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural skyscraper facade texture
export function createBuildingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 256, 512);

  const cols = 8;
  const rows = 24;
  const cellW = 256 / cols;
  const cellH = 512 / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isLit = Math.random() > 0.45;
      if (isLit) {
        ctx.fillStyle = Math.random() > 0.5 ? '#fde047' : '#7dd3fc';
        ctx.fillRect(c * cellW + 3, r * cellH + 3, cellW - 6, cellH - 6);
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(c * cellW + 3, r * cellH + 3, cellW - 6, cellH - 6);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Hazard warning diagonal stripes
export function createHazardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  const stripeW = 32;
  for (let i = -256; i < 512; i += stripeW * 2) {
    ctx.moveTo(i, 0);
    ctx.lineTo(i + stripeW, 0);
    ctx.lineTo(i + stripeW + 256, 256);
    ctx.lineTo(i + 256, 256);
    ctx.closePath();
  }
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Soft radial glow particle
export function createGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(251, 191, 36, 0.9)');
  gradient.addColorStop(0.8, 'rgba(245, 158, 11, 0.25)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
