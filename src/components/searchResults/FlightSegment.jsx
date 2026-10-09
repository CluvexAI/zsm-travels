import React from 'react';
import { PlaneLanding, PlaneTakeoff } from 'lucide-react';
import { AirlineBadge, DASH, PlaneDivider } from './SearchResultPrimitives';

const AirportBlock = ({ kind, endpoint }) => {
  const Icon = kind === 'departure' ? PlaneTakeoff : PlaneLanding;
  return (
    <div className={`sr-airport sr-airport-${kind}`}>
      <div className="sr-airport-top">
        <span className="sr-airport-code">{endpoint.airport || DASH}</span>
        <span className="sr-airport-time">{endpoint.time || DASH}</span>
      </div>
      <div className="sr-airport-date">{endpoint.date || DASH}</div>
      <div className="sr-airport-name">{endpoint.airportName || DASH}</div>
      <span className="sr-airport-icon" aria-hidden="true"><Icon size={12} /></span>
    </div>
  );
};

const SegmentAirline = ({ segment }) => (
  <div className="sr-seg-airline">
    <AirlineBadge name={segment.airline} code={segment.airlineCode} logo={segment.logo} />
    <div className="sr-seg-airline-meta">
      <span className="sr-seg-airline-name">{segment.airline || DASH}</span>
      <span className="sr-seg-flightno">Flight: {segment.flightNumber || DASH}</span>
      <span className="sr-seg-cabin">{segment.cabin || DASH}</span>
      <span className="sr-seg-status">Flying Status: {segment.status || 'Unknown'}</span>
      {segment.baggage ? <span className="sr-seg-baggage">Baggage: {segment.baggage}</span> : null}
    </div>
  </div>
);

// One flight segment: departure · duration/stops · arrival · airline detail.
export const FlightSegment = ({ segment }) => (
  <div className="sr-seg">
    <AirportBlock kind="departure" endpoint={segment.departure} />
    <PlaneDivider duration={segment.duration} stops={segment.stops} />
    <AirportBlock kind="arrival" endpoint={segment.arrival} />
    <SegmentAirline segment={segment} />
  </div>
);

export default FlightSegment;
