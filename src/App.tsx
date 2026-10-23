import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout, ProtectedLayout } from './components/layout/Layouts';
import { useStore } from './store/useStore';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { TokenDisplay } from './pages/public/TokenDisplay';

// Patient Pages
import { PatientStart } from './pages/patient/PatientStart';
import { PatientTriage } from './pages/patient/PatientTriage';
import { PatientVitals } from './pages/patient/PatientVitals';
import { PatientResult } from './pages/patient/PatientResult';
import { PatientToken } from './pages/patient/PatientToken';

// Doctor Pages
import { DoctorLogin } from './pages/doctor/DoctorLogin';
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { PatientReview } from './pages/doctor/PatientReview';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { HardwareDashboard } from './pages/admin/HardwareDashboard';

export default function App() {
  const fetchPatients = useStore(state => state.fetchPatients);
  const subscribeToPatients = useStore(state => state.subscribeToPatients);

  useEffect(() => {
    fetchPatients();
    const unsubscribe = subscribeToPatients();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchPatients, subscribeToPatients]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Standalone Route without main header */}
        <Route path="/token" element={<TokenDisplay />} />
        
        {/* Public Routes with standard header */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/patient" element={<PatientStart />} />
          <Route path="/patient/vitals" element={<PatientVitals />} />
          <Route path="/patient/triage" element={<PatientTriage />} />
          <Route path="/patient/result" element={<PatientResult />} />
          <Route path="/patient/token" element={<PatientToken />} />
          <Route path="/hardware" element={<HardwareDashboard />} />
          <Route path="/doctor/login" element={<DoctorLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
        </Route>

        {/* Doctor Routes */}
        <Route element={<ProtectedLayout role="DOCTOR" />}>
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/queue" element={<Navigate to="/doctor/dashboard" replace />} />
          <Route path="/doctor/patient/:id" element={<PatientReview />} />
          <Route path="/doctor/review/:id" element={<PatientReview />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedLayout role="ADMIN" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
