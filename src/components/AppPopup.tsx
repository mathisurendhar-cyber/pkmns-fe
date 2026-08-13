'use client';

import './app-popup.css';

export type AppPopupVariant = 'success' | 'error' | 'info' | 'confirm';

export type AppPopupProps = {
  open: boolean;
  variant?: AppPopupVariant;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onClose: () => void;
  onConfirm?: () => void;
};

const ICONS: Record<AppPopupVariant, string> = {
  success: 'fa-check-circle',
  error: 'fa-exclamation-circle',
  info: 'fa-info-circle',
  confirm: 'fa-question-circle',
};

export default function AppPopup({
  open,
  variant = 'info',
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  onClose,
  onConfirm,
}: AppPopupProps) {
  if (!open) return null;

  const isConfirm = variant === 'confirm' && !!onConfirm;

  return (
    <div className="app-popup-backdrop" onClick={onClose} role="presentation">
      <div
        className={`app-popup app-popup--${variant}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-popup-title"
      >
        <div className="app-popup-icon">
          <i className={`fas ${ICONS[variant]}`} />
        </div>
        <h3 id="app-popup-title">{title}</h3>
        <p>{message}</p>
        <div className="app-popup-actions">
          {isConfirm && (
            <button
              type="button"
              className="app-popup-btn app-popup-btn--ghost"
              onClick={onClose}
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            className="app-popup-btn"
            onClick={() => {
              if (isConfirm && onConfirm) onConfirm();
              else onClose();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
