import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

// Nested disclosure used inside an expanded card (plan §7 Airline & PNR,
// §10 Costing History) so a fully expanded result stays scannable.
export const CollapsibleSection = ({ title, anchor, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={`sr-section${open ? ' is-open' : ''}`} data-section={anchor} aria-label={title}>
      <button
        type="button"
        className="sr-section-head sr-section-toggle"
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
      >
        <span className="sr-section-title">{title}</span>
        <span className="sr-chevron" data-expanded={open} aria-hidden="true"><ChevronDown size={16} /></span>
      </button>
      {open && <div className="sr-section-body">{children}</div>}
    </section>
  );
};

export default CollapsibleSection;
