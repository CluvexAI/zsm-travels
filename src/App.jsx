import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import NewBooking from './pages/NewBooking';
import SearchService from './pages/SearchService';
import RetentionReports from './pages/RetentionReports';
import ProfileInfoChange from './pages/ProfileInfoChange';
import ChangeItinerary from './pages/ChangeItinerary';
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
          <Route path="profile-info-change" element={<ProfileInfoChange />} />
          <Route path="change-itinerary" element={<ChangeItinerary />} />
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
