import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
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
import EscalationReport from './pages/EscalationReport';
import PaymentPage from './pages/PaymentPage';
import LoginPage from './pages/LoginPage';
import UserManagement from './pages/UserManagement';
import AuditLogsPage from './pages/AuditLogsPage';
import RolesPermissions from './pages/RolesPermissions';
import UnauthorizedPage from './pages/UnauthorizedPage';
import SettingsLayout from './layouts/SettingsLayout';
import { useAuth } from './contexts/AuthContext';
import './App.css';
import './index.css';

function AppRoutes() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => {}} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>

          {/* ─── Default redirect ─── */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* ─── Unauthorized landing page ─── */}
          <Route path="unauthorized" element={<UnauthorizedPage />} />

          {/* ─── Dashboard ─── */}
          <Route path="dashboard" element={
            <ProtectedRoute featureKey="dashboard">
              <Dashboard />
            </ProtectedRoute>
          } />

          {/* ─── Search ─── */}
          <Route path="search" element={
            <ProtectedRoute featureKey="search">
              <SearchService />
            </ProtectedRoute>
          } />

          {/* ─── Customer Directory ─── */}
          <Route path="customer-directory" element={
            <ProtectedRoute featureKey="customer-directory">
              <CustomerDirectory />
            </ProtectedRoute>
          } />

          {/* ─── New Booking ─── */}
          <Route path="new-booking" element={
            <ProtectedRoute featureKey="new-booking">
              <NewBooking />
            </ProtectedRoute>
          } />

          {/* ─── Booking Actions ─── */}
          <Route path="profile-info-change" element={
            <ProtectedRoute featureKey="profile-info-change">
              <ProfileInfoChange />
            </ProtectedRoute>
          } />
          <Route path="change-itinerary" element={
            <ProtectedRoute featureKey="change-itinerary">
              <ChangeItinerary />
            </ProtectedRoute>
          } />
          <Route path="cancellation-refund" element={
            <ProtectedRoute featureKey="cancellation-refund">
              <CancellationRefund />
            </ProtectedRoute>
          } />
          <Route path="cancellation-credit" element={
            <ProtectedRoute featureKey="cancellation-credit">
              <CancellationCredit />
            </ProtectedRoute>
          } />
          <Route path="seat-assign" element={
            <ProtectedRoute featureKey="seat-assign">
              <SeatAssign />
            </ProtectedRoute>
          } />
          <Route path="add-baggage" element={
            <ProtectedRoute featureKey="add-baggage">
              <AddBaggage />
            </ProtectedRoute>
          } />
          <Route path="add-insurance" element={
            <ProtectedRoute featureKey="add-insurance">
              <AddInsurance />
            </ProtectedRoute>
          } />
          <Route path="pet-booking" element={
            <ProtectedRoute featureKey="pet-booking">
              <PetBooking />
            </ProtectedRoute>
          } />
          <Route path="seat-upgrade" element={
            <ProtectedRoute featureKey="seat-upgrade">
              <SeatUpgrade />
            </ProtectedRoute>
          } />
          <Route path="umnr-booking" element={
            <ProtectedRoute featureKey="umnr-booking">
              <UmnrBooking />
            </ProtectedRoute>
          } />

          {/* ─── Reports ─── */}
          <Route path="reports/retention-reports" element={
            <ProtectedRoute featureKey="retention-reports">
              <RetentionReports />
            </ProtectedRoute>
          } />
          <Route path="reports/escalation-report" element={
            <ProtectedRoute featureKey="escalation-report">
              <EscalationReport />
            </ProtectedRoute>
          } />
          <Route path="reports/leads" element={
            <ProtectedRoute featureKey="leads">
              <LeadsList />
            </ProtectedRoute>
          } />
          <Route path="bookings/create-lead" element={
            <ProtectedRoute featureKey="create-lead">
              <CreateLead />
            </ProtectedRoute>
          } />
          <Route path="reports/upcoming-trips-48-hrs" element={
            <ProtectedRoute featureKey="upcoming-trips">
              <UpcomingTrips />
            </ProtectedRoute>
          } />
          <Route path="reports/boarding-pass" element={
            <ProtectedRoute featureKey="boarding-pass">
              <BoardingPass />
            </ProtectedRoute>
          } />
          <Route path="reports/all-website-leads" element={
            <ProtectedRoute featureKey="all-website-leads">
              <AllWebsiteLeads />
            </ProtectedRoute>
          } />
          <Route path="reports/yesterday-sales" element={
            <ProtectedRoute featureKey="yesterday-sales">
              <YesterdaySales />
            </ProtectedRoute>
          } />
          
          {/* ─── Payment ─── */}
          <Route path="payment" element={
            <ProtectedRoute featureKey="payment">
              <PaymentPage />
            </ProtectedRoute>
          } />

          {/* ─── Admin / Settings (SettingsLayout handles its own inner gating) ─── */}
          <Route path="admin" element={<SettingsLayout />}>
            <Route index element={<Navigate to="user-management" replace />} />
            <Route path="user-management" element={
              <ProtectedRoute featureKey="user-management">
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="roles-permissions" element={
              <ProtectedRoute featureKey="roles-permissions">
                <RolesPermissions />
              </ProtectedRoute>
            } />
            <Route path="audit-logs" element={
              <ProtectedRoute featureKey="audit-logs">
                <AuditLogsPage />
              </ProtectedRoute>
            } />
          </Route>

          {/* ─── Utility pages (booking detail / signing — permission: Bookings:View) ─── */}
          <Route path="sign/:bookingId" element={
            <ProtectedRoute module="Bookings" action="View">
              <SignaturePortal />
            </ProtectedRoute>
          } />
          <Route path="booking/:bookingId" element={
            <ProtectedRoute module="Bookings" action="View">
              <BookingDetails />
            </ProtectedRoute>
          } />

          {/* ─── 404 Catch-all ─── */}
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

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
