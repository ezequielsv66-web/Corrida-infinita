import * as THREE from 'three';

/**
 * Procedural texture generators.
 * Guarantees zero 404s, zero network requests, high fidelity in any resolution.
 */

// Procedural highway road texture with lane markings
export function createRoadTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Dark asphalt base with asphalt noise
  ctx.fillStyle = '#0f141c';
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle tarmac grain
  const imgData = ctx.getImageData(0, 0, 1024, 1024);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 16;
    data[i] = Math.max(0, Math.min(255, data[i] + grain));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + grain));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + grain + 2)); // slight blue tint
  }
  ctx.putImageData(imgData, 0, 0);

  // Outer safety curbs / neon shoulder lines (Left and Right edges)
  ctx.strokeStyle = '#06b6d4'; // Cyan neon
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 14;
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.moveTo(30, 0);
  ctx.lineTo(30, 1024);
  ctx.moveTo(994, 0);
  ctx.lineTo(994, 1024);
  ctx.stroke();

  // Lane dividers (3 lanes = 2 dividers at 1/3 and 2/3 of roadway)
  // lane 1 is 30..360, lane 2 is 360..664, lane 3 is 664..994
  const dividerX1 = 351;
  const dividerX2 = 672;

  ctx.shadowBlur = 10;
  ctx.shadowColor = '#f59e0b'; // Amber neon dashed line
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 10;
  ctx.setLineDash([70, 50]);

  ctx.beginPath();
  ctx.moveTo(dividerX1, 0);
  ctx.lineTo(dividerX1, 1024);
  ctx.moveTo(dividerX2, 0);
  ctx.lineTo(dividerX2, 1024);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural skyscraper facade texture with illuminated windows
export function createBuildingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0a0d14';
  ctx.fillRect(0, 0, 256, 512);

  // Grid of office/apartment windows
  const cols = 8;
  const rows = 24;
  const cellW = 256 / cols;
  const cellH = 512 / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isLit = Math.random() > 0.45;
      if (isLit) {
        const tone = Math.random();
        if (tone > 0.6) {
          ctx.fillStyle = '#38bdf8'; // Cyan LED
        } else if (tone > 0.3) {
          ctx.fillStyle = '#fde047'; // Warm golden yellow
        } else {
          ctx.fillStyle = '#e2e8f0'; // Cool white
        }
        ctx.fillRect(c * cellW + 4, r * cellH + 4, cellW - 8, cellH - 8);
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(c * cellW + 4, r * cellH + 4, cellW - 8, cellH - 8);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural hazard stripes (black + bright yellow/amber diagonal stripes)
export function createHazardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f59e0b'; // Amber yellow
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = '#111827'; // Dark stripe
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

// Soft radial glow particle texture for sparks and pickup effects
export function createGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(56, 189, 248, 0.8)');
  gradient.addColorStop(0.8, 'rgba(6, 182, 212, 0.2)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
