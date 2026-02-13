'use client';

import { useState } from 'react';

interface TourFormProps {
  initialValues?: {
    name: string;
    description: string;
    author?: string;
  };
  onSubmit: (values: { name: string; description: string; author?: string }) => Promise<void>;
  submitLabel: string;
}

export default function TourForm({ initialValues, onSubmit, submitLabel }: TourFormProps) {
  const [name, setName] = useState(initialValues?.name || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [author, setAuthor] = useState(initialValues?.author || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        author: author.trim() || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-field">
        <label className="admin-label">Name</label>
        <input
          className="admin-input"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. 123 Oak Street Unit 4A"
          required
        />
        <span className="admin-field-hint">The display name for this property/unit</span>
      </div>

      <div className="admin-field">
        <label className="admin-label">Description</label>
        <textarea
          className="admin-textarea"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe this property..."
          required
        />
      </div>

      <div className="admin-field">
        <label className="admin-label">Author (optional)</label>
        <input
          className="admin-input"
          type="text"
          value={author}
          onChange={e => setAuthor(e.target.value)}
          placeholder="e.g. Virtual Tours Studio"
        />
      </div>

      <div className="admin-form-actions">
        <button
          type="submit"
          className="admin-btn admin-btn-primary"
          disabled={submitting || !name.trim() || !description.trim()}
        >
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
