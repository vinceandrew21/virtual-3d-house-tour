import * as THREE from 'three';
import { RoomTexture, FurnitureTexture } from '@/types/tour';

const textureCache = new Map<string, THREE.CanvasTexture>();

function getCached(key: string, generate: () => THREE.CanvasTexture): THREE.CanvasTexture {
  if (textureCache.has(key)) return textureCache.get(key)!;
  const tex = generate();
  textureCache.set(key, tex);
  return tex;
}

function hexToRgb(hex: string): [number, number, number] {
  const c = parseInt(hex.replace('#', ''), 16);
  return [(c >> 16) & 255, (c >> 8) & 255, c & 255];
}

function rgbStr(r: number, g: number, b: number): string {
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}

// Seeded random for consistent textures
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateWoodTexture(baseColor: string): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const [br, bg, bb] = hexToRgb(baseColor);
  const rand = seededRandom(42);

  // Base color
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  // Wood planks
  const plankHeight = size / 8;
  for (let i = 0; i < 8; i++) {
    const y = i * plankHeight;

    // Plank base with slight color variation
    const vary = (rand() - 0.5) * 30;
    ctx.fillStyle = rgbStr(br + vary, bg + vary, bb + vary);
    ctx.fillRect(0, y + 1, size, plankHeight - 2);

    // Wood grain lines
    for (let g = 0; g < 12; g++) {
      const gy = y + rand() * plankHeight;
      const alpha = 0.03 + rand() * 0.06;
      ctx.strokeStyle = `rgba(0,0,0,${alpha})`;
      ctx.lineWidth = 0.5 + rand() * 1.5;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      // Slightly wavy grain
      for (let x = 0; x < size; x += 20) {
        ctx.lineTo(x, gy + (rand() - 0.5) * 3);
      }
      ctx.stroke();
    }

    // Plank gap
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(0, y, size, 1.5);

    // Vertical plank joints (staggered)
    const offset = (i % 2) * (size / 3);
    for (let j = 0; j < 3; j++) {
      const jx = offset + j * (size / 2);
      if (jx > 0 && jx < size) {
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(jx, y, 1.5, plankHeight);
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function generateConcreteTexture(baseColor: string): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const [br, bg, bb] = hexToRgb(baseColor);
  const rand = seededRandom(123);

  // Base
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  // Noise speckles
  for (let i = 0; i < 8000; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const v = (rand() - 0.5) * 40;
    const alpha = 0.05 + rand() * 0.1;
    ctx.fillStyle = `rgba(${Math.round(br + v)},${Math.round(bg + v)},${Math.round(bb + v)},${alpha})`;
    ctx.fillRect(x, y, 1 + rand() * 2, 1 + rand() * 2);
  }

  // Subtle patches
  for (let i = 0; i < 20; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 20 + rand() * 60;
    const v = (rand() - 0.5) * 20;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, `rgba(${Math.round(br + v)},${Math.round(bg + v)},${Math.round(bb + v)},0.15)`);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // Fine cracks
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `rgba(0,0,0,${0.03 + rand() * 0.05})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    let x = rand() * size;
    let y = rand() * size;
    ctx.moveTo(x, y);
    for (let s = 0; s < 8; s++) {
      x += (rand() - 0.5) * 80;
      y += (rand() - 0.5) * 80;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function generatePlasterTexture(baseColor: string): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const [br, bg, bb] = hexToRgb(baseColor);
  const rand = seededRandom(77);

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  // Fine noise
  for (let i = 0; i < 5000; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const v = (rand() - 0.5) * 15;
    ctx.fillStyle = `rgba(${Math.round(br + v)},${Math.round(bg + v)},${Math.round(bb + v)},0.08)`;
    ctx.fillRect(x, y, 1 + rand(), 1 + rand());
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function generateTileTexture(baseColor: string): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const [br, bg, bb] = hexToRgb(baseColor);
  const rand = seededRandom(200);

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  const tileSize = size / 8;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const x = col * tileSize;
      const y = row * tileSize;
      const v = (rand() - 0.5) * 12;
      ctx.fillStyle = rgbStr(br + v, bg + v, bb + v);
      ctx.fillRect(x + 1.5, y + 1.5, tileSize - 3, tileSize - 3);
    }
  }

  // Grout lines
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  for (let i = 0; i <= 8; i++) {
    ctx.fillRect(0, i * tileSize - 1, size, 2);
    ctx.fillRect(i * tileSize - 1, 0, 2, size);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function generateCarpetTexture(baseColor: string): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const [br, bg, bb] = hexToRgb(baseColor);
  const rand = seededRandom(300);

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  // Dense fiber-like noise
  for (let i = 0; i < 15000; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const v = (rand() - 0.5) * 25;
    const alpha = 0.04 + rand() * 0.06;
    ctx.fillStyle = `rgba(${Math.round(br + v)},${Math.round(bg + v)},${Math.round(bb + v)},${alpha})`;
    ctx.fillRect(x, y, 1, 1 + rand() * 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function generateFabricTexture(baseColor: string): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const [br, bg, bb] = hexToRgb(baseColor);
  const rand = seededRandom(500);

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  // Weave pattern
  for (let y = 0; y < size; y += 3) {
    for (let x = 0; x < size; x += 3) {
      const v = (rand() - 0.5) * 20;
      ctx.fillStyle = `rgba(${Math.round(br + v)},${Math.round(bg + v)},${Math.round(bb + v)},0.15)`;
      ctx.fillRect(x, y, 2, 2);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function generateMetalTexture(baseColor: string): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const [br, bg, bb] = hexToRgb(baseColor);
  const rand = seededRandom(600);

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  // Brushed metal lines
  for (let y = 0; y < size; y++) {
    const v = (rand() - 0.5) * 10;
    ctx.fillStyle = `rgba(${Math.round(br + v)},${Math.round(bg + v)},${Math.round(bb + v)},0.12)`;
    ctx.fillRect(0, y, size, 1);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function generateLeatherTexture(baseColor: string): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const [br, bg, bb] = hexToRgb(baseColor);
  const rand = seededRandom(700);

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  // Leather pores
  for (let i = 0; i < 3000; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 0.5 + rand() * 1.5;
    ctx.fillStyle = `rgba(0,0,0,${0.02 + rand() * 0.04})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Subtle creases
  for (let i = 0; i < 8; i++) {
    ctx.strokeStyle = `rgba(0,0,0,${0.02 + rand() * 0.03})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    let x = rand() * size;
    let y = rand() * size;
    ctx.moveTo(x, y);
    for (let s = 0; s < 5; s++) {
      x += (rand() - 0.5) * 50;
      y += (rand() - 0.5) * 50;
      ctx.quadraticCurveTo(x + (rand() - 0.5) * 20, y + (rand() - 0.5) * 20, x, y);
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function getRoomTexture(type: RoomTexture, color: string): THREE.CanvasTexture {
  const key = `room-${type}-${color}`;
  return getCached(key, () => {
    switch (type) {
      case 'wood': return generateWoodTexture(color);
      case 'concrete': return generateConcreteTexture(color);
      case 'plaster': return generatePlasterTexture(color);
      case 'tile': return generateTileTexture(color);
      case 'carpet': return generateCarpetTexture(color);
    }
  });
}

export function getFurnitureTexture(type: FurnitureTexture, color: string): THREE.CanvasTexture {
  const key = `furn-${type}-${color}`;
  return getCached(key, () => {
    switch (type) {
      case 'wood': return generateWoodTexture(color);
      case 'fabric': return generateFabricTexture(color);
      case 'metal': return generateMetalTexture(color);
      case 'leather': return generateLeatherTexture(color);
      case 'glass': return generateMetalTexture(color); // subtle for glass
    }
  });
}
