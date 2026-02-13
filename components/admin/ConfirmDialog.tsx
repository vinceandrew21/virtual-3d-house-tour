'use client';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="admin-dialog-backdrop" onClick={onCancel}>
      <div className="admin-dialog" onClick={e => e.stopPropagation()}>
        <h3 className="admin-dialog-title">{title}</h3>
        <p className="admin-dialog-message">{message}</p>
        <div className="admin-dialog-actions">
          <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={onCancel}>
            Cancel
          </button>
          <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
