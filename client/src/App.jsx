import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AiJobSearch from './pages/AiJobSearch';
import AiResumeBuilder from './pages/AiResumeBuilder';
import JobDetails from './pages/JobDetails';
import ComingSoon from './pages/ComingSoon';
import MainLayout from './components/layout/MainLayout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route path="/app" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="jobs" element={<AiJobSearch />} />
            <Route path="job/:id" element={<JobDetails />} />
            <Route path="resume" element={<AiResumeBuilder />} />
            <Route path="interview" element={<ComingSoon feature="Interview Prep" />} />
            <Route path="learning" element={<ComingSoon feature="Skill Learning" />} />
            <Route path="community" element={<ComingSoon feature="Community" />} />
            <Route path="competitions" element={<ComingSoon feature="Competitions" />} />
            <Route path="mock-tests" element={<ComingSoon feature="Mock Tests" />} />
            <Route path="notifications" element={<ComingSoon feature="Notifications" />} />
            <Route path="messages" element={<ComingSoon feature="Messages" />} />
            <Route path="settings" element={<ComingSoon feature="Settings" />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
