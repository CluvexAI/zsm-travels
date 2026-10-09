import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

// Prefills the shared booking-search form (cxId / bookingId / pnr) from
// ?bookingId=&cxId=&pnr= deep links, e.g. the Booking Detail action bar on
// /search. The agent's existing search behaviour is untouched - the fields
// are simply pre-filled and the user presses Search as usual.
export const usePrefillBookingSearch = (setSearchFilters) => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const bookingId = searchParams.get('bookingId') || '';
    const cxId = searchParams.get('cxId') || '';
    const pnr = searchParams.get('pnr') || '';
    if (!bookingId && !cxId && !pnr) return;
    setSearchFilters(prev => ({
      ...prev,
      bookingId: bookingId || prev.bookingId,
      cxId: cxId || prev.cxId,
      pnr: pnr || prev.pnr,
    }));
  }, [searchParams, setSearchFilters]);
};
