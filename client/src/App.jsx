import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AiJobSearch from './pages/AiJobSearch';
import AiResumeBuilder from './pages/AiResumeBuilder';
import JobDetails from './pages/JobDetails';
import SavedJobs from './pages/SavedJobs';
import HelpCenter from './pages/HelpCenter';
import CustomerService from './pages/CustomerService';
import ComingSoon from './pages/ComingSoon';
import MainLayout from './components/layout/MainLayout';
import RoleSelection from './pages/RoleSelection';
import PendingApproval from './pages/PendingApproval';
import AdminLogin from './pages/AdminLogin';
import ProfileSetup from './pages/ProfileSetup';
import ForgotPassword from './pages/ForgotPassword';
import StudentProfile from './pages/StudentProfile';
import RecruiterDashboard from './pages/RecruiterDashboard';
import PostJob from './pages/PostJob';
import ManageApplicants from './pages/ManageApplicants';
import {
  AdminLayout, AdminOverview, AdminUsers, AdminJobs,
  AdminCourses, AdminApplications, AdminCompetitions
} from './pages/admin';
import MyApplications from './pages/MyApplications';
import InterviewPage from './pages/InterviewPage';
import EnglishTutor from './pages/EnglishTutor';
import SkillLearning from './pages/SkillLearning';
import TeacherDashboard from './pages/TeacherDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/select-role" element={<RoleSelection />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/app" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="jobs" element={<ProtectedRoute allowedRoles={['STUDENT']}><AiJobSearch /></ProtectedRoute>} />
            <Route path="saved" element={<ProtectedRoute allowedRoles={['STUDENT']}><SavedJobs /></ProtectedRoute>} />
            <Route path="job/:id" element={<ProtectedRoute allowedRoles={['STUDENT', 'RECRUITER']}><JobDetails /></ProtectedRoute>} />
            <Route path="resume" element={<ProtectedRoute allowedRoles={['STUDENT']}><AiResumeBuilder /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute allowedRoles={['STUDENT', 'RECRUITER', 'COLLEGE_ADMIN']}><StudentProfile /></ProtectedRoute>} />
            <Route path="profile/:section" element={<ProtectedRoute allowedRoles={['STUDENT', 'RECRUITER', 'COLLEGE_ADMIN']}><StudentProfile /></ProtectedRoute>} />
            <Route path="applications" element={<ProtectedRoute allowedRoles={['STUDENT']}><MyApplications /></ProtectedRoute>} />
            <Route path="recruiter" element={<ProtectedRoute allowedRoles={['RECRUITER']}><RecruiterDashboard /></ProtectedRoute>} />
            <Route path="recruiter/post-job" element={<ProtectedRoute allowedRoles={['RECRUITER']}><PostJob /></ProtectedRoute>} />
            <Route path="recruiter/manage/:jobId" element={<ProtectedRoute allowedRoles={['RECRUITER']}><ManageApplicants /></ProtectedRoute>} />
            <Route path="admin" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminOverview />} />
              <Route path="students" element={<AdminUsers role="STUDENT" />} />
              <Route path="recruiters" element={<AdminUsers role="RECRUITER" />} />
              <Route path="teachers" element={<AdminUsers role="TEACHER" />} />
              <Route path="jobs" element={<AdminJobs />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="applications" element={<AdminApplications />} />
              <Route path="competitions" element={<AdminCompetitions />} />
            </Route>
            <Route path="teacher" element={<ProtectedRoute allowedRoles={['TEACHER', 'SUPER_ADMIN']}><TeacherDashboard /></ProtectedRoute>} />
            <Route path="interview" element={<InterviewPage />} />
            <Route path="english-tutor" element={<EnglishTutor />} />
            <Route path="learning/*" element={<SkillLearning />} />
            <Route path="community" element={<ComingSoon feature="Community" />} />
            <Route path="competitions" element={<ComingSoon feature="Competitions" />} />
            <Route path="notifications" element={<ComingSoon feature="Notifications" />} />
            <Route path="messages" element={<ComingSoon feature="Messages" />} />
            <Route path="help" element={<HelpCenter />} />
            <Route path="contact" element={<CustomerService />} />
            <Route path="settings" element={<ComingSoon feature="Settings" />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
