'use client';

import { useState } from 'react';

interface PropertyFormProps {
  initialValues?: {
    name: string;
    address?: string;
    clientName?: string;
    contactPhone?: string;
    contactEmail?: string;
    notes?: string;
  };
  onSubmit: (values: {
    name: string;
    address?: string;
    clientName?: string;
    contactPhone?: string;
    contactEmail?: string;
    notes?: string;
  }) => Promise<void>;
  submitLabel: string;
}

export default function PropertyForm({ initialValues, onSubmit, submitLabel }: PropertyFormProps) {
  const [name, setName] = useState(initialValues?.name || '');
  const [address, setAddress] = useState(initialValues?.address || '');
  const [clientName, setClientName] = useState(initialValues?.clientName || '');
  const [contactPhone, setContactPhone] = useState(initialValues?.contactPhone || '');
  const [contactEmail, setContactEmail] = useState(initialValues?.contactEmail || '');
  const [notes, setNotes] = useState(initialValues?.notes || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        address: address.trim() || undefined,
        clientName: clientName.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-field">
        <label className="admin-label">Property / Unit Name *</label>
        <input
          className="admin-input"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Sunrise Apartments Unit 4A"
          required
        />
      </div>

      <div className="admin-field">
        <label className="admin-label">Address</label>
        <input
          className="admin-input"
          type="text"
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="e.g. 123 Oak Street, City, State"
        />
      </div>

      <div className="admin-form-row">
        <div className="admin-field">
          <label className="admin-label">Client Name</label>
          <input
            className="admin-input"
            type="text"
            value={clientName}
            onChange={e => setClientName(e.target.value)}
            placeholder="e.g. John Smith"
          />
        </div>

        <div className="admin-field">
          <label className="admin-label">Contact Phone</label>
          <input
            className="admin-input"
            type="tel"
            value={contactPhone}
            onChange={e => setContactPhone(e.target.value)}
            placeholder="e.g. +1 234 567 8900"
          />
        </div>
      </div>

      <div className="admin-field">
        <label className="admin-label">Contact Email</label>
        <input
          className="admin-input"
          type="email"
          value={contactEmail}
          onChange={e => setContactEmail(e.target.value)}
          placeholder="e.g. client@example.com"
        />
      </div>

      <div className="admin-field">
        <label className="admin-label">Notes</label>
        <textarea
          className="admin-textarea"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Any additional notes about this property..."
        />
      </div>

      <div className="admin-form-actions">
        <button
          type="submit"
          className="admin-btn admin-btn-primary"
          disabled={submitting || !name.trim()}
        >
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
