import React, { useEffect, useRef, useState } from 'react';
import { Armchair, Check, ChevronDown, Eye, Luggage, Plane, Ticket } from 'lucide-react';
import { AvailabilityBadge, DASH, StatusBadge } from './SearchResultPrimitives';
import { ItinerarySection, ItinerarySummary } from './FlightItinerary';
import PriceSummary from './PriceSummary';
import {
  AirlinePNRDetails,
  BookingDetailsSection,
  CostingDetails,
  CostingHistory,
  PassengerDetails,
  SeatAvailability,
} from './CombinationInfo';
import BookingActions from './BookingActions';

const CardHeader = ({ combination, expanded }) => {
  const airlines = combination.airlines.filter(a => a.name);
  const names = airlines.length
    ? airlines.map(a => a.name).filter((name, i, arr) => arr.indexOf(name) === i).join(' + ')
    : 'Flight Combination';
  const pnrChips = combination.airlines.filter(a => a.pnr);
  const { status } = combination;

  return (
    <div className="sr-card-head">
      <div className="sr-card-head-left">
        <span className="sr-combo-number">Combination #{combination.index}</span>
        <span className="sr-card-airlines">{names}</span>
        <span className="sr-card-flightnos">
          {combination.outbound?.segments?.map(s => s.flightNumber).filter(Boolean).join(' + ') || DASH}
        </span>
      </div>
      <div className="sr-card-head-right">
        {combination.badge && <span className="sr-badge-chip">{combination.badge}</span>}
        <AvailabilityBadge value={status.availability} />
        <StatusBadge value={status.booking} />
        <StatusBadge value={status.payment} />
        <span className="sr-pnr-chips">
          {pnrChips.length
            ? pnrChips.map(a => <span key={a.pnr} className="sr-pnr-chip">PNR: {a.pnr}</span>)
            : null}
        </span>
        <span className="sr-chevron" data-expanded={expanded} aria-hidden="true"><ChevronDown size={16} /></span>
      </div>
    </div>
  );
};

export const FlightCombinationCard = ({
  combination,
  onSelect,
  isSelected,
  expanded: expandedProp,
  onToggleExpand,
}) => {
  const [localExpanded, setLocalExpanded] = useState(false);
  const [pendingAnchor, setPendingAnchor] = useState(null);
  const articleRef = useRef(null);

  const controlled = expandedProp !== undefined;
  const expanded = controlled ? expandedProp : localExpanded;

  const toggle = () => {
    if (onToggleExpand) onToggleExpand(combination.id);
    else setLocalExpanded(value => !value);
  };

  const scrollTo = (anchor) => {
    const target = articleRef.current?.querySelector(`[data-section="${anchor}"]`);
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const openAndScroll = (anchor) => {
    if (expanded) scrollTo(anchor);
    else setPendingAnchor(anchor);
  };

  useEffect(() => {
    if (!pendingAnchor || !expanded) return undefined;
    const timer = setTimeout(() => {
      scrollTo(pendingAnchor);
      setPendingAnchor(null);
    }, 80);
    return () => clearTimeout(timer);
  }, [pendingAnchor, expanded]);

  const primaryLeg = combination.outbound || combination.inbound;
  if (!primaryLeg) return null;

  const allSegments = [...(combination.outbound?.segments || []), ...(combination.inbound?.segments || [])];
  const hasBaggage = allSegments.some(segment => segment.baggage);
  const hasFareRules = Boolean(combination.fare?.rules);
  const hasSeats = Boolean(combination.seatAvailability);
  const cabin = primaryLeg.segments[0]?.cabin || '';

  const secondaryActions = [
    hasBaggage && { key: 'baggage', label: 'Baggage', icon: Luggage, anchor: 'outbound' },
    hasFareRules && { key: 'fare-rules', label: 'Fare Rules', icon: Ticket, anchor: 'costing' },
    hasSeats && { key: 'seats', label: 'Seat Availability', icon: Armchair, anchor: 'seat-availability' },
  ].filter(Boolean);

  return (
    <article ref={articleRef} className={`sr-card${isSelected ? ' is-selected' : ''}${expanded ? ' is-expanded' : ''}`}>
      <CardHeader combination={combination} expanded={expanded} />

      <div className="sr-card-body">
        <div className="sr-card-itineraries">
          <ItinerarySummary leg={combination.outbound} label="Outbound Flight" />
          <ItinerarySummary leg={combination.inbound} label="Inbound Flight" />
        </div>

        <div className="sr-card-meta">
          <span><Plane size={13} /> {cabin || DASH}</span>
          <span>{primaryLeg.stops || DASH}</span>
          <span>{primaryLeg.duration || DASH}</span>
          {combination.source && <span className="sr-source">Source: {combination.source}</span>}
        </div>
      </div>

      <div className="sr-card-foot">
        <div className="sr-foot-actions">
          <button
            type="button"
            className="btn btn-secondary sr-expand-btn"
            aria-expanded={expanded}
            onClick={toggle}
          >
            <Eye size={14} /> {expanded ? 'Hide Details' : 'View Details'}
          </button>
          {secondaryActions.map(action => (
            <button
              key={action.key}
              type="button"
              className="btn btn-secondary sr-expand-btn"
              onClick={() => openAndScroll(action.anchor)}
            >
              <action.icon size={14} /> {action.label}
            </button>
          ))}
        </div>
        <PriceSummary fare={combination.fare} />
        <button
          type="button"
          className="btn btn-primary sr-select-btn"
          onClick={() => onSelect(combination)}
        >
          {isSelected ? <><Check size={15} /> SELECTED</> : 'SELECT FLIGHT'}
        </button>
      </div>

      {expanded && (
        <div className="sr-expanded">
          <ItinerarySection title="Outbound Flight" anchor="outbound" leg={combination.outbound} tone="outbound" />
          {combination.inbound && (
            <ItinerarySection title="Inbound Flight" anchor="inbound" leg={combination.inbound} tone="inbound" />
          )}
          <div className="sr-expanded-grid">
            <AirlinePNRDetails airlines={combination.airlines} record={combination.pnrExtras} />
            <BookingDetailsSection booking={combination.booking} />
            <CostingDetails fare={combination.fare} />
          </div>
          <CostingHistory rows={combination.costingHistory} />
          <SeatAvailability data={combination.seatAvailability} />
          <PassengerDetails passengers={combination.passengers} address={combination.address} />
          <div className="sr-section" data-section="actions">
            <div className="sr-section-head"><h4 className="sr-section-title">Booking Actions</h4></div>
            <div className="sr-actions-note"><Luggage size={13} /> Actions are limited by your role permissions.</div>
            <BookingActions
              bookingId={combination.referenceNumber}
              referenceNumber={combination.referenceNumber}
            />
          </div>
        </div>
      )}
    </article>
  );
};

export default FlightCombinationCard;
