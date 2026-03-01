import React from 'react';
import './resumeCard.css';

export default function ResumeCard({
  image,
  category = '',
  accentCategory = false,
  title = '',
  subtitle = '',
  primaryText,
  secondaryText,
  onPrimary,
  onSecondary,
  onClick,
  className = '',
  style = {}
}) {
  return (
    <div className={`rm-card ${className}`} style={style} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
      {category && (
        <p className={`rm-card__category${accentCategory ? ' rm-card__category--accent' : ''}`}>
          {category}
        </p>
      )}

      <div className={`rm-card__media${!image ? ' rm-card__media--placeholder' : ''}`}>
        {image ? (
          <img src={image} alt={title} />
        ) : (
          <svg
            className="rm-card__placeholder-svg"
            viewBox="0 0 260 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect width="260" height="160" rx="8" fill="#f0f6ff" />
            <rect x="80" y="30" width="100" height="10" rx="5" fill="#bfdbfe" />
            <rect x="60" y="50" width="140" height="8" rx="4" fill="#dbeafe" />
            <rect x="90" y="68" width="80" height="8" rx="4" fill="#3b82f6" opacity="0.35" />
            <circle cx="130" cy="110" r="28" fill="#dbeafe" />
            <rect x="100" y="98" width="60" height="24" rx="6" fill="#93c5fd" />
          </svg>
        )}
      </div>

      <h3 className="rm-card__title">{title}</h3>
      {subtitle && <p className="rm-card__subtitle">{subtitle}</p>}

      {(primaryText || secondaryText) && (
        <div className="rm-card__actions">
          {primaryText && (
            <button type="button" className="rm-btn rm-btn--primary" onClick={onPrimary}>
              {primaryText}
            </button>
          )}
          {secondaryText && (
            <button type="button" className="rm-btn rm-btn--link" onClick={onSecondary}>
              {secondaryText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
