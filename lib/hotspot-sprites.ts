export function drawNavigationFloorRing(ctx: CanvasRenderingContext2D) {
  const cx = 128, cy = 128;

  // Outer glow — large soft halo
  const glowGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 120);
  glowGrad.addColorStop(0, 'rgba(255,255,255,0.45)');
  glowGrad.addColorStop(0.35, 'rgba(255,255,255,0.15)');
  glowGrad.addColorStop(0.7, 'rgba(255,255,255,0.05)');
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 120, 0, Math.PI * 2);
  ctx.fill();

  // Translucent filled disc
  const discGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50);
  discGrad.addColorStop(0, 'rgba(255,255,255,0.4)');
  discGrad.addColorStop(1, 'rgba(255,255,255,0.12)');
  ctx.fillStyle = discGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 50, 0, Math.PI * 2);
  ctx.fill();

  // Outer ring border
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 50, 0, Math.PI * 2);
  ctx.stroke();

  // Inner ring
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 34, 0, Math.PI * 2);
  ctx.stroke();

  // Center chevron (downward arrow — "walk here")
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(cx, cy + 12);
  ctx.lineTo(cx - 10, cy - 4);
  ctx.lineTo(cx - 4, cy - 4);
  ctx.lineTo(cx - 4, cy - 14);
  ctx.lineTo(cx + 4, cy - 14);
  ctx.lineTo(cx + 4, cy - 4);
  ctx.lineTo(cx + 10, cy - 4);
  ctx.closePath();
  ctx.fill();
}

export function drawHotspotIcon(ctx: CanvasRenderingContext2D, type: string, _customColor?: string) {
  const cx = 64, cy = 64, r = 48;

  // Outer glow — soft white
  const grad = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
  grad.addColorStop(0, 'rgba(255,255,255,0.6)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.2)');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Inner circle
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.beginPath();
  ctx.arc(cx, cy, 16, 0, Math.PI * 2);
  ctx.fill();

  // Outline ring for extra visibility
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 24, 0, Math.PI * 2);
  ctx.stroke();

  // Center icon — black on white
  ctx.fillStyle = '#000000';
  ctx.beginPath();

  switch (type) {
    case 'navigation':
      // Arrow
      ctx.moveTo(cx - 6, cy + 4);
      ctx.lineTo(cx, cy - 8);
      ctx.lineTo(cx + 6, cy + 4);
      ctx.closePath();
      break;
    case 'image':
      // Small square
      ctx.rect(cx - 6, cy - 5, 12, 10);
      break;
    case 'video':
      // Play triangle
      ctx.moveTo(cx - 4, cy - 6);
      ctx.lineTo(cx + 6, cy);
      ctx.lineTo(cx - 4, cy + 6);
      ctx.closePath();
      break;
    case 'link':
      // External link arrow
      ctx.moveTo(cx - 5, cy + 5);
      ctx.lineTo(cx + 5, cy - 5);
      ctx.lineTo(cx + 5, cy);
      ctx.moveTo(cx + 5, cy - 5);
      ctx.lineTo(cx, cy - 5);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#000000';
      ctx.stroke();
      return;
    default:
      // Info dot
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  }
  ctx.fill();
}
