import React from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

const SORTS = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'price', label: 'Price' },
  { key: 'duration', label: 'Duration' },
];

/**
 * ResultsToolbar — result count, ordering and expand/collapse controls
 * for the combination list (plan §20).
 */
export const ResultsToolbar = ({
  count = 0,
  sort = 'recommended',
  onSortChange,
  allExpanded = false,
  onToggleAll,
}) => (
  <div className="sr-toolbar">
    <span className="sr-toolbar-count">
      {count} flight combination{count === 1 ? '' : 's'} found
    </span>
    <div className="sr-toolbar-controls">
      <label className="sr-toolbar-sort">
        <span>Sort by</span>
        <select
          className="form-select sr-toolbar-select"
          value={sort}
          onChange={(event) => onSortChange?.(event.target.value)}
        >
          {SORTS.map(option => (
            <option key={option.key} value={option.key}>{option.label}</option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="btn btn-secondary sr-toolbar-btn"
        onClick={onToggleAll}
        aria-expanded={allExpanded}
      >
        {allExpanded
          ? <><Minimize2 size={14} /> Collapse all</>
          : <><Maximize2 size={14} /> Expand all</>}
      </button>
    </div>
  </div>
);

export default ResultsToolbar;
