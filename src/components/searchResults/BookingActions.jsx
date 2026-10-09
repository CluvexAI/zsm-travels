import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Mail, Printer, Ticket } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { FEATURE_PERMISSION_MAP } from '../../services/mockAuthService';

// Each action is declared with either a FEATURE_PERMISSION_MAP key or a
// module/action pair from the permission matrix — never a hardcoded role name.
// Visibility comes from the signed-in user's session via usePermissions().
const ACTIONS = [
  { label: 'MCO REFUND', tone: 'violet', module: 'Refunds', action: 'Create' },
  { label: 'MCO PC', tone: 'plum', module: 'Actual Cost', action: 'View' },
  { label: 'PROFILE INFO', tone: 'blue', featureKey: 'profile-info-change' },
  { label: 'ASSIGN SEAT', tone: 'green', featureKey: 'seat-assign' },
  { label: 'ADD BAGGAGE', tone: 'amber', featureKey: 'add-baggage' },
  { label: 'ADD INSURANCE', tone: 'orange', featureKey: 'add-insurance' },
  { label: 'CHG ITINERARY', tone: 'indigo', featureKey: 'change-itinerary' },
  { label: 'CANCEL FOR R', tone: 'red', featureKey: 'cancellation-refund' },
  { label: 'CANCEL FOR C', tone: 'teal', featureKey: 'cancellation-credit' },
];

const CONFIRM_ACTION = { label: 'SEND FINAL CONFIRMATION', module: 'Service Actions', action: 'View' };
const BOARDING_ACTION = { label: 'BOARDING PASS', featureKey: 'boarding-pass' };

export const BookingActions = ({ bookingId = null, referenceNumber = null }) => {
  const navigate = useNavigate();
  const { canAccess, hasAnyPermission } = usePermissions();

  const isAllowed = (action) =>
    action.featureKey ? canAccess(action.featureKey) : hasAnyPermission(action.module, action.action);

  const pathFor = (action) =>
    (action.featureKey && FEATURE_PERMISSION_MAP[action.featureKey]?.path) || '/search';

  const go = (path) => {
    const suffix = referenceNumber && String(referenceNumber).trim()
      ? `?bookingId=${encodeURIComponent(referenceNumber)}`
      : '';
    navigate(`${path}${suffix}`, { state: { bookingId: referenceNumber || bookingId } });
  };

  const visible = ACTIONS.filter(isAllowed);
  const canConfirm = isAllowed(CONFIRM_ACTION);
  const canBoarding = isAllowed(BOARDING_ACTION);
  const canSendConfirm = canConfirm && Boolean(referenceNumber || bookingId);

  if (!visible.length && !canConfirm && !canBoarding) return null;

  return (
    <div className="sr-actions" role="group" aria-label="Booking actions">
      {visible.map(action => (
        <button
          key={action.label}
          type="button"
          className={`sr-action-btn tone-${action.tone}`}
          onClick={() => go(pathFor(action))}
          title={action.featureKey ? undefined : 'Open the booking to manage this action'}
        >
          {action.label}
        </button>
      ))}

      {canConfirm && (
        <div className="sr-action-group">
          <button
            type="button"
            className="sr-action-btn tone-navy"
            disabled={!canSendConfirm}
            onClick={() => canSendConfirm && go(`/booking/${encodeURIComponent(referenceNumber || bookingId)}`)}
            title={canSendConfirm ? 'Send the final confirmation to the customer' : 'Available once a booking reference exists'}
          >
            SEND FINAL CONFIRMATION
          </button>
          <span className="sr-action-icons" aria-hidden="true">
            <span className="sr-action-icon" title="Document"><FileText size={13} /></span>
            <span className="sr-action-icon" title="Email"><Mail size={13} /></span>
            <span className="sr-action-icon" title="Print"><Printer size={13} /></span>
          </span>
        </div>
      )}

      {canBoarding && (
        <button
          type="button"
          className="sr-action-btn tone-slate"
          onClick={() => go('/reports/boarding-pass')}
        >
          <Ticket size={13} /> BOARDING PASS
        </button>
      )}
    </div>
  );
};

export default BookingActions;
