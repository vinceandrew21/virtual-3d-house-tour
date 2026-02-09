'use client';

import { Hotspot } from '@/types/tour';

interface HotspotTooltipProps {
  hotspot: Hotspot;
  x: number;
  y: number;
}

const typeLabels: Record<string, string> = {
  info: 'Info',
  navigation: 'Navigate',
  image: 'View Image',
  video: 'Watch Video',
  link: 'Open Link',
};

const typeIcons: Record<string, string> = {
  info: 'ℹ',
  navigation: '→',
  image: '🖼',
  video: '▶',
  link: '↗',
};

export default function HotspotTooltip({ hotspot, x, y }: HotspotTooltipProps) {
  return (
    <div
      className="hotspot-tooltip"
      style={{
        left: `${x + 16}px`,
        top: `${y - 20}px`,
      }}
      role="tooltip"
      aria-live="polite"
    >
      <span className="hotspot-tooltip-icon">{typeIcons[hotspot.type] || 'ℹ'}</span>
      <div className="hotspot-tooltip-text">
        <span className="hotspot-tooltip-label">{hotspot.tooltip || typeLabels[hotspot.type]}</span>
        <span className="hotspot-tooltip-type">{typeLabels[hotspot.type]}</span>
      </div>
    </div>
  );
}
