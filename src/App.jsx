import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import NewBooking from './pages/NewBooking';
import SearchService from './pages/SearchService';
import RetentionReports from './pages/RetentionReports';
import ProfileInfoChange from './pages/ProfileInfoChange';
import ChangeItinerary from './pages/ChangeItinerary';
import CancellationRefund from './pages/CancellationRefund';
import CancellationCredit from './pages/CancellationCredit';
import CreateLead from './pages/CreateLead';
import LeadsList from './pages/LeadsList';
import CustomerDirectory from './pages/CustomerDirectory';
import UpcomingTrips from './pages/UpcomingTrips';
import BoardingPass from './pages/BoardingPass';
import AllWebsiteLeads from './pages/AllWebsiteLeads';
import SignaturePortal from './pages/SignaturePortal';
import BookingDetails from './pages/BookingDetails';
import SeatAssign from './pages/SeatAssign';
import AddBaggage from './pages/AddBaggage';
import AddInsurance from './pages/AddInsurance';
import PetBooking from './pages/PetBooking';
import SeatUpgrade from './pages/SeatUpgrade';
import UmnrBooking from './pages/UmnrBooking';
import YesterdaySales from './pages/YesterdaySales';
import './App.css';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="new-booking" element={<NewBooking />} />
          <Route path="search" element={<SearchService />} />
          <Route path="reports/retention-reports" element={<RetentionReports />} />
          <Route path="reports/create-lead" element={<CreateLead />} />
          <Route path="reports/leads" element={<LeadsList />} />
          <Route path="reports/boarding-pass" element={<BoardingPass />} />
          <Route path="reports/upcoming-trips-48-hrs" element={<UpcomingTrips />} />
          <Route path="reports/all-website-leads" element={<AllWebsiteLeads />} />
          <Route path="reports/yesterday-sales" element={<YesterdaySales />} />
          <Route path="customer-directory" element={<CustomerDirectory />} />
          <Route path="profile-info-change" element={<ProfileInfoChange />} />
          <Route path="change-itinerary" element={<ChangeItinerary />} />
          <Route path="cancellation-refund" element={<CancellationRefund />} />
          <Route path="cancellation-credit" element={<CancellationCredit />} />
          <Route path="seat-assign" element={<SeatAssign />} />
          <Route path="add-baggage" element={<AddBaggage />} />
          <Route path="add-insurance" element={<AddInsurance />} />
          <Route path="pet-booking" element={<PetBooking />} />
          <Route path="seat-upgrade" element={<SeatUpgrade />} />
          <Route path="umnr-booking" element={<UmnrBooking />} />
          <Route path="sign/:bookingId" element={<SignaturePortal />} />
          <Route path="booking/:bookingId" element={<BookingDetails />} />
          <Route path="*" element={
            <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
              <h2>Coming Soon</h2>
              <p className="text-secondary mt-4">This section is currently under development.</p>
            </div>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
