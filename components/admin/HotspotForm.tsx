'use client';

import { useState } from 'react';
import { HotspotType, Scene } from '@/types/tour';

interface HotspotFormProps {
  scenes: Scene[];
  currentSceneId: string;
  initialValues?: {
    type: HotspotType;
    yaw: number;
    pitch: number;
    tooltip?: string;
    targetScene?: string;
    title?: string;
    content?: string;
    imageUrl?: string;
    videoUrl?: string;
    linkUrl?: string;
  };
  onSubmit: (values: {
    type: HotspotType;
    position: { yaw: number; pitch: number };
    tooltip?: string;
    targetScene?: string;
    title?: string;
    content?: string;
    imageUrl?: string;
    videoUrl?: string;
    linkUrl?: string;
  }) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

export default function HotspotForm({ scenes, currentSceneId, initialValues, onSubmit, onCancel, submitLabel }: HotspotFormProps) {
  const [type, setType] = useState<HotspotType>(initialValues?.type || 'navigation');
  const [yaw, setYaw] = useState(initialValues?.yaw ?? 0);
  const [pitch, setPitch] = useState(initialValues?.pitch ?? -30);
  const [tooltip, setTooltip] = useState(initialValues?.tooltip || '');
  const [targetScene, setTargetScene] = useState(initialValues?.targetScene || '');
  const [title, setTitle] = useState(initialValues?.title || '');
  const [content, setContent] = useState(initialValues?.content || '');
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl || '');
  const [videoUrl, setVideoUrl] = useState(initialValues?.videoUrl || '');
  const [linkUrl, setLinkUrl] = useState(initialValues?.linkUrl || '');
  const [submitting, setSubmitting] = useState(false);

  const otherScenes = scenes.filter(s => s.id !== currentSceneId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const values: Parameters<typeof onSubmit>[0] = {
        type,
        position: { yaw, pitch },
        tooltip: tooltip.trim() || undefined,
      };

      if (type === 'navigation') {
        values.targetScene = targetScene || undefined;
      }
      if (type === 'info') {
        values.title = title.trim() || undefined;
        values.content = content.trim() || undefined;
      }
      if (type === 'image') {
        values.title = title.trim() || undefined;
        values.imageUrl = imageUrl.trim() || undefined;
      }
      if (type === 'video') {
        values.title = title.trim() || undefined;
        values.videoUrl = videoUrl.trim() || undefined;
      }
      if (type === 'link') {
        values.linkUrl = linkUrl.trim() || undefined;
      }

      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-field">
        <label className="admin-label">Type</label>
        <select className="admin-select" value={type} onChange={e => setType(e.target.value as HotspotType)}>
          <option value="navigation">Navigation (link to another room)</option>
          <option value="info">Info (text popup)</option>
          <option value="image">Image (photo popup)</option>
          <option value="video">Video (video popup)</option>
          <option value="link">Link (external URL)</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <div className="admin-field" style={{ flex: 1 }}>
          <label className="admin-label">Yaw (horizontal)</label>
          <input
            className="admin-input"
            type="number"
            value={yaw}
            onChange={e => setYaw(Number(e.target.value))}
            min={-180}
            max={180}
            step={1}
          />
          <span className="admin-field-hint">-180 to 180 degrees. 0 = center of panorama</span>
        </div>
        <div className="admin-field" style={{ flex: 1 }}>
          <label className="admin-label">Pitch (vertical)</label>
          <input
            className="admin-input"
            type="number"
            value={pitch}
            onChange={e => setPitch(Number(e.target.value))}
            min={-90}
            max={90}
            step={1}
          />
          <span className="admin-field-hint">-90 (floor) to 90 (ceiling). -30 is a good floor level</span>
        </div>
      </div>

      <div className="admin-field">
        <label className="admin-label">Tooltip</label>
        <input
          className="admin-input"
          type="text"
          value={tooltip}
          onChange={e => setTooltip(e.target.value)}
          placeholder={type === 'navigation' ? 'e.g. Go to Kitchen' : 'Hover text for this hotspot'}
        />
      </div>

      {/* Navigation-specific fields */}
      {type === 'navigation' && (
        <div className="admin-field">
          <label className="admin-label">Target Room</label>
          <select
            className="admin-select"
            value={targetScene}
            onChange={e => setTargetScene(e.target.value)}
          >
            <option value="">Select a room...</option>
            {otherScenes.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {otherScenes.length === 0 && (
            <span className="admin-field-hint">Add more rooms to this tour first to create navigation links</span>
          )}
        </div>
      )}

      {/* Info-specific fields */}
      {type === 'info' && (
        <>
          <div className="admin-field">
            <label className="admin-label">Title</label>
            <input
              className="admin-input"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Info popup title"
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Content</label>
            <textarea
              className="admin-textarea"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Info popup content text..."
            />
          </div>
        </>
      )}

      {/* Image-specific fields */}
      {type === 'image' && (
        <>
          <div className="admin-field">
            <label className="admin-label">Title</label>
            <input
              className="admin-input"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Image title"
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Image URL</label>
            <input
              className="admin-input"
              type="text"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
            />
          </div>
        </>
      )}

      {/* Video-specific fields */}
      {type === 'video' && (
        <>
          <div className="admin-field">
            <label className="admin-label">Title</label>
            <input
              className="admin-input"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Video title"
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Video URL</label>
            <input
              className="admin-input"
              type="text"
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        </>
      )}

      {/* Link-specific fields */}
      {type === 'link' && (
        <div className="admin-field">
          <label className="admin-label">URL</label>
          <input
            className="admin-input"
            type="text"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </div>
      )}

      <div className="admin-form-actions">
        <button
          type="submit"
          className="admin-btn admin-btn-primary"
          disabled={submitting}
        >
          {submitting ? 'Saving...' : submitLabel}
        </button>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
