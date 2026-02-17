export function drawNavigationFloorRing(ctx: CanvasRenderingContext2D) {
  const cx = 128, cy = 128;

  // Large soft outer glow
  const outerGlow = ctx.createRadialGradient(cx, cy, 40, cx, cy, 125);
  outerGlow.addColorStop(0, 'rgba(255,255,255,0.25)');
  outerGlow.addColorStop(0.5, 'rgba(255,255,255,0.08)');
  outerGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = outerGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, 125, 0, Math.PI * 2);
  ctx.fill();

  // Main ring — thick bright white ring (donut shape)
  ctx.beginPath();
  ctx.arc(cx, cy, 55, 0, Math.PI * 2);
  ctx.arc(cx, cy, 40, 0, Math.PI * 2, true); // counter-clockwise to cut out center
  ctx.closePath();
  const ringGrad = ctx.createRadialGradient(cx, cy, 40, cx, cy, 55);
  ringGrad.addColorStop(0, 'rgba(255,255,255,0.95)');
  ringGrad.addColorStop(0.5, 'rgba(255,255,255,0.85)');
  ringGrad.addColorStop(1, 'rgba(220,220,220,0.7)');
  ctx.fillStyle = ringGrad;
  ctx.fill();

  // Inner glow inside the ring
  const innerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 38);
  innerGlow.addColorStop(0, 'rgba(255,255,255,0.3)');
  innerGlow.addColorStop(0.6, 'rgba(255,255,255,0.1)');
  innerGlow.addColorStop(1, 'rgba(255,255,255,0.05)');
  ctx.fillStyle = innerGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, 38, 0, Math.PI * 2);
  ctx.fill();

  // Outer edge highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 56, 0, Math.PI * 2);
  ctx.stroke();

  // Inner edge highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, 39, 0, Math.PI * 2);
  ctx.stroke();

  // Center chevron arrow pointing up — "go here"
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath();
  ctx.moveTo(cx, cy - 14);       // tip
  ctx.lineTo(cx + 12, cy + 4);   // bottom-right
  ctx.lineTo(cx + 4, cy + 4);
  ctx.lineTo(cx + 4, cy + 12);
  ctx.lineTo(cx - 4, cy + 12);
  ctx.lineTo(cx - 4, cy + 4);
  ctx.lineTo(cx - 12, cy + 4);   // bottom-left
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
