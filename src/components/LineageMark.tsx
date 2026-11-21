import React from 'react';

/** Family-tree icon: three linked people (used for "Family tree" menus). The logo is BrandMark. */
export default function LineageMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className={className} aria-hidden="true">
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="5" cy="19" r="2.5" />
      <circle cx="19" cy="19" r="2.5" />
      <path d="M12 7.5v5M12 12.5L6 16.8M12 12.5l6 4.3" />
    </svg>
  );
}
