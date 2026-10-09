import React, { useEffect, useMemo, useState } from 'react';
import FlightCombinationCard from './FlightCombinationCard';
import ResultsToolbar from './ResultsToolbar';
import { EmptyResults, ErrorResults, LoadingResults } from './SearchResultPrimitives';

const durationMinutes = (value) => {
  if (!value) return Number.MAX_SAFE_INTEGER;
  const text = String(value);
  const hours = Number((text.match(/(\d+)\s*h/i) || [])[1] || 0);
  const minutes = Number((text.match(/(\d+)\s*m/i) || [])[1] || 0);
  const onlyMinutes = (!hours && text.match(/(\d+)\s*min/i)) ? Number(text.match(/(\d+)\s*min/i)[1]) : 0;
  const total = hours * 60 + minutes + onlyMinutes;
  return total || Number.MAX_SAFE_INTEGER;
};

const priceValue = (fare) => {
  const total = fare?.total;
  return typeof total === 'number' && Number.isFinite(total) ? total : Number.MAX_SAFE_INTEGER;
};

const sortResults = (results, sort) => {
  if (sort === 'price') {
    return [...results].sort((a, b) => priceValue(a.fare) - priceValue(b.fare));
  }
  if (sort === 'duration') {
    return [...results].sort((a, b) => {
      const aLeg = a.outbound || a.inbound;
      const bLeg = b.outbound || b.inbound;
      return durationMinutes(aLeg?.duration) - durationMinutes(bLeg?.duration);
    });
  }
  return results;
};

/**
 * Renders the normalized combinations returned for one direction search.
 * Owns list-level state: ordering and which cards are expanded.
 * phase: 'idle' | 'loading' | 'results' | 'empty' | 'error'
 */
export const SearchResultsList = ({
  phase,
  results = [],
  error = '',
  query = '',
  selectedId = null,
  onSelect,
  onRetry,
}) => {
  const [sort, setSort] = useState('recommended');
  const [expandedIds, setExpandedIds] = useState(() => new Set());

  useEffect(() => {
    setExpandedIds(new Set());
    setSort('recommended');
  }, [results]);

  const ordered = useMemo(() => sortResults(results, sort), [results, sort]);

  const toggleExpanded = (id) => {
    setExpandedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allExpanded = ordered.length > 0 && ordered.every(item => expandedIds.has(item.id));

  const toggleAll = () => {
    setExpandedIds(allExpanded ? new Set() : new Set(ordered.map(item => item.id)));
  };

  if (phase === 'loading') return <LoadingResults count={3} />;
  if (phase === 'error') return <ErrorResults message={error} onRetry={onRetry} />;
  if (phase === 'empty') return <EmptyResults query={query} />;
  if (phase !== 'results' || !results.length) return null;

  return (
    <div className="sr-list">
      <ResultsToolbar
        count={ordered.length}
        sort={sort}
        onSortChange={setSort}
        allExpanded={allExpanded}
        onToggleAll={toggleAll}
      />
      {ordered.map(combination => (
        <FlightCombinationCard
          key={combination.id}
          combination={combination}
          isSelected={combination.id === selectedId}
          expanded={expandedIds.has(combination.id)}
          onToggleExpand={toggleExpanded}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

export default SearchResultsList;
