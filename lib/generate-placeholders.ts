// This module generates placeholder equirectangular images on a canvas
// Used when actual 360° photos are not available

export function generatePlaceholderEquirectangular(
  roomName: string,
  width: number = 2048,
  height: number = 1024
): string {
  if (typeof document === 'undefined') return '';

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const colors: Record<string, { primary: string; secondary: string; accent: string }> = {
    'living-room': { primary: '#1a1a2e', secondary: '#16213e', accent: '#e94560' },
    'kitchen': { primary: '#1b1b2f', secondary: '#162447', accent: '#e43f5a' },
    'bedroom': { primary: '#0f0e17', secondary: '#2a2438', accent: '#ff8906' },
    'patio': { primary: '#0b132b', secondary: '#1c2541', accent: '#5bc0be' },
  };

  const scheme = colors[roomName] || colors['living-room'];

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, scheme.primary);
  bgGrad.addColorStop(0.4, scheme.secondary);
  bgGrad.addColorStop(0.6, scheme.secondary);
  bgGrad.addColorStop(1, '#0a0a0a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Grid lines to give spatial reference
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += width / 24) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += height / 12) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Decorative circles/orbs
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = 20 + Math.random() * 80;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, scheme.accent + '30');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Floor plane hint (bottom third)
  const floorGrad = ctx.createLinearGradient(0, height * 0.65, 0, height);
  floorGrad.addColorStop(0, 'transparent');
  floorGrad.addColorStop(1, 'rgba(255,255,255,0.03)');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, height * 0.65, width, height * 0.35);

  // Room name text
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.font = `bold ${Math.floor(height / 8)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const label = roomName.replace(/-/g, ' ').toUpperCase();

  // Draw the name at multiple positions so it's visible from any angle
  for (let i = 0; i < 4; i++) {
    const xPos = (width / 4) * i + width / 8;
    ctx.fillText(label, xPos, height / 2);
  }

  // Subtle noise overlay
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 10;
    data[i] += noise;
    data[i + 1] += noise;
    data[i + 2] += noise;
  }
  ctx.putImageData(imageData, 0, 0);

  return canvas.toDataURL('image/jpeg', 0.85);
}
