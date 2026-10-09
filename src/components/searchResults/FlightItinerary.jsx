import React from 'react';
import { Plane } from 'lucide-react';
import { DASH, SectionCard } from './SearchResultPrimitives';
import FlightSegment from './FlightSegment';

// One direction: any number of segments joined by connection bars.
export const ItinerarySection = ({ title, anchor, leg, tone = 'outbound' }) => {
  if (!leg || !leg.segments || !leg.segments.length) return null;
  const { segments, connections = [] } = leg;
  return (
    <SectionCard title={title} anchor={anchor}>
      <div className="sr-leg" data-tone={tone}>
        {segments.map((segment, index) => {
          const connection = index < segments.length - 1 ? (connections[index] || '—') : null;
          const next = segments[index + 1];
          return (
            <React.Fragment key={`${segment.id}-${index}`}>
              <FlightSegment segment={segment} />
              {connection && (
                <div className="sr-connection">
                  <span className="sr-connection-label">Connection at {next?.departure?.airport || DASH}</span>
                  <span className="sr-connection-time">{connection}</span>
                </div>
              )}
            </React.Fragment>
          );
        })}
        <div className="sr-leg-footer">
          <span>Total duration: <strong>{leg.duration || DASH}</strong></span>
          <span>{leg.stops || DASH}</span>
        </div>
      </div>
    </SectionCard>
  );
};

// Collapsed one-liner used on the card header (plan §16 default state).
export const ItinerarySummary = ({ leg, label }) => {
  if (!leg || !leg.segments || !leg.segments.length) return null;
  const first = leg.segments[0];
  const last = leg.segments[leg.segments.length - 1];
  return (
    <div className="sr-summary-leg">
      <span className="sr-summary-tag">{label}</span>
      <div className="sr-summary-route">
        <span className="sr-summary-end">
          <strong>{first.departure.airport || DASH}</strong>
          <em>{first.departure.time || DASH}</em>
        </span>
        <span className="sr-summary-path" aria-hidden="true">
          <span className="sr-summary-duration">{leg.duration || DASH}</span>
          <Plane size={13} />
          <span className="sr-summary-stops">{leg.stops || DASH}</span>
        </span>
        <span className="sr-summary-end is-arrival">
          <strong>{last.arrival.airport || DASH}</strong>
          <em>{last.arrival.time || DASH}</em>
        </span>
      </div>
      <div className="sr-summary-cities">
        {first.departure.airportName} → {last.arrival.airportName}
        {leg.segments.length > 1 ? ` · ${leg.segments.length} segments` : ''}
      </div>
    </div>
  );
};
