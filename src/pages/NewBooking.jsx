import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check, CreditCard, User, Plane, DollarSign, Search, Calendar, ShieldAlert, ArrowRightLeft, Briefcase, PlaneTakeoff, PlaneLanding, Clock, Award, Loader2, X, Plus, Minus, Download, ExternalLink } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const steps = [
  { id: 1, title: 'Flight Selection', icon: <Search size={18} /> },
  { id: 2, title: 'Passenger Details', icon: <User size={18} /> },
  { id: 3, title: 'Payment', icon: <CreditCard size={18} /> },
  { id: 4, title: 'Cost Breakdown', icon: <DollarSign size={18} /> },
  { id: 5, title: 'Confirmation', icon: <Check size={18} /> }
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
  const [currentStep, setCurrentStep] = useState(() => {
    try {
      const saved = localStorage.getItem('newBookingDraft');
      if (saved) return JSON.parse(saved).currentStep || 1;
    } catch(e) {}
    return 1;
  });
  const [returnStep, setReturnStep] = useState(null);
  const [tripType, setTripType] = useState(() => {
    try {
      const saved = localStorage.getItem('newBookingDraft');
      if (saved) return JSON.parse(saved).tripType || 'Round Trip';
    } catch(e) {}
    return 'Round Trip';
  });
  
  const [outboundSearchQuery, setOutboundSearchQuery] = useState('');
  const [outboundActiveSearch, setOutboundActiveSearch] = useState('');
  const [isOutboundSearching, setIsOutboundSearching] = useState(false);
  const [outboundSearchComplete, setOutboundSearchComplete] = useState(true);

  const [inboundSearchQuery, setInboundSearchQuery] = useState('');
  const [inboundActiveSearch, setInboundActiveSearch] = useState('');
  const [isInboundSearching, setIsInboundSearching] = useState(false);
  const [inboundSearchComplete, setInboundSearchComplete] = useState(true);
  
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem('newBookingDraft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.formData) return parsed.formData;
      }
    } catch(e) {}
    return {
      passengersCount: 1,
      outboundFlight: null,
      inboundFlight: null,
      fromAirport: 'JFK',
      toAirport: 'LAX',
      passengers: [{ title: 'Mr', firstName: '', middleName: '', lastName: '', dob: '', gender: 'Male', phoneCode: '+1', phone: '', altPhoneCode: '+1', altPhone: '', email: '', eTicket: '', carryOn: '1 Bag (Included)', checkInBag: 'None', insurance: 'None' }],
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
      vendorCode: ''
    };
  });

  const [cardErrors, setCardErrors] = useState({ cardNumber: '', expiryDate: '', cvv: '' });
  const [cardTouched, setCardTouched] = useState({ cardNumber: false, expiryDate: false, cvv: false });

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('newBookingDraft', JSON.stringify({ currentStep, tripType, formData }));
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

  const handleNext = () => {
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
         newPassengers.push({ title: 'Mr', firstName: '', middleName: '', lastName: '', dob: '', gender: 'Male', phoneCode: '+1', phone: '', altPhoneCode: '+1', altPhone: '', email: '', eTicket: '', carryOn: '1 Bag (Included)', checkInBag: 'None', insurance: 'None' });
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
  const actualMCO = formData.customActualMCO !== null ? formData.customActualMCO : 20.00;
  const actualCost = formData.customActualCost !== null ? formData.customActualCost : (baseFare + taxes);
  const totalCost = baseFare > 0 ? actualCost + serviceFee : 0;
  const sidebarTotalCost = baseFare > 0 ? actualCost + actualMCO : 0;

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

  const isStep1Valid = tripType === 'Round Trip' ? (formData.outboundFlight && formData.inboundFlight) : (formData.outboundFlight !== null);
  const isStep2Valid = formData.passengers.every(p => p.firstName.trim() && p.lastName.trim() && p.dob && p.phone.trim());
  
  const isNextDisabled = (currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid) || (currentStep === 3 && (!formData.paymentAgreed || !isCardValid));

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="animate-fade-in">
            <div style={{ background: 'white', padding: '0.5rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)', display: 'inline-flex', marginBottom: '2rem' }}>
               <button 
                  onClick={() => setTripType('Round Trip')}
                  style={{ padding: '0.5rem 1.5rem', borderRadius: 'var(--radius-full)', background: tripType === 'Round Trip' ? 'var(--primary-accent)' : 'transparent', color: tripType === 'Round Trip' ? 'white' : 'var(--text-secondary)', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
               >Round Trip</button>
               <button 
                  onClick={() => setTripType('One Way')}
                  style={{ padding: '0.5rem 1.5rem', borderRadius: 'var(--radius-full)', background: tripType === 'One Way' ? 'var(--primary-accent)' : 'transparent', color: tripType === 'One Way' ? 'white' : 'var(--text-secondary)', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
               >One Way</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
              
              {/* OUTBOUND COLUMN */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Outbound Flight</label>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-accent)', background: 'rgba(56, 178, 172, 0.1)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                      {formData.fromAirport} → {formData.toAirport}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" 
                        placeholder={`e.g. DL ${formData.fromAirport} ${formData.toAirport}`}
                        value={outboundSearchQuery}
                        onChange={(e) => setOutboundSearchQuery(e.target.value)}
                        onKeyDown={handleOutboundKeyDown}
                        style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', fontWeight: 600, fontSize: '0.875rem' }} 
                      />
                      {outboundSearchQuery && (
                        <button onClick={clearOutboundSearch} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={16} /></button>
                      )}
                    </div>
                    <button onClick={handleOutboundSearch} disabled={isOutboundSearching} style={{ background: 'var(--primary-accent)', color: 'white', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 600, border: 'none', cursor: isOutboundSearching ? 'default' : 'pointer', opacity: isOutboundSearching ? 0.8 : 1 }}>
                      {isOutboundSearching ? <Loader2 size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> : 'Search'}
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between' }}>
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
                  <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Inbound Flight</label>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-accent)', background: 'rgba(56, 178, 172, 0.1)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                        {formData.toAirport} → {formData.fromAirport}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                          type="text" 
                          placeholder={`e.g. DL ${formData.toAirport} ${formData.fromAirport}`}
                          value={inboundSearchQuery}
                          onChange={(e) => setInboundSearchQuery(e.target.value)}
                          onKeyDown={handleInboundKeyDown}
                          style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', fontWeight: 600, fontSize: '0.875rem' }} 
                        />
                        {inboundSearchQuery && (
                          <button onClick={clearInboundSearch} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={16} /></button>
                        )}
                      </div>
                      <button onClick={handleInboundSearch} disabled={isInboundSearching} style={{ background: 'var(--primary-accent)', color: 'white', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 600, border: 'none', cursor: isInboundSearching ? 'default' : 'pointer', opacity: isInboundSearching ? 0.8 : 1 }}>
                        {isInboundSearching ? <Loader2 size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> : 'Search'}
                      </button>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between' }}>
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
        );
      case 2:
        return (
          <div className="animate-fade-in" style={{ width: '100%', display: 'block' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
               <User size={24} style={{ color: 'var(--secondary-accent)' }} /> Passenger Details
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
              {formData.passengers.map((p, idx) => (
                <div key={idx} style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', width: '100%', display: 'block' }}>
                  <div style={{ background: 'var(--bg-base)', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--secondary-accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>{idx + 1}</div>
                      {formData.passengers.length > 1 ? `Passenger ${idx + 1}` : 'Adult Passenger'}
                    </div>
                    {idx === 0 && <span style={{ fontSize: '0.75rem', background: '#e2e8f0', color: '#4a5568', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>Primary Contact</span>}
                  </div>
                  <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Title</label>
                      <select value={p.title || 'Mr'} onChange={(e) => { const newP = [...formData.passengers]; newP[idx].title = e.target.value; setFormData({...formData, passengers: newP}); }} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white' }}>
                        <option>Mr</option>
                        <option>Mrs</option>
                        <option>Ms</option>
                        <option>Dr</option>
                        <option>Prof</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Date of Birth (Required)</label>
                      <div style={{ position: 'relative' }}>
                        <Calendar size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        <input type="date" value={p.dob || ''} onChange={(e) => { const newP = [...formData.passengers]; newP[idx].dob = e.target.value; setFormData({...formData, passengers: newP}); }} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none' }} />
                      </div>
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
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Phone Number (Required)</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select value={p.phoneCode || '+1'} onChange={(e) => { const newP = [...formData.passengers]; newP[idx].phoneCode = e.target.value; setFormData({...formData, passengers: newP}); }} style={{ width: '80px', padding: '0.75rem 0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white' }}>
                          <option value="+1">+1 (US/CA)</option>
                          <option value="+44">+44 (UK)</option>
                          <option value="+91">+91 (IN)</option>
                          <option value="+61">+61 (AU)</option>
                        </select>
                        <input type="tel" value={p.phone || ''} onChange={(e) => { const newP = [...formData.passengers]; newP[idx].phone = e.target.value; setFormData({...formData, passengers: newP}); }} style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none' }} placeholder="(555) 000-0000" />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Alt Phone Number (Optional)</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select value={p.altPhoneCode || '+1'} onChange={(e) => { const newP = [...formData.passengers]; newP[idx].altPhoneCode = e.target.value; setFormData({...formData, passengers: newP}); }} style={{ width: '80px', padding: '0.75rem 0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white' }}>
                          <option value="+1">+1 (US/CA)</option>
                          <option value="+44">+44 (UK)</option>
                          <option value="+91">+91 (IN)</option>
                          <option value="+61">+61 (AU)</option>
                        </select>
                        <input type="tel" value={p.altPhone || ''} onChange={(e) => { const newP = [...formData.passengers]; newP[idx].altPhone = e.target.value; setFormData({...formData, passengers: newP}); }} style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none' }} placeholder="(555) 000-0000" />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Email (Required)</label>
                      <input type="email" required value={p.email || ''} onChange={(e) => { const newP = [...formData.passengers]; newP[idx].email = e.target.value; setFormData({...formData, passengers: newP}); }} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none' }} placeholder="jane.doe@example.com" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>e-Ticket Number (Optional)</label>
                      <input type="text" value={p.eTicket || ''} onChange={(e) => { const newP = [...formData.passengers]; newP[idx].eTicket = e.target.value; setFormData({...formData, passengers: newP}); }} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none' }} placeholder="e.g. 012 3456789012" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Carry On (Baggage in flight)</label>
                      <select value={p.carryOn || '1 Bag (Included)'} onChange={(e) => { const newP = [...formData.passengers]; newP[idx].carryOn = e.target.value; setFormData({...formData, passengers: newP}); }} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white' }}>
                        <option>1 Bag (Included)</option>
                        <option>2 Bags (+$35)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Check In Bag (Luggage Bag)</label>
                      <select value={p.checkInBag || 'None'} onChange={(e) => { const newP = [...formData.passengers]; newP[idx].checkInBag = e.target.value; setFormData({...formData, passengers: newP}); }} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white' }}>
                        <option>None</option>
                        <option>1 Bag (+$50)</option>
                        <option>2 Bags (+$90)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Insurance (Optional)</label>
                      <select value={p.insurance || 'None'} onChange={(e) => { const newP = [...formData.passengers]; newP[idx].insurance = e.target.value; setFormData({...formData, passengers: newP}); }} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white' }}>
                        <option>None</option>
                        <option>Basic Coverage (+$15)</option>
                        <option>Premium Coverage (+$35)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* CSS for animations */}
      <style dangerouslySetInnerHTML={{__html: `
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .layout-container { display: flex; gap: 2rem; align-items: flex-start; justify-content: space-between; width: 100%; }
        .layout-main { flex: 0 0 760px; max-width: 760px; min-width: 0; display: flex; flex-direction: column; gap: 1.5rem; width: 100%; }
        .layout-main > div { width: 100%; }
        .layout-sidebar { flex: 0 0 340px; width: 340px; position: sticky; top: 2rem; z-index: 10; }
        @media (max-width: 992px) {
           .layout-container { flex-direction: column; }
           .layout-sidebar { width: 100%; position: static; }
           .layout-main { max-width: 100%; flex-basis: 100%; width: 100%; }
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
                  {currentStep === 4 ? 'Confirm & Ticket' : 'Continue'} <ChevronRight size={18} />
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
                    setFormData({...formData, outboundFlight: null, inboundFlight: null, paymentMethod: 'Customer Card', cardNumber: '', expiryDate: '', cvv: '', paymentAgreed: false, customTaxes: null, customServiceFee: null, customActualCost: null, customActualMCO: null, merchantName: '', vendorCode: '', passengersCount: 1, passengers: [{ title: 'Mr', firstName: '', middleName: '', lastName: '', dob: '', gender: 'Male', phoneCode: '+1', phone: '', altPhoneCode: '+1', altPhone: '', email: '', eTicket: '', carryOn: '1 Bag (Included)', checkInBag: 'None', insurance: 'None' }]});
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

          {/* Sticky Booking Summary (Right Column) */}
          <div className="layout-sidebar">
            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ background: 'var(--bg-topnav)', padding: '1.25rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plane size={20} style={{ color: 'var(--primary-accent)' }} />
                <h3 style={{ fontWeight: 600, fontSize: '1.125rem', margin: 0 }}>Booking Summary</h3>
              </div>
              
              <div style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem' }}>Itinerary</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: '1.125rem', color: 'var(--text-primary)' }}>
                    <span>{formData.fromAirport}</span>
                    <ArrowRightLeft size={16} style={{ color: 'var(--text-muted)' }} />
                    <span>{formData.toAirport}</span>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                   <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.75rem' }}>Outbound Flight</div>
                   {formData.outboundFlight ? (
                     <div>
                       <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formData.outboundFlight.airline} • {formData.outboundFlight.id}</div>
                       <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                         <span style={{ fontWeight: 600 }}>Depart:</span> {formData.outboundFlight.date} at {formData.outboundFlight.time}
                       </div>
                       <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Economy</div>
                     </div>
                   ) : (
                     <div style={{ fontSize: '0.875rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                       <AlertCircle size={14} /> Select outbound flight
                     </div>
                   )}
                </div>

                {tripType === 'Round Trip' && (
                  <div style={{ marginBottom: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                     <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.75rem' }}>Inbound Flight</div>
                     {formData.inboundFlight ? (
                       <div>
                         <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formData.inboundFlight.airline} • {formData.inboundFlight.id}</div>
                         <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                           <span style={{ fontWeight: 600 }}>Return:</span> {formData.inboundFlight.date} at {formData.inboundFlight.time}
                         </div>
                         <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Economy</div>
                       </div>
                     ) : (
                       <div style={{ fontSize: '0.875rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                         <AlertCircle size={14} /> Select inbound flight
                       </div>
                     )}
                  </div>
                )}

                <div style={{ marginBottom: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                   <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem' }}>Passengers</div>
                   <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formData.passengersCount} Traveler{formData.passengersCount > 1 ? 's' : ''}</div>
                </div>

                <div style={{ background: 'var(--bg-base)', margin: '-1.5rem -1.5rem 0', padding: '1.5rem', borderTop: '1px solid var(--border-color)', marginTop: '0' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                     <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Actual Cost</span>
                     {(formData.outboundFlight || (tripType === 'Round Trip' && formData.inboundFlight)) ? (
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                         <span style={{ fontWeight: 600 }}>$</span>
                         <input type="number" step="0.01" value={formData.customActualCost !== null ? formData.customActualCost : actualCost.toFixed(2)} onChange={(e) => setFormData({...formData, customActualCost: e.target.value === '' ? null : parseFloat(e.target.value) || 0})} style={{ width: '80px', padding: '0.25rem 0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', textAlign: 'right', fontWeight: 600, outline: 'none' }} />
                       </div>
                     ) : <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>---</span>}
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                     <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Actual MCO</span>
                     {(formData.outboundFlight || (tripType === 'Round Trip' && formData.inboundFlight)) ? (
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                         <span style={{ fontWeight: 600 }}>$</span>
                         <input type="number" step="0.01" value={formData.customActualMCO !== null ? formData.customActualMCO : actualMCO.toFixed(2)} onChange={(e) => setFormData({...formData, customActualMCO: e.target.value === '' ? null : parseFloat(e.target.value) || 0})} style={{ width: '80px', padding: '0.25rem 0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', textAlign: 'right', fontWeight: 600, outline: 'none' }} />
                       </div>
                     ) : <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>---</span>}
                   </div>
                   <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                     <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Total Price</span>
                     <span style={{ fontSize: '1.5rem', fontWeight: 800, color: (formData.outboundFlight || formData.inboundFlight) ? 'var(--success)' : 'var(--text-muted)' }}>
                       {(formData.outboundFlight || (tripType === 'Round Trip' && formData.inboundFlight)) ? `$${sidebarTotalCost.toFixed(2)}` : '---'}
                     </span>
                   </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Simple AlertCircle icon for the summary fallback
const AlertCircle = ({ size, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

export default NewBooking;
