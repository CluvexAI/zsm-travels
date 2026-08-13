import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check, CreditCard, User, Plane, DollarSign, Search, ShieldAlert, PlaneTakeoff, PlaneLanding, Clock, Loader2, X, Plus, Minus, Download, ExternalLink, Home, Info } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { getMetadata, setMetadata, saveBookings, fetchBookings } from '../services/supabase';

const steps = [
  { id: 1, title: 'Passenger & Payment', icon: <User size={18} /> },
  { id: 2, title: 'Flight & Breakdown', icon: <Plane size={18} /> },
  { id: 3, title: 'Confirmation', icon: <Check size={18} /> }
];

const mockFlights = [
  // Outbound Flights
  { id: 'AA204', airlineCode: 'AA', flightNumber: '204', flightCode: 'AA204', airline: 'American Airlines', color: '#1a73e8', route: 'JFK', dest: 'LAX', origin: 'JFK', destination: 'LAX', departureAirport: 'JFK', arrivalAirport: 'LAX', date: 'Oct 15, 2026', time: '10:15 AM', arrTime: '01:45 PM', duration: '6h 30m', stops: 'Non-stop', baggage: 'Carry-on Only', fareClass: 'Basic Economy', price: 289.00, isBestValue: true },
  { id: 'DL101', airlineCode: 'DL', flightNumber: '101', flightCode: 'DL101', airline: 'Delta Air Lines', color: '#e51420', route: 'JFK', dest: 'LAX', origin: 'JFK', destination: 'LAX', departureAirport: 'JFK', arrivalAirport: 'LAX', date: 'Oct 15, 2026', time: '08:00 AM', arrTime: '11:30 AM', duration: '6h 30m', stops: 'Non-stop', baggage: '1 Checked Bag', fareClass: 'Main Cabin', price: 345.50, isBestValue: false },
  { id: 'UA312', airlineCode: 'UA', flightNumber: '312', flightCode: 'UA312', airline: 'United Airlines', color: '#002244', route: 'JFK', dest: 'LAX', origin: 'JFK', destination: 'LAX', departureAirport: 'JFK', arrivalAirport: 'LAX', date: 'Oct 15, 2026', time: '02:00 PM', arrTime: '05:30 PM', duration: '6h 30m', stops: 'Non-stop', baggage: '1 Checked Bag', fareClass: 'Economy', price: 395.00, isBestValue: false },
  { id: 'B6405', airlineCode: 'B6', flightNumber: '405', flightCode: 'B6405', airline: 'JetBlue Airways', color: '#0033a0', route: 'JFK', dest: 'SFO', origin: 'JFK', destination: 'SFO', departureAirport: 'JFK', arrivalAirport: 'SFO', date: 'Oct 15, 2026', time: '07:30 AM', arrTime: '11:15 AM', duration: '6h 45m', stops: 'Non-stop', baggage: '1 Checked Bag', fareClass: 'Blue Basic', price: 215.00, isBestValue: false },
  // Inbound Flights
  { id: 'AA305', airlineCode: 'AA', flightNumber: '305', flightCode: 'AA305', airline: 'American Airlines', color: '#1a73e8', route: 'LAX', dest: 'JFK', origin: 'LAX', destination: 'JFK', departureAirport: 'LAX', arrivalAirport: 'JFK', date: 'Oct 22, 2026', time: '09:00 AM', arrTime: '05:30 PM', duration: '5h 30m', stops: 'Non-stop', baggage: 'Carry-on Only', fareClass: 'Basic Economy', price: 279.00, isBestValue: true },
  { id: 'DL202', airlineCode: 'DL', flightNumber: '202', flightCode: 'DL202', airline: 'Delta Air Lines', color: '#e51420', route: 'LAX', dest: 'JFK', origin: 'LAX', destination: 'JFK', departureAirport: 'LAX', arrivalAirport: 'JFK', date: 'Oct 22, 2026', time: '11:45 AM', arrTime: '08:15 PM', duration: '5h 30m', stops: 'Non-stop', baggage: '1 Checked Bag', fareClass: 'Main Cabin', price: 355.00, isBestValue: false },
  { id: 'UA415', airlineCode: 'UA', flightNumber: '415', flightCode: 'UA415', airline: 'United Airlines', color: '#002244', route: 'LAX', dest: 'JFK', origin: 'LAX', destination: 'JFK', departureAirport: 'LAX', arrivalAirport: 'JFK', date: 'Oct 22, 2026', time: '10:30 PM', arrTime: '06:45 AM', duration: '5h 15m', stops: 'Non-stop', baggage: '1 Checked Bag', fareClass: 'Economy', price: 310.00, isBestValue: false },
];

const NewBooking = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [returnStep, setReturnStep] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedBookingId, setSavedBookingId] = useState(null);
  const [tripType, setTripType] = useState('Round Trip');
  const [flightCodeInput, setFlightCodeInput] = useState({ outbound: '', return: '' });
  const [flightLookupResult, setFlightLookupResult] = useState({ outbound: null, return: null });
  const [flightLookupError, setFlightLookupError] = useState({ outbound: '', return: '' });
  const [isLookingUp, setIsLookingUp] = useState({ outbound: false, return: false });
  const [airlinePnrs, setAirlinePnrs] = useState([
    { airline: '', pnr: '', status: 'On Hold' },
    { airline: '', pnr: '', status: 'On Hold' },
    { airline: '', pnr: '', status: 'On Hold' },
  ]);

  const updateAirlinePnr = (idx, field, value) => {
    setAirlinePnrs(prev => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  const airlineOptions = [
    'American Airlines', 'Delta Air Lines', 'United Airlines', 'JetBlue Airways',
    'Southwest Airlines', 'Alaska Airlines', 'Spirit Airlines', 'Frontier Airlines',
    'Air Canada', 'British Airways', 'Lufthansa', 'Emirates', 'Qatar Airways',
    'Singapore Airlines', 'Turkish Airlines',
  ];

  const pnrStatusOptions = {
    'On Hold': { bg: '#fef3c7', border: '#fde68a', text: '#92400e' },
    'Pending': { bg: '#dbeafe', border: '#bfdbfe', text: '#1e40af' },
    'Confirmed': { bg: '#dcfce7', border: '#bbf7d0', text: '#166534' },
    'Cancelled': { bg: '#fee2e2', border: '#fecaca', text: '#991b1b' },
  };

  const lookupFlightCode = (type) => {
    const code = flightCodeInput[type].trim().toUpperCase();
    if (!code) {
      setFlightLookupError(prev => ({ ...prev, [type]: 'Please enter a flight code.' }));
      return;
    }
    const match = code.match(/^([A-Z]{2})(\d{1,4})$/);
    if (!match) {
      setFlightLookupError(prev => ({ ...prev, [type]: 'Invalid format. Use airline code + flight number (e.g. AA204, DL101).' }));
      setFlightLookupResult(prev => ({ ...prev, [type]: null }));
      return;
    }
    setIsLookingUp(prev => ({ ...prev, [type]: true }));
    setFlightLookupError(prev => ({ ...prev, [type]: '' }));
    setFlightLookupResult(prev => ({ ...prev, [type]: null }));
    setTimeout(() => {
      const found = mockFlights.find(f => f.flightCode === code || f.id === code);
      if (found) {
        const pnr = `PNR-${Math.random().toString(36).toUpperCase().slice(2, 8)}`;
        setFlightLookupResult(prev => ({ ...prev, [type]: { ...found, found: true, pnr } }));
        if (type === 'outbound') {
          setFormData(prev => ({ ...prev, outboundFlight: found, fromAirport: found.departureAirport, toAirport: found.arrivalAirport }));
        } else {
          setFormData(prev => ({ ...prev, inboundFlight: found }));
        }
      } else {
        setFlightLookupError(prev => ({ ...prev, [type]: `No PNR found for flight code "${code}". Please check and try again.` }));
      }
      setIsLookingUp(prev => ({ ...prev, [type]: false }));
    }, 900);
  };

  const clearFlightLookup = (type) => {
    setFlightCodeInput(prev => ({ ...prev, [type]: '' }));
    setFlightLookupResult(prev => ({ ...prev, [type]: null }));
    setFlightLookupError(prev => ({ ...prev, [type]: '' }));
    if (type === 'outbound') setFormData(prev => ({ ...prev, outboundFlight: null }));
    if (type === 'return') setFormData(prev => ({ ...prev, inboundFlight: null }));
  };
  
  const [outboundSearchQuery, setOutboundSearchQuery] = useState('');
  const [outboundActiveSearch, setOutboundActiveSearch] = useState('');
  const [isOutboundSearching, setIsOutboundSearching] = useState(false);
  const [outboundSearchComplete, setOutboundSearchComplete] = useState(true);

  const [inboundSearchQuery, setInboundSearchQuery] = useState('');
  const [inboundActiveSearch, setInboundActiveSearch] = useState('');
  const [isInboundSearching, setIsInboundSearching] = useState(false);
  const [inboundSearchComplete, setInboundSearchComplete] = useState(true);
  
  const [formData, setFormData] = useState({
      passengersCount: 1,
      outboundFlight: null,
      inboundFlight: null,
      fromAirport: 'JFK',
      toAirport: 'LAX',
      passengers: [{ title: 'Mr', passengerType: 'Adult', firstName: '', middleName: '', lastName: '', dob: '', gender: 'Male', phoneCode: '+1', phone: '', altPhoneCode: '+1', altPhone: '', email: '', eTicket: '', carryOn: '1 Bag (Included)', checkInBag: 'None', insurance: 'None' }],
      paymentMethod: 'Customer Card',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      paymentAgreed: false,
      customTaxes: null,
      customServiceFee: null,
      customActualCost: null,
      customActualMCO: null,
      merchantName: '',
      vendorCode: '',
      descriptor: '',
      bookingSource: '',
      shift: '',
      proposalType: '',
      cardName: '',
      billingAddressLine1: '',
      billingAddressLine2: '',
      billingCity: '',
      billingState: '',
      billingZip: '',
      billingCountry: 'United States',
      billingPhone: '',
      billingEmail: '',
      remark: ''
  });

  useEffect(() => {
    const loadDraft = async () => {
      const saved = await getMetadata('newBookingDraft');
      if (saved) {
        if (saved.currentStep) setCurrentStep(saved.currentStep);
        if (saved.tripType) setTripType(saved.tripType);
        if (saved.formData) setFormData(saved.formData);
      }
    };
    loadDraft();
  }, []);

  const [cardErrors, setCardErrors] = useState({ cardNumber: '', expiryDate: '', cvv: '' });
  const [cardTouched, setCardTouched] = useState({ cardNumber: false, expiryDate: false, cvv: false });

  // Auto-save to Supabase
  useEffect(() => {
    setMetadata('newBookingDraft', { currentStep, tripType, formData });
  }, [currentStep, tripType, formData]);

  // -- Credit Card Helpers --
  const luhnCheck = (num) => {
    const digits = num.replace(/\D/g, '');
    if (digits.length === 0) return false;
    let sum = 0;
    let alternate = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let n = parseInt(digits[i], 10);
      if (alternate) { n *= 2; if (n > 9) n -= 9; }
      sum += n;
      alternate = !alternate;
    }
    return sum % 10 === 0;
  };

  const detectCardType = (number) => {
    const digits = number.replace(/\D/g, '');
    if (/^3[47]/.test(digits)) return 'amex';
    if (/^4/.test(digits)) return 'visa';
    if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'mastercard';
    if (/^6(?:011|5)/.test(digits)) return 'discover';
    return 'unknown';
  };

  const getCardTypeName = (type) => {
    const names = { amex: 'American Express', visa: 'Visa', mastercard: 'Mastercard', discover: 'Discover' };
    return names[type] || '';
  };

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    const cardType = detectCardType(digits);
    const maxLen = cardType === 'amex' ? 15 : 16;
    const trimmed = digits.slice(0, maxLen);
    if (cardType === 'amex') {
      return trimmed.replace(/(\d{4})(\d{0,6})(\d{0,5})/, (_, a, b, c) => [a, b, c].filter(Boolean).join(' '));
    }
    return trimmed.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const validateCardNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return 'Card number is required';
    const cardType = detectCardType(digits);
    const expectedLen = cardType === 'amex' ? 15 : 16;
    if (digits.length < expectedLen) return `Enter a valid ${expectedLen}-digit card number`;
    if (!luhnCheck(digits)) return 'Invalid card number';
    return '';
  };

  const validateExpiry = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return 'Expiry date is required';
    if (digits.length < 4) return 'Enter a valid MM/YY date';
    const month = parseInt(digits.slice(0, 2), 10);
    const year = parseInt('20' + digits.slice(2, 4), 10);
    if (month < 1 || month > 12) return 'Month must be 01-12';
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    if (year < currentYear || (year === currentYear && month < currentMonth)) return 'Card has expired';
    return '';
  };

  const validateCvv = (value, cardNum) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return 'CVV is required';
    const cardType = detectCardType(cardNum);
    const expectedLen = cardType === 'amex' ? 4 : 3;
    if (digits.length !== expectedLen) return `CVV must be ${expectedLen} digits`;
    return '';
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    const newFormData = { ...formData, cardNumber: formatted };
    setFormData(newFormData);
    if (cardTouched.cardNumber) setCardErrors(prev => ({ ...prev, cardNumber: validateCardNumber(formatted) }));
    // Re-validate CVV when card type changes
    if (cardTouched.cvv && formData.cvv) setCardErrors(prev => ({ ...prev, cvv: validateCvv(formData.cvv, formatted) }));
  };

  const handleExpiryChange = (e) => {
    const formatted = formatExpiry(e.target.value);
    setFormData({ ...formData, expiryDate: formatted });
    if (cardTouched.expiryDate) setCardErrors(prev => ({ ...prev, expiryDate: validateExpiry(formatted) }));
  };

  const handleCvvChange = (e) => {
    const cardType = detectCardType(formData.cardNumber);
    const maxLen = cardType === 'amex' ? 4 : 3;
    const digits = e.target.value.replace(/\D/g, '').slice(0, maxLen);
    setFormData({ ...formData, cvv: digits });
    if (cardTouched.cvv) setCardErrors(prev => ({ ...prev, cvv: validateCvv(digits, formData.cardNumber) }));
  };

  const handleCardBlur = (field) => {
    setCardTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'cardNumber') setCardErrors(prev => ({ ...prev, cardNumber: validateCardNumber(formData.cardNumber) }));
    if (field === 'expiryDate') setCardErrors(prev => ({ ...prev, expiryDate: validateExpiry(formData.expiryDate) }));
    if (field === 'cvv') setCardErrors(prev => ({ ...prev, cvv: validateCvv(formData.cvv, formData.cardNumber) }));
  };

  const isCardValid = validateCardNumber(formData.cardNumber) === '' && validateExpiry(formData.expiryDate) === '' && validateCvv(formData.cvv, formData.cardNumber) === '';
  const detectedCardType = detectCardType(formData.cardNumber);
  const cvvMaxLength = detectedCardType === 'amex' ? 4 : 3;

  const handleNext = async () => {
    if (currentStep === 4) {
      // Save booking to Supabase before moving to confirmation step
      setIsSaving(true);
      try {
        const bookingId = `BK-${Date.now()}`;
        const pnr = `PNR-${Math.random().toString(36).toUpperCase().slice(2, 8)}`;
        const now = new Date().toISOString();

        const booking = {
          id: bookingId,
          pnr,
          status: 'Confirmed',
          createdAt: now,
          updatedAt: now,

          // Trip info
          tripType,
          fromAirport: formData.fromAirport,
          toAirport: formData.toAirport,
          departureDate: formData.departureDate || null,
          returnDate: formData.returnDate || null,
          cabinClass: formData.cabinClass || 'Economy',
          fareClass: formData.fareClass || '',
          passengersCount: formData.passengersCount,

          // Flight codes (from Flight Code Lookup section)
          outboundFlightCode: formData.outboundFlight?.flightCode || formData.outboundFlight?.id || null,
          returnFlightCode: formData.inboundFlight?.flightCode || formData.inboundFlight?.id || null,

          // Flight details
          outboundFlight: formData.outboundFlight ? {
            id: formData.outboundFlight.id,
            airline: formData.outboundFlight.airline,
            flightCode: formData.outboundFlight.flightCode || formData.outboundFlight.id,
            from: formData.outboundFlight.route || formData.fromAirport,
            to: formData.outboundFlight.dest || formData.toAirport,
            date: formData.outboundFlight.date,
            departureTime: formData.outboundFlight.time,
            arrivalTime: formData.outboundFlight.arrTime,
            duration: formData.outboundFlight.duration,
            stops: formData.outboundFlight.stops,
            baggage: formData.outboundFlight.baggage,
            fareClass: formData.outboundFlight.fareClass,
            price: formData.outboundFlight.price,
          } : null,

          inboundFlight: formData.inboundFlight ? {
            id: formData.inboundFlight.id,
            airline: formData.inboundFlight.airline,
            flightCode: formData.inboundFlight.flightCode || formData.inboundFlight.id,
            from: formData.inboundFlight.route || formData.toAirport,
            to: formData.inboundFlight.dest || formData.fromAirport,
            date: formData.inboundFlight.date,
            departureTime: formData.inboundFlight.time,
            arrivalTime: formData.inboundFlight.arrTime,
            duration: formData.inboundFlight.duration,
            stops: formData.inboundFlight.stops,
            baggage: formData.inboundFlight.baggage,
            fareClass: formData.inboundFlight.fareClass,
            price: formData.inboundFlight.price,
          } : null,

          // Passengers
          passengers: formData.passengers.map((p, i) => ({
            index: i + 1,
            title: p.title,
            passengerType: p.passengerType || 'Adult',
            firstName: p.firstName,
            middleName: p.middleName || '',
            lastName: p.lastName,
            fullName: `${p.title} ${p.firstName} ${p.middleName ? p.middleName + ' ' : ''}${p.lastName}`.trim(),
            dob: p.dob,
            gender: p.gender,
            phone: `${p.phoneCode} ${p.phone}`.trim(),
            altPhone: p.altPhone ? `${p.altPhoneCode} ${p.altPhone}`.trim() : '',
            email: p.email || '',
            eTicket: p.eTicket || '',
            carryOn: p.carryOn,
            checkInBag: p.checkInBag,
            insurance: p.insurance,
          })),

          // Pricing
          pricing: {
            baseFare,
            taxes,
            serviceFee,
            actualCost,
            actualMCO,
            totalCost: sidebarTotalCost,
            currency: 'USD',
          },

          // Payment
          payment: {
            method: formData.paymentMethod,
            cardName: formData.cardName || '',
            cardType: getCardTypeName(detectCardType(formData.cardNumber)) || '',
            cardLast4: formData.cardNumber ? formData.cardNumber.replace(/\s/g, '').slice(-4) : '',
            cardExpiry: formData.expiryDate || '',
            agreed: formData.paymentAgreed,
          },

          // Agency / merchant
          merchantName: formData.merchantName,
          vendorCode: formData.vendorCode,

          // Remark
          remark: formData.remark || '',
        };

        // Fetch existing bookings and append
        const existing = await fetchBookings() || [];
        await saveBookings([...existing, booking]);

        // Clear the auto-save draft
        await setMetadata('newBookingDraft', null);

        setSavedBookingId(bookingId);
        setCurrentStep(5);
      } catch (err) {
        console.error('Failed to save booking:', err);
        // Still advance even if save fails — user sees confirmation
        setCurrentStep(5);
      } finally {
        setIsSaving(false);
      }
      return;
    }
    if (returnStep) {
      setCurrentStep(returnStep);
      setReturnStep(null);
    } else {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };
  const handlePrev = () => {
    if (returnStep) setReturnStep(null);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const updatePassengersCount = (newCount) => {
    if (newCount < 1 || newCount > 9) return;
    
    let newPassengers = [...formData.passengers];
    if (newCount > formData.passengersCount) {
       const diff = newCount - formData.passengersCount;
       for (let i = 0; i < diff; i++) {
         newPassengers.push({ title: 'Mr', passengerType: 'Adult', firstName: '', middleName: '', lastName: '', dob: '', gender: 'Male', phoneCode: '+1', phone: '', altPhoneCode: '+1', altPhone: '', email: '', eTicket: '', carryOn: '1 Bag (Included)', checkInBag: 'None', insurance: 'None' });
       }
    } else if (newCount < formData.passengersCount) {
       newPassengers = newPassengers.slice(0, newCount);
    }
    
    setFormData({
      ...formData,
      passengersCount: newCount,
      passengers: newPassengers
    });
  };

  const handleOutboundSearch = () => {
    if (!outboundSearchQuery.trim()) {
       setOutboundActiveSearch('');
       setOutboundSearchComplete(true);
       return;
    }
    setIsOutboundSearching(true);
    setOutboundSearchComplete(false);
    setTimeout(() => {
      setOutboundActiveSearch(outboundSearchQuery);
      setIsOutboundSearching(false);
      setOutboundSearchComplete(true);
    }, 800);
  };

  const handleInboundSearch = () => {
    if (!inboundSearchQuery.trim()) {
       setInboundActiveSearch('');
       setInboundSearchComplete(true);
       return;
    }
    setIsInboundSearching(true);
    setInboundSearchComplete(false);
    setTimeout(() => {
      setInboundActiveSearch(inboundSearchQuery);
      setIsInboundSearching(false);
      setInboundSearchComplete(true);
    }, 800);
  };

  const handleOutboundKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleOutboundSearch();
    }
  };

  const handleDownloadPdf = () => {
    const element = document.getElementById('booking-receipt');
    if (element) {
      const btn = document.getElementById('pdf-download-btn');
      if (btn) btn.style.display = 'none';
      const opt = {
        margin:       0.5,
        filename:     `Booking-B-23490.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(element).save().then(() => {
        if (btn) btn.style.display = 'flex';
      });
    }
  };

  const handleInboundKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleInboundSearch(); }
  };

  const clearOutboundSearch = () => {
    setOutboundSearchQuery('');
    setOutboundActiveSearch('');
    setIsOutboundSearching(true);
    setTimeout(() => {
       setIsOutboundSearching(false);
       setOutboundSearchComplete(true);
    }, 300);
  };

  const clearInboundSearch = () => {
    setInboundSearchQuery('');
    setInboundActiveSearch('');
    setIsInboundSearching(true);
    setTimeout(() => {
       setIsInboundSearching(false);
       setInboundSearchComplete(true);
    }, 300);
  };

  const selectOutboundFlight = (flight) => {
    if (formData.outboundFlight?.id === flight.id) {
      setFormData({ ...formData, outboundFlight: null });
    } else {
      setFormData({ ...formData, outboundFlight: flight });
    }
  };

  const selectInboundFlight = (flight) => {
    if (formData.inboundFlight?.id === flight.id) {
      setFormData({ ...formData, inboundFlight: null });
    } else {
      setFormData({ ...formData, inboundFlight: flight });
    }
  };

  // Calculations
  const outboundPrice = formData.outboundFlight ? formData.outboundFlight.price : 0;
  const inboundPrice = (tripType === 'Round Trip' && formData.inboundFlight) ? formData.inboundFlight.price : 0;
  const baseFare = (outboundPrice + inboundPrice) * formData.passengersCount;
  const taxes = formData.customTaxes !== null ? formData.customTaxes : baseFare * 0.15; // 15% mock tax or custom
  const serviceFee = formData.customServiceFee !== null ? formData.customServiceFee : 20.00;
  const baseMCO = 20.00;
  const actualMCO = formData.customActualMCO !== null ? formData.customActualMCO : baseMCO;
  const actualCost = formData.customActualCost !== null ? formData.customActualCost : (baseFare + taxes);
  const totalCost = baseFare > 0 ? actualCost + serviceFee : 0;
  const sidebarTotalCost = actualCost + actualMCO;

  // Filter outbound flights
  const outboundFlights = mockFlights.filter(flight => {
     if (flight.route !== formData.fromAirport || flight.dest !== formData.toAirport) return false;
     if (!outboundActiveSearch.trim()) return true;
     const tokens = outboundActiveSearch.toUpperCase().split(/\s+/).filter(Boolean);
     const flightString = `${flight.airlineCode} ${flight.airline} ${flight.flightNumber} ${flight.flightCode} ${flight.id} ${flight.departureAirport} ${flight.arrivalAirport} ${flight.origin} ${flight.destination} ${flight.route} ${flight.dest}`.toUpperCase();
     return tokens.every(token => flightString.includes(token));
  });

  // Filter inbound flights
  const inboundFlights = mockFlights.filter(flight => {
     if (flight.route !== formData.toAirport || flight.dest !== formData.fromAirport) return false;
     if (!inboundActiveSearch.trim()) return true;
     const tokens = inboundActiveSearch.toUpperCase().split(/\s+/).filter(Boolean);
     const flightString = `${flight.airlineCode} ${flight.airline} ${flight.flightNumber} ${flight.flightCode} ${flight.id} ${flight.departureAirport} ${flight.arrivalAirport} ${flight.origin} ${flight.destination} ${flight.route} ${flight.dest}`.toUpperCase();
     return tokens.every(token => flightString.includes(token));
  });

  const isStep1Valid = formData.passengers.every(p => p.firstName.trim() && p.lastName.trim() && p.dob) && formData.merchantName && formData.vendorCode && formData.paymentAgreed && isCardValid;
  const isStep2Valid = tripType === 'Round Trip' ? (formData.outboundFlight && formData.inboundFlight) : (formData.outboundFlight !== null);
  
  const isNextDisabled = (currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid);

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* ═══════════════════════════════════════════════════════════
                PNR ENTRY SECTION
            ═══════════════════════════════════════════════════════════ */}
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'stretch', flexWrap: 'wrap' }}>

            <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  { type: 'outbound', label: 'Outbound Flight Code', placeholder: 'Enter Outbound Flight Code', Icon: PlaneTakeoff, accent: '#000000', accentLight: '#e5e5e5', boxBg: '#ffffff', border: '#000000', btnBg: '#000000' },
                  { type: 'return', label: 'Inbound Flight Code', placeholder: 'Enter Inbound Flight Code', Icon: PlaneLanding, accent: '#000000', accentLight: '#e5e5e5', boxBg: '#ffffff', border: '#000000', btnBg: '#000000' },
                ].map(cfg => {
                  const result = flightLookupResult[cfg.type];
                  const error = flightLookupError[cfg.type];
                  const loading = isLookingUp[cfg.type];
                  const value = flightCodeInput[cfg.type];
                  return (
                    <div key={cfg.type} style={{ background: cfg.boxBg, borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: 30, height: 30, borderRadius: '8px', background: cfg.btnBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <cfg.Icon size={15} style={{ color: 'white' }} />
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: cfg.accent }}>{cfg.label}</div>
                      </div>

                      <div style={{ position: 'relative' }}>
                        <textarea
                          value={value}
                          onChange={e => { setFlightCodeInput(prev => ({ ...prev, [cfg.type]: e.target.value.toUpperCase() })); setFlightLookupError(prev => ({ ...prev, [cfg.type]: '' })); }}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); lookupFlightCode(cfg.type); } }}
                          style={{ width: '330px', maxWidth: '100%', height: '145px', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: `1.5px solid ${error ? '#f87171' : cfg.border}`, outline: 'none', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.02em', background: 'white', boxSizing: 'border-box', resize: 'none', fontFamily: 'inherit' }}
                        />
                        {value && (
                          <button onClick={() => clearFlightLookup(cfg.type)} style={{ position: 'absolute', right: '0.6rem', top: '0.6rem', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.2rem' }}><X size={15} /></button>
                        )}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => lookupFlightCode(cfg.type)}
                          disabled={!value.trim() || loading}
                          style={{ padding: '0.65rem 1.25rem', borderRadius: 'var(--radius-md)', background: cfg.btnBg, color: 'white', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: (!value.trim() || loading) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap', opacity: (!value.trim() || loading) ? 0.5 : 1, transition: 'opacity 0.2s' }}
                        >
                          {loading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Fetching…</> : <><Search size={14} /> Preview</>}
                        </button>
                      </div>

                      {error && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)' }}>
                          <ShieldAlert size={13} /> {error}
                        </div>
                      )}

                      {result && (
                        <div style={{ background: 'white', borderRadius: 'var(--radius-md)', border: `1.5px solid ${cfg.border}`, padding: '0.9rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: cfg.accent }}>PNR Found</span>
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.55rem', borderRadius: 'var(--radius-full)', background: cfg.accentLight, color: cfg.accent }}>✓ Confirmed</span>
                          </div>
                          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', letterSpacing: '0.06em' }}>{result.pnr}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{result.airline} · {result.flightCode} · {result.route} → {result.dest}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{result.date} · {result.time} – {result.arrTime}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Merged Airline & PNR + Agency Details card */}
            <div style={{ flex: '2 1 700px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', padding: '2rem' }}>
              <div className="pnr-agency-grid">

                {/* Airline & PNR column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
                  {airlinePnrs.map((row, idx) => {
                    const statusStyle = pnrStatusOptions[row.status] || pnrStatusOptions['On Hold'];
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingBottom: idx < airlinePnrs.length - 1 ? '1.25rem' : 0, borderBottom: idx < airlinePnrs.length - 1 ? '1px dashed var(--border-color)' : 'none' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Airline &amp; PNR {idx + 1}</div>
                        <div style={{ display: 'flex', gap: '0.6rem' }}>
                          <select
                            value={row.airline}
                            onChange={e => updateAirlinePnr(idx, 'airline', e.target.value)}
                            style={{ flex: 1.2, minWidth: 0, padding: '0.65rem 0.6rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-color)', outline: 'none', fontWeight: 600, fontSize: '0.85rem', backgroundColor: 'white', boxSizing: 'border-box' }}
                          >
                            <option value="">Select Airline</option>
                            {airlineOptions.map(a => <option key={a} value={a}>{a}</option>)}
                          </select>
                          <input
                            type="text"
                            placeholder="PNR"
                            value={row.pnr}
                            onChange={e => updateAirlinePnr(idx, 'pnr', e.target.value.toUpperCase())}
                            style={{ flex: 0.8, minWidth: 0, padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-color)', outline: 'none', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.04em', boxSizing: 'border-box' }}
                          />
                          <select
                            value={row.status}
                            onChange={e => updateAirlinePnr(idx, 'status', e.target.value)}
                            style={{ flex: '0 0 auto', padding: '0.65rem 0.6rem', borderRadius: 'var(--radius-md)', border: `1.5px solid ${statusStyle.border}`, outline: 'none', fontWeight: 700, fontSize: '0.78rem', background: statusStyle.bg, color: statusStyle.text, boxSizing: 'border-box', cursor: 'pointer' }}
                          >
                            {Object.keys(pnrStatusOptions).map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#2563eb' }}>
                    <Info size={14} /> You can add up to 3 Airlines &amp; PNRs.
                  </div>
                </div>

                {/* Vertical divider */}
                <div className="pnr-agency-divider" />

                {/* Agency Details column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', minWidth: 0 }}>
                  {[
                    { label: 'Merchant Name', field: 'merchantName', type: 'text', placeholder: 'Enter Merchant Name' },
                    { label: 'Vendor Code', field: 'vendorCode', type: 'text', placeholder: 'Enter Vendor Code' },
                    { label: 'Descriptor', field: 'descriptor', type: 'text', placeholder: 'Enter Descriptor' },
                    { label: 'Booking Source', field: 'bookingSource', type: 'select', placeholder: 'Select Booking Source', options: ['Website', 'Phone', 'Walk-in', 'Travel Agent', 'OTA'] },
                    { label: 'Shift', field: 'shift', type: 'select', placeholder: 'Select Shift', options: ['Morning', 'Afternoon', 'Evening', 'Night'] },
                    { label: 'Proposal Type', field: 'proposalType', type: 'select', placeholder: 'Select Proposal Type', options: ['Standard', 'Special Fare', 'Corporate', 'Group Booking'] },
                  ].map(f => (
                    <div key={f.field} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <label style={{ width: '110px', flexShrink: 0, fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>{f.label}</label>
                      {f.type === 'text' ? (
                        <input type="text" value={formData[f.field] || ''} onChange={(e) => setFormData({...formData, [f.field]: e.target.value})} placeholder={f.placeholder} style={{ flex: 1, minWidth: 0, padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', boxSizing: 'border-box', fontSize: '0.8rem' }} />
                      ) : (
                        <select value={formData[f.field] || ''} onChange={(e) => setFormData({...formData, [f.field]: e.target.value})} style={{ flex: 1, minWidth: 0, padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box', fontSize: '0.8rem' }}>
                          <option value="">{f.placeholder}</option>
                          {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            </div>

            </div>{/* end PNR Entry section */}

            {/* Passenger Details */}
            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ background: 'var(--bg-base)', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
                  <User size={20} style={{ color: 'var(--secondary-accent)' }} /> Passenger Details
                </h2>
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {formData.passengers.map((p, idx) => (
                  <div key={idx} style={{ background: idx === 0 ? 'white' : 'var(--bg-base)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                    <div style={{ background: 'var(--bg-base)', padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--secondary-accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>{idx + 1}</div>
                        {`Passenger ${idx + 1}`}
                      </div>
                      {idx === 0 && <span style={{ fontSize: '0.75rem', background: '#e2e8f0', color: '#4a5568', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>Primary Contact</span>}
                    </div>
                    <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Title</label>
                        <select value={p.title || 'Mr'} onChange={(e) => { const newP = [...formData.passengers]; newP[idx].title = e.target.value; setFormData({...formData, passengers: newP}); }} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white' }}>
                          <option>Mr</option><option>Mrs</option><option>Ms</option><option>Dr</option><option>Prof</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Date of Birth (Required)</label>
                        <input type="date" value={p.dob || ''} onChange={(e) => { const newP = [...formData.passengers]; newP[idx].dob = e.target.value; setFormData({...formData, passengers: newP}); }} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>First Name (Required)</label>
                        <input type="text" value={p.firstName || ''} onChange={(e) => { const newP = [...formData.passengers]; newP[idx].firstName = e.target.value; setFormData({...formData, passengers: newP}); }} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none' }} placeholder="As on ID" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Middle Name (Optional)</label>
                        <input type="text" value={p.middleName || ''} onChange={(e) => { const newP = [...formData.passengers]; newP[idx].middleName = e.target.value; setFormData({...formData, passengers: newP}); }} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none' }} placeholder="As on ID" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Last Name (Required)</label>
                        <input type="text" value={p.lastName || ''} onChange={(e) => { const newP = [...formData.passengers]; newP[idx].lastName = e.target.value; setFormData({...formData, passengers: newP}); }} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none' }} placeholder="As on ID" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Gender</label>
                        <select value={p.gender || 'Male'} onChange={(e) => { const newP = [...formData.passengers]; newP[idx].gender = e.target.value; setFormData({...formData, passengers: newP}); }} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white' }}>
                          <option>Male</option><option>Female</option><option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Passenger Type</label>
                        <select value={p.passengerType || 'Adult'} onChange={(e) => { const newP = [...formData.passengers]; newP[idx].passengerType = e.target.value; setFormData({...formData, passengers: newP}); }} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white' }}>
                          <option>Adult</option><option>Minor</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>E-Ticket</label>
                        <input type="text" value={p.eTicket || ''} onChange={(e) => { const newP = [...formData.passengers]; newP[idx].eTicket = e.target.value; setFormData({...formData, passengers: newP}); }} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', boxSizing: 'border-box' }} placeholder="e.g. 001-2345678901" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Carry-on</label>
                        <select value={p.carryOn || '1 Bag (Included)'} onChange={(e) => { const newP = [...formData.passengers]; newP[idx].carryOn = e.target.value; setFormData({...formData, passengers: newP}); }} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white' }}>
                          <option>1 Bag (Included)</option>
                          <option>2 Bags</option>
                          <option>None</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Check-in Bag</label>
                        <select value={p.checkInBag || 'None'} onChange={(e) => { const newP = [...formData.passengers]; newP[idx].checkInBag = e.target.value; setFormData({...formData, passengers: newP}); }} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white' }}>
                          <option>None</option>
                          <option>1 Bag (23kg)</option>
                          <option>2 Bags (23kg each)</option>
                          <option>3 Bags (23kg each)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card Billing Address */}
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Home size={18} style={{ color: 'var(--primary-accent)' }} /> Card Billing Address
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>Address Line 1</label>
                  <input type="text" value={formData.billingAddressLine1 || ''} onChange={(e) => setFormData({...formData, billingAddressLine1: e.target.value})} placeholder="Street address" style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', boxSizing: 'border-box', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>Address Line 2</label>
                  <input type="text" value={formData.billingAddressLine2 || ''} onChange={(e) => setFormData({...formData, billingAddressLine2: e.target.value})} placeholder="Apt, suite, unit" style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', boxSizing: 'border-box', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>City</label>
                  <input type="text" value={formData.billingCity || ''} onChange={(e) => setFormData({...formData, billingCity: e.target.value})} placeholder="City" style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', boxSizing: 'border-box', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>State</label>
                  <input type="text" value={formData.billingState || ''} onChange={(e) => setFormData({...formData, billingState: e.target.value})} placeholder="State" style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', boxSizing: 'border-box', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>ZIP Code</label>
                  <input type="text" value={formData.billingZip || ''} onChange={(e) => setFormData({...formData, billingZip: e.target.value})} placeholder="ZIP Code" style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', boxSizing: 'border-box', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>Country</label>
                  <select value={formData.billingCountry || 'United States'} onChange={(e) => setFormData({...formData, billingCountry: e.target.value})} style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white', fontSize: '0.85rem' }}>
                    <option>United States</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                    <option>India</option>
                    <option>Australia</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>Phone Number</label>
                  <input type="tel" value={formData.billingPhone || ''} onChange={(e) => setFormData({...formData, billingPhone: e.target.value})} placeholder="(555) 000-0000" style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', boxSizing: 'border-box', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>Email ID</label>
                  <input type="email" value={formData.billingEmail || ''} onChange={(e) => setFormData({...formData, billingEmail: e.target.value})} placeholder="billing@example.com" style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', boxSizing: 'border-box', fontSize: '0.85rem' }} />
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
                  <CreditCard size={20} style={{ color: '#805ad5' }} /> Payment Details
                </h2>
                <div style={{ display: 'flex', background: 'var(--bg-base)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <button onClick={() => setFormData({...formData, paymentMethod: 'Customer Card'})} style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-sm)', border: 'none', background: formData.paymentMethod !== 'Company Card' ? 'white' : 'transparent', color: formData.paymentMethod !== 'Company Card' ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', boxShadow: formData.paymentMethod !== 'Company Card' ? 'var(--shadow-sm)' : 'none' }}>Customer Card</button>
                  <button onClick={() => setFormData({...formData, paymentMethod: 'Company Card'})} style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-sm)', border: 'none', background: formData.paymentMethod === 'Company Card' ? 'white' : 'transparent', color: formData.paymentMethod === 'Company Card' ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', boxShadow: formData.paymentMethod === 'Company Card' ? 'var(--shadow-sm)' : 'none' }}>Company Card</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Name on Card</label>
                  <input type="text" value={formData.cardName || ''} onChange={(e) => setFormData({...formData, cardName: e.target.value})} placeholder="As shown on card" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', margin: 0 }}>Card Number</label>
                    {detectedCardType !== 'unknown' && (
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--primary-accent)', background: 'rgba(56, 178, 172, 0.1)', padding: '0.15rem 0.6rem', borderRadius: 'var(--radius-full)', letterSpacing: '0.05em' }}>
                        {getCardTypeName(detectedCardType).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <input type="text" value={formData.cardNumber} onChange={handleCardNumberChange} onBlur={() => handleCardBlur('cardNumber')} placeholder="0000 0000 0000 0000" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: `1px solid ${cardErrors.cardNumber ? 'var(--danger)' : 'var(--border-color)'}`, outline: 'none', boxSizing: 'border-box' }} />
                  {cardErrors.cardNumber && <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{cardErrors.cardNumber}</div>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Expiry Date</label>
                  <input type="text" value={formData.expiryDate} onChange={handleExpiryChange} onBlur={() => handleCardBlur('expiryDate')} placeholder="MM/YY" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: `1px solid ${cardErrors.expiryDate ? 'var(--danger)' : 'var(--border-color)'}`, outline: 'none' }} />
                  {cardErrors.expiryDate && <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{cardErrors.expiryDate}</div>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>CVV</label>
                  <input type="password" value={formData.cvv} onChange={handleCvvChange} onBlur={() => handleCardBlur('cvv')} placeholder="•••" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: `1px solid ${cardErrors.cvv ? 'var(--danger)' : 'var(--border-color)'}`, outline: 'none' }} />
                  {cardErrors.cvv && <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{cardErrors.cvv}</div>}
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginTop: '1.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.paymentAgreed} onChange={(e) => setFormData({...formData, paymentAgreed: e.target.checked})} style={{ marginTop: '0.25rem' }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  I confirm that I am authorized to use this {formData.paymentMethod || 'Customer Card'} and agree to the booking terms and conditions.
                </span>
              </label>
            </div>

            {/* Booking Summary (Full Width) */}
            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ background: 'var(--bg-topnav)', padding: '1.25rem 2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plane size={20} style={{ color: 'var(--primary-accent)' }} />
                <h3 style={{ fontWeight: 600, fontSize: '1.125rem', margin: 0 }}>Booking Summary</h3>
              </div>

              <div style={{ padding: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem' }}>Total Cost</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>${totalCost.toFixed(2)}</div>
                  </div>

                  <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem' }}>MCO</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>${baseMCO.toFixed(2)}</div>
                  </div>

                  <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem' }}>Actual Cost</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.customActualCost !== null ? formData.customActualCost : (baseFare > 0 ? actualCost.toFixed(2) : '')}
                        onChange={(e) => setFormData({...formData, customActualCost: e.target.value === '' ? null : parseFloat(e.target.value) || 0})}
                        style={{ width: '100%', padding: '0.35rem 0.5rem', border: '1.5px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '1.2rem', outline: 'none', background: 'white', color: 'var(--text-primary)', transition: 'border-color 0.15s' }}
                        onFocus={e => e.target.style.borderColor = 'var(--primary-accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                      />
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem' }}>Actual MCO</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.customActualMCO !== null ? formData.customActualMCO : actualMCO.toFixed(2)}
                        onChange={(e) => setFormData({...formData, customActualMCO: e.target.value === '' ? null : parseFloat(e.target.value) || 0})}
                        style={{ width: '100%', padding: '0.35rem 0.5rem', border: '1.5px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '1.2rem', outline: 'none', background: 'white', color: 'var(--text-primary)', transition: 'border-color 0.15s' }}
                        onFocus={e => e.target.style.borderColor = 'var(--primary-accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Remark</label>
                  <textarea
                    value={formData.remark || ''}
                    onChange={(e) => setFormData({...formData, remark: e.target.value})}
                    placeholder="Add any remarks or notes about this booking..."
                    rows={3}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: '0.9rem', resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Flight Selection */}
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
                  <Plane size={20} style={{ color: 'var(--primary-accent)' }} /> Flight Selection
                </h2>
                <div style={{ background: 'white', padding: '0.25rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)', display: 'inline-flex' }}>
                  <button onClick={() => setTripType('Round Trip')} style={{ padding: '0.35rem 1rem', borderRadius: 'var(--radius-full)', background: tripType === 'Round Trip' ? 'var(--primary-accent)' : 'transparent', color: tripType === 'Round Trip' ? 'white' : 'var(--text-secondary)', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Round Trip</button>
                  <button onClick={() => setTripType('One Way')} style={{ padding: '0.35rem 1rem', borderRadius: 'var(--radius-full)', background: tripType === 'One Way' ? 'var(--primary-accent)' : 'transparent', color: tripType === 'One Way' ? 'white' : 'var(--text-secondary)', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>One Way</button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
                {/* OUTBOUND COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ background: 'var(--bg-base)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Outbound Flight</label>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-accent)', background: 'rgba(56, 178, 172, 0.1)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                        {formData.fromAirport} → {formData.toAirport}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input type="text" placeholder={`e.g. DL ${formData.fromAirport} ${formData.toAirport}`} value={outboundSearchQuery} onChange={(e) => setOutboundSearchQuery(e.target.value)} onKeyDown={handleOutboundKeyDown} style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                        {outboundSearchQuery && (<button onClick={clearOutboundSearch} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={16} /></button>)}
                      </div>
                      <button onClick={handleOutboundSearch} disabled={isOutboundSearching} style={{ background: 'var(--primary-accent)', color: 'white', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 600, border: 'none', cursor: isOutboundSearching ? 'default' : 'pointer', opacity: isOutboundSearching ? 0.8 : 1 }}>
                        {isOutboundSearching ? <Loader2 size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> : 'Search'}
                      </button>
                    </div>
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', margin: 0 }}>
                    Availability {outboundActiveSearch && <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Filtered: "{outboundActiveSearch}"</span>}
                  </h3>
                  {isOutboundSearching && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>{[1, 2].map(i => (<div key={i} style={{ background: 'white', height: '120px', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s infinite ease-in-out' }}></div>))}</div>
                  )}
                  {!isOutboundSearching && outboundSearchComplete && outboundFlights.length > 0 && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {outboundFlights.map(flight => {
                        const isSelected = formData.outboundFlight?.id === flight.id;
                        return (
                          <div key={flight.id} style={{ background: isSelected ? 'rgba(56, 178, 172, 0.03)' : 'white', border: `2px solid ${isSelected ? 'var(--primary-accent)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-lg)', padding: '1rem', position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: flight.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem' }}>{flight.airlineCode}</div>
                                <div>
                                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{flight.airline}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Flight {flight.id}</div>
                                </div>
                              </div>
                              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>${flight.price.toFixed(2)}</div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1rem', fontWeight: 700 }}>{flight.time}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{flight.route}</div>
                              </div>
                              <div style={{ flex: 1, padding: '0 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{flight.duration}</div>
                                <div style={{ width: '100%', height: '1px', background: 'var(--border-color)', position: 'relative', margin: '0.25rem 0' }}>
                                  <Plane size={12} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(90deg)', color: 'var(--text-muted)' }} />
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--success)' }}>{flight.stops}</div>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1rem', fontWeight: 700 }}>{flight.arrTime}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{flight.dest}</div>
                              </div>
                            </div>
                            <button onClick={() => selectOutboundFlight(flight)} style={{ width: '100%', background: isSelected ? 'var(--primary-accent)' : 'white', color: isSelected ? 'white' : 'var(--primary-accent)', border: '1px solid var(--primary-accent)', padding: '0.5rem', borderRadius: 'var(--radius-full)', fontWeight: 600, cursor: 'pointer' }}>
                              {isSelected ? 'Remove' : 'Select'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {!isOutboundSearching && outboundSearchComplete && outboundFlights.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No flights found.</p>
                    </div>
                  )}
                </div>

                {/* INBOUND COLUMN */}
                {tripType === 'Round Trip' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ background: 'var(--bg-base)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Return Flight</label>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--secondary-accent)', background: 'rgba(154, 70, 255, 0.1)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                          {formData.toAirport} → {formData.fromAirport}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                          <input type="text" placeholder={`e.g. AA ${formData.toAirport} ${formData.fromAirport}`} value={inboundSearchQuery} onChange={(e) => setInboundSearchQuery(e.target.value)} onKeyDown={handleInboundKeyDown} style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', fontWeight: 600, fontSize: '0.875rem' }} />
                          {inboundSearchQuery && (<button onClick={clearInboundSearch} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={16} /></button>)}
                        </div>
                        <button onClick={handleInboundSearch} disabled={isInboundSearching} style={{ background: 'var(--primary-accent)', color: 'white', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 600, border: 'none', cursor: isInboundSearching ? 'default' : 'pointer', opacity: isInboundSearching ? 0.8 : 1 }}>
                          {isInboundSearching ? <Loader2 size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> : 'Search'}
                        </button>
                      </div>
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', margin: 0 }}>
                      Availability {inboundActiveSearch && <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Filtered: "{inboundActiveSearch}"</span>}
                    </h3>
                    {isInboundSearching && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>{[1, 2].map(i => (<div key={i} style={{ background: 'white', height: '120px', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s infinite ease-in-out' }}></div>))}</div>
                    )}
                    {!isInboundSearching && inboundSearchComplete && inboundFlights.length > 0 && (
                      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {inboundFlights.map(flight => {
                          const isSelected = formData.inboundFlight?.id === flight.id;
                          return (
                            <div key={flight.id} style={{ background: isSelected ? 'rgba(56, 178, 172, 0.03)' : 'white', border: `2px solid ${isSelected ? 'var(--primary-accent)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-lg)', padding: '1rem', position: 'relative' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: flight.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem' }}>{flight.airlineCode}</div>
                                  <div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{flight.airline}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Flight {flight.id}</div>
                                  </div>
                                </div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>${flight.price.toFixed(2)}</div>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>{flight.time}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{flight.route}</div>
                                </div>
                                <div style={{ flex: 1, padding: '0 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{flight.duration}</div>
                                  <div style={{ width: '100%', height: '1px', background: 'var(--border-color)', position: 'relative', margin: '0.25rem 0' }}>
                                    <Plane size={12} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(90deg)', color: 'var(--text-muted)' }} />
                                  </div>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--success)' }}>{flight.stops}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>{flight.arrTime}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{flight.dest}</div>
                                </div>
                              </div>
                              <button onClick={() => selectInboundFlight(flight)} style={{ width: '100%', background: isSelected ? 'var(--primary-accent)' : 'white', color: isSelected ? 'white' : 'var(--primary-accent)', border: '1px solid var(--primary-accent)', padding: '0.5rem', borderRadius: 'var(--radius-full)', fontWeight: 600, cursor: 'pointer' }}>
                                {isSelected ? 'Remove' : 'Select'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {!isInboundSearching && inboundSearchComplete && inboundFlights.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No flights found.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Cost Breakdown */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <DollarSign size={20} style={{ color: 'var(--success)' }} /> Cost Breakdown
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Merchant Name</label>
                  <select value={formData.merchantName || ''} onChange={(e) => setFormData({...formData, merchantName: e.target.value})} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white' }}>
                    <option value="">Select Merchant</option>
                    <option value="ZSM Travel">ZSM Travel</option>
                    <option value="Global Travels">Global Travels</option>
                    <option value="Aero Tickets">Aero Tickets</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Vendor Code</label>
                  <select value={formData.vendorCode || ''} onChange={(e) => setFormData({...formData, vendorCode: e.target.value})} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white' }}>
                    <option value="">Select Vendor Code</option>
                    <option value="VND-001">VND-001</option>
                    <option value="VND-002">VND-002</option>
                    <option value="VND-003">VND-003</option>
                  </select>
                </div>
              </div>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'inline-block', background: 'var(--bg-base)', padding: '0.75rem 2rem', borderRadius: 'var(--radius-full)', fontWeight: 700, letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '1rem' }}>ZSM TRAVEL RECEIPT</div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)', margin: '0 0 0.25rem' }}>${totalCost.toFixed(2)}</h3>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Total Amount to be charged in USD</p>
              </div>
              <div style={{ borderTop: '1px dashed var(--border-color)', borderBottom: '1px dashed var(--border-color)', padding: '1.5rem 0', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Flight Fare ({formData.passengersCount}x)</span>
                  <span style={{ fontWeight: 600 }}>${baseFare.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Taxes &amp; Carrier Imposed Fees</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontWeight: 600 }}>$</span>
                    <input type="number" step="0.01" value={formData.customTaxes !== null ? formData.customTaxes : taxes.toFixed(2)} onChange={(e) => setFormData({...formData, customTaxes: e.target.value === '' ? null : parseFloat(e.target.value) || 0})} style={{ width: '80px', padding: '0.25rem 0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', textAlign: 'right', fontWeight: 600, outline: 'none' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>ZSM Service Fee</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontWeight: 600 }}>$</span>
                    <input type="number" step="0.01" value={formData.customServiceFee !== null ? formData.customServiceFee : serviceFee.toFixed(2)} onChange={(e) => setFormData({...formData, customServiceFee: e.target.value === '' ? null : parseFloat(e.target.value) || 0})} style={{ width: '80px', padding: '0.25rem 0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', textAlign: 'right', fontWeight: 600, outline: 'none' }} />
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                By clicking confirm, you agree to the fare rules and terms of service.
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
               <CreditCard size={24} style={{ color: '#805ad5' }} /> Secure Payment
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '-1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: formData.paymentMethod === 'Customer Card' ? '#ebf4ff' : 'white', padding: '0.75rem 1rem', border: `1px solid ${formData.paymentMethod === 'Customer Card' ? '#3182ce' : 'var(--border-color)'}`, borderRadius: 'var(--radius-md)' }}>
                  <input type="radio" name="paymentMethod" value="Customer Card" checked={formData.paymentMethod === 'Customer Card'} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} style={{ accentColor: '#3182ce', width: '1.25rem', height: '1.25rem' }} />
                  <span style={{ fontWeight: 600, color: formData.paymentMethod === 'Customer Card' ? '#2b6cb0' : 'var(--text-primary)' }}>Customer Card</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: formData.paymentMethod === 'Company Card' ? '#ebf4ff' : 'white', padding: '0.75rem 1rem', border: `1px solid ${formData.paymentMethod === 'Company Card' ? '#3182ce' : 'var(--border-color)'}`, borderRadius: 'var(--radius-md)' }}>
                  <input type="radio" name="paymentMethod" value="Company Card" checked={formData.paymentMethod === 'Company Card'} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} style={{ accentColor: '#3182ce', width: '1.25rem', height: '1.25rem' }} />
                  <span style={{ fontWeight: 600, color: formData.paymentMethod === 'Company Card' ? '#2b6cb0' : 'var(--text-primary)' }}>Company Card</span>
                </label>
              </div>

              <div style={{ background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)', padding: '2rem', borderRadius: '1rem', color: 'white', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)', position: 'relative', overflow: 'hidden', maxWidth: '500px' }}>
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>
                
                <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ fontSize: '1rem', letterSpacing: '2px', opacity: 0.7, fontWeight: 600 }}>CREDIT CARD</div>
                    {detectedCardType !== 'unknown' && (
                      <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.15)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', letterSpacing: '1px', fontWeight: 600 }}>
                        {getCardTypeName(detectedCardType).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <CreditCard size={28} style={{ opacity: 0.9 }} />
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '0.25rem' }}>Card Number</label>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    placeholder={detectedCardType === 'amex' ? '0000 000000 00000' : '0000 0000 0000 0000'}
                    value={formData.cardNumber}
                    onChange={handleCardNumberChange}
                    onBlur={() => handleCardBlur('cardNumber')}
                    style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `1px solid ${cardTouched.cardNumber && cardErrors.cardNumber ? '#fc8181' : 'rgba(255,255,255,0.2)'}`, color: 'white', fontSize: '1.5rem', letterSpacing: '3px', outline: 'none', padding: '0.25rem 0', fontFamily: 'monospace' }}
                  />
                  {cardTouched.cardNumber && cardErrors.cardNumber && (
                    <div style={{ color: '#fc8181', fontSize: '0.7rem', marginTop: '0.35rem', fontFamily: 'Inter, sans-serif', letterSpacing: '0' }}>{cardErrors.cardNumber}</div>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '0.25rem' }}>Expiry Date</label>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      placeholder="MM/YY" 
                      value={formData.expiryDate}
                      onChange={handleExpiryChange}
                      onBlur={() => handleCardBlur('expiryDate')}
                      maxLength={5}
                      style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `1px solid ${cardTouched.expiryDate && cardErrors.expiryDate ? '#fc8181' : 'rgba(255,255,255,0.2)'}`, color: 'white', fontSize: '1.25rem', letterSpacing: '2px', outline: 'none', padding: '0.25rem 0', fontFamily: 'monospace' }}
                    />
                    {cardTouched.expiryDate && cardErrors.expiryDate && (
                      <div style={{ color: '#fc8181', fontSize: '0.7rem', marginTop: '0.35rem', fontFamily: 'Inter, sans-serif', letterSpacing: '0' }}>{cardErrors.expiryDate}</div>
                    )}
                  </div>
                  <div style={{ width: '100px' }}>
                    <label style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '0.25rem' }}>CVV</label>
                    <input 
                      type="password" 
                      inputMode="numeric"
                      placeholder={detectedCardType === 'amex' ? '****' : '***'}
                      value={formData.cvv}
                      onChange={handleCvvChange}
                      onBlur={() => handleCardBlur('cvv')}
                      maxLength={cvvMaxLength}
                      style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `1px solid ${cardTouched.cvv && cardErrors.cvv ? '#fc8181' : 'rgba(255,255,255,0.2)'}`, color: 'white', fontSize: '1.25rem', letterSpacing: '2px', outline: 'none', padding: '0.25rem 0', fontFamily: 'monospace' }}
                    />
                    {cardTouched.cvv && cardErrors.cvv && (
                      <div style={{ color: '#fc8181', fontSize: '0.7rem', marginTop: '0.35rem', fontFamily: 'Inter, sans-serif', letterSpacing: '0' }}>{cardErrors.cvv}</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div style={{ background: '#fffaf0', border: '1px solid #feebc8', padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <ShieldAlert size={24} style={{ color: '#dd6b20', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontWeight: 700, color: '#9c4221', marginBottom: '0.5rem' }}>Mandatory Customer Declaration</h4>
                  <p style={{ fontSize: '0.875rem', color: '#c05621', marginBottom: '1rem', lineHeight: 1.5 }}>
                    I authorize ZSM Travel to charge the total amount in USD to my credit card. I understand that tickets are non-refundable unless stated otherwise in the fare rules.
                  </p>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={formData.paymentAgreed}
                      onChange={(e) => setFormData({...formData, paymentAgreed: e.target.checked})}
                      style={{ width: '1.25rem', height: '1.25rem', accentColor: '#dd6b20' }} 
                    />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#7b341e' }}>I have read this declaration to the customer and they agreed.</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="animate-fade-in">
             <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
               <DollarSign size={24} style={{ color: 'var(--success)' }} /> Final Review
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '600px' }}>
              
              <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                 <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                     <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>1. Flight Selection</div>
                     <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                       {formData.outboundFlight?.airline} {formData.outboundFlight?.id} 
                       {tripType === 'Round Trip' && formData.inboundFlight ? ` & ${formData.inboundFlight.airline} ${formData.inboundFlight.id}` : ''}
                     </div>
                   </div>
                   <button onClick={() => { setReturnStep(4); setCurrentStep(1); }} style={{ background: 'var(--bg-base)', border: 'none', padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-md)', fontWeight: 600, color: 'var(--primary-accent)', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#e6fffa'} onMouseOut={e => e.currentTarget.style.background = 'var(--bg-base)'}>Edit</button>
                 </div>

                 <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                     <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>2. Passenger Details</div>
                     <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                       {formData.passengersCount} Passenger(s) • Primary: {formData.passengers[0]?.firstName || 'N/A'} {formData.passengers[0]?.lastName || ''}
                     </div>
                   </div>
                   <button onClick={() => { setReturnStep(4); setCurrentStep(2); }} style={{ background: 'var(--bg-base)', border: 'none', padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-md)', fontWeight: 600, color: 'var(--primary-accent)', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#e6fffa'} onMouseOut={e => e.currentTarget.style.background = 'var(--bg-base)'}>Edit</button>
                 </div>

                 <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                     <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>3. Payment</div>
                     <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                       Credit Card ending in ****
                     </div>
                   </div>
                   <button onClick={() => { setReturnStep(4); setCurrentStep(3); }} style={{ background: 'var(--bg-base)', border: 'none', padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-md)', fontWeight: 600, color: 'var(--primary-accent)', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#e6fffa'} onMouseOut={e => e.currentTarget.style.background = 'var(--bg-base)'}>Edit</button>
                 </div>
              </div>

              <div style={{ background: 'white', padding: '2.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Merchant Name</label>
                      <select value={formData.merchantName || ''} onChange={(e) => setFormData({...formData, merchantName: e.target.value})} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white' }}>
                        <option value="">Select Merchant</option>
                        <option value="ZSM Travel">ZSM Travel</option>
                        <option value="Global Travels">Global Travels</option>
                        <option value="Aero Tickets">Aero Tickets</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Vendor Code</label>
                      <select value={formData.vendorCode || ''} onChange={(e) => setFormData({...formData, vendorCode: e.target.value})} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white' }}>
                        <option value="">Select Vendor Code</option>
                        <option value="VND-001">VND-001</option>
                        <option value="VND-002">VND-002</option>
                        <option value="VND-003">VND-003</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'inline-block', background: 'var(--bg-base)', padding: '0.75rem 2rem', borderRadius: 'var(--radius-full)', fontWeight: 700, letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      ZSM TRAVEL RECEIPT
                    </div>
                    <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>${totalCost.toFixed(2)}</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Total Amount to be charged in USD</p>
                  </div>
                  
                  <div style={{ borderTop: '1px dashed var(--border-color)', borderBottom: '1px dashed var(--border-color)', padding: '1.5rem 0', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Flight Fare ({formData.passengersCount}x)</span>
                      <span style={{ fontWeight: 600 }}>${baseFare.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Taxes & Carrier Imposed Fees</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ fontWeight: 600 }}>$</span>
                        <input type="number" step="0.01" value={formData.customTaxes !== null ? formData.customTaxes : taxes.toFixed(2)} onChange={(e) => setFormData({...formData, customTaxes: e.target.value === '' ? null : parseFloat(e.target.value) || 0})} style={{ width: '80px', padding: '0.25rem 0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', textAlign: 'right', fontWeight: 600, outline: 'none' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>ZSM Service Fee</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ fontWeight: 600 }}>$</span>
                        <input type="number" step="0.01" value={formData.customServiceFee !== null ? formData.customServiceFee : serviceFee.toFixed(2)} onChange={(e) => setFormData({...formData, customServiceFee: e.target.value === '' ? null : parseFloat(e.target.value) || 0})} style={{ width: '80px', padding: '0.25rem 0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', textAlign: 'right', fontWeight: 600, outline: 'none' }} />
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    By clicking confirm, you agree to the fare rules and terms of service. E-tickets will be issued instantly upon successful payment.
                  </div>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="animate-fade-in" style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', 
              background: 'var(--warning)', color: 'white', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              margin: '0 auto 1.5rem',
              boxShadow: '0 0 0 10px rgba(237, 137, 54, 0.2)',
            }}>
              <Clock size={40} strokeWidth={3} />
            </div>
            
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>Booking Pending!</h2>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
              A Customer ID and Booking ID have been generated. The booking is currently pending. After getting email confirmation from the Customer, the Credit Card will be charged.
              <br/><br/>
              <strong style={{ color: 'var(--success)' }}>✓ A PDF itinerary has been generated and sent to {formData.passengers[0]?.email || "the customer's email"}.</strong>
            </p>
            
            <div id="booking-receipt" style={{ 
              display: 'inline-block',
              background: 'white',
              border: '2px solid var(--warning)',
              padding: '2rem 3rem',
              borderRadius: 'var(--radius-lg)',
              position: 'relative'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', textAlign: 'left', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Customer ID</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-primary)' }}>C-8932</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Booking ID</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-primary)' }}>B-23490</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', textAlign: 'left', marginBottom: '2rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Merchant Name</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formData.merchantName || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Vendor Code</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formData.vendorCode || 'N/A'}</div>
                </div>
              </div>

              <div style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Record Locator (PNR)</div>
              <div style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '4px', color: 'var(--primary-accent)', marginBottom: '1rem' }}>X7Y8Z9</div>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</div>
                  <div style={{ fontWeight: 700, color: 'var(--warning)' }}>PENDING</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Amount to be Charged</div>
                  <div style={{ fontWeight: 700 }}>${totalCost.toFixed(2)}</div>
                </div>
              </div>
              
              <div id="pdf-download-btn" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button onClick={handleDownloadPdf} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', color: 'var(--primary-accent)', border: '1px solid var(--primary-accent)', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                  <Download size={18} /> Download PDF Receipt
                </button>
                <button onClick={() => navigate('/booking/B-23490')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary-accent)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                  <ExternalLink size={18} /> View Booking & Signature Status
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem', boxSizing: 'border-box' }}>
      {/* CSS for animations */}
      <style dangerouslySetInnerHTML={{__html: `
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .layout-container { display: flex; flex-direction: column; gap: 2rem; width: 100%; }
        .layout-main { width: 100%; max-width: 100%; min-width: 0; display: flex; flex-direction: column; gap: 1.5rem; }
        .layout-main > div { width: 100%; }
        .pnr-agency-grid { display: grid; grid-template-columns: minmax(0, 1.15fr) auto minmax(0, 1fr); gap: 2rem; }
        .pnr-agency-divider { width: 1px; border-left: 1px dashed var(--border-color); }
        @media (max-width: 860px) {
          .pnr-agency-grid { grid-template-columns: 1fr; }
          .pnr-agency-divider { display: none; }
        }
      `}} />

      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>New Reservation</h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Complete the steps below to secure the booking.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          
          <div style={{ background: 'white', padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <User size={16} /> Passengers
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
            <button 
               onClick={() => updatePassengersCount(formData.passengersCount - 1)}
               disabled={formData.passengersCount <= 1}
               style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-base)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: formData.passengersCount <= 1 ? 'not-allowed' : 'pointer', opacity: formData.passengersCount <= 1 ? 0.5 : 1, color: 'var(--text-primary)' }}
            >
              <Minus size={14} strokeWidth={3} />
            </button>
            <span style={{ fontWeight: 700, width: '20px', textAlign: 'center', color: 'var(--text-primary)' }}>{formData.passengersCount}</span>
            <button 
               onClick={() => updatePassengersCount(formData.passengersCount + 1)}
               disabled={formData.passengersCount >= 9}
               style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-base)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: formData.passengersCount >= 9 ? 'not-allowed' : 'pointer', opacity: formData.passengersCount >= 9 ? 0.5 : 1, color: 'var(--text-primary)' }}
            >
              <Plus size={14} strokeWidth={3} />
            </button>
          </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Horizontal Stepper (Full Width) */}
        <div style={{ background: 'white', padding: '1.5rem 2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: '4rem', right: '4rem', height: '2px', background: 'var(--bg-base)', zIndex: 0, transform: 'translateY(-50%)' }}>
            <div style={{ height: '100%', background: 'var(--primary-accent)', transition: 'width 0.4s ease', width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}></div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            {steps.map(step => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
                <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100px', gap: '0.5rem' }}>
                  <div 
                    style={{ 
                      width: '36px', height: '36px', borderRadius: '50%', 
                      background: isCompleted ? 'var(--primary-accent)' : (isActive ? 'white' : 'var(--bg-base)'),
                      color: isCompleted ? 'white' : (isActive ? 'var(--primary-accent)' : 'var(--text-muted)'),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `2px solid ${isCompleted || isActive ? 'var(--primary-accent)' : 'var(--border-color)'}`,
                      boxShadow: isActive ? '0 0 0 4px rgba(56, 178, 172, 0.15)' : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isCompleted ? <Check size={16} strokeWidth={3} /> : step.icon}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: isActive || isCompleted ? 700 : 500, color: isActive ? 'var(--primary-accent)' : (isCompleted ? 'var(--text-primary)' : 'var(--text-muted)'), textAlign: 'center' }}>
                    {step.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="layout-container">
          
          {/* Main Content (Left Column) */}
          <div className="layout-main">
            {renderStep()}

            {/* Navigation Buttons */}
            {currentStep < 5 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                <button 
                  onClick={handlePrev}
                  disabled={currentStep === 1}
                  style={{ 
                    opacity: currentStep === 1 ? 0.5 : 1,
                    pointerEvents: currentStep === 1 ? 'none' : 'auto',
                    padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-base)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                >
                  <ChevronLeft size={18} /> Back
                </button>
                
                <button 
                  onClick={handleNext}
                  disabled={isNextDisabled}
                  style={{ 
                    padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: isNextDisabled ? 'var(--text-muted)' : 'var(--primary-accent)',
                    border: 'none', borderRadius: 'var(--radius-md)', color: 'white', fontWeight: 600, 
                    cursor: isNextDisabled ? 'not-allowed' : 'pointer',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseOver={(e) => { if(!e.currentTarget.disabled) e.currentTarget.style.opacity = 0.9; }}
                  onMouseOut={(e) => { if(!e.currentTarget.disabled) e.currentTarget.style.opacity = 1; }}
                >
                  {currentStep === 4
                    ? isSaving
                      ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
                      : <>Confirm &amp; Ticket <ChevronRight size={18} /></>
                    : <>Continue <ChevronRight size={18} /></>}
                </button>
              </div>
            )}
            
            {currentStep === 5 && (
               <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                 <button 
                  onClick={() => {
                    setReturnStep(null);
                    setCurrentStep(1);
                    setOutboundSearchComplete(true);
                    setInboundSearchComplete(true);
                    setOutboundSearchQuery('');
                    setInboundSearchQuery('');
                    setOutboundActiveSearch('');
                    setInboundActiveSearch('');
                    setFormData({...formData, outboundFlight: null, inboundFlight: null, paymentMethod: 'Customer Card', cardNumber: '', expiryDate: '', cvv: '', paymentAgreed: false, customTaxes: null, customServiceFee: null, customActualCost: null, customActualMCO: null, merchantName: '', vendorCode: '', passengersCount: 1, passengers: [{ title: 'Mr', passengerType: 'Adult', firstName: '', middleName: '', lastName: '', dob: '', gender: 'Male', phoneCode: '+1', phone: '', altPhoneCode: '+1', altPhone: '', email: '', eTicket: '', carryOn: '1 Bag (Included)', checkInBag: 'None', insurance: 'None' }]});
                    setCardErrors({ cardNumber: '', expiryDate: '', cvv: '' });
                    setCardTouched({ cardNumber: false, expiryDate: false, cvv: false });
                  }}
                  style={{ padding: '0.75rem 2rem', background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Start New Booking
                </button>
               </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default NewBooking;
