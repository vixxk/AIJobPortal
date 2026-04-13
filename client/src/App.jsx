import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute, { RoleRedirect } from './components/layout/ProtectedRoute';
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
import RecruiterJobs from './pages/recruiter/RecruiterJobs';
import RecruiterCompetitions from './pages/recruiter/RecruiterCompetitions';
import RecruiterColleges from './pages/recruiter/RecruiterColleges';
import CollegeLayout from './pages/college/CollegeLayout';
import CollegeOverview from './pages/college/CollegeOverview';
import CollegeProfile from './pages/college/CollegeProfile';
import CollegeDrives from './pages/college/CollegeDrives';
import CollegeCompanies from './pages/college/CollegeCompanies';
import CollegeEmails from './pages/college/CollegeEmails';
import CollegePlacement from './pages/college/CollegePlacement';
import {
  AdminLayout, AdminOverview, AdminUsers, AdminJobs,
  AdminCourses, AdminApplications, AdminCompetitions, AdminIssues, AdminPayments, CourseManagement
} from './pages/admin';

import MyApplications from './pages/MyApplications';
import InterviewPage from './pages/InterviewPage';
import CandidateInterviewPage from './pages/CandidateInterviewPage';
import TutorLayout from './pages/english-tutor/TutorLayout';
import TutorDashboard from './pages/english-tutor/TutorDashboard';
import TutorWelcome from './pages/english-tutor/TutorWelcome';
import TutorAssessment from './pages/english-tutor/TutorAssessment';
import TutorLesson from './pages/english-tutor/TutorLesson';
import SkillLearning from './pages/SkillLearning';
import TeacherLayout from './pages/teacher/TeacherLayout';
import TeacherOverview from './pages/teacher/TeacherOverview';
import TeacherCourses from './pages/teacher/TeacherCourses';
import TeacherProfile from './pages/teacher/TeacherProfile';
import SpecialJobs from './pages/SpecialJobs';
import HyregoJobDetail from './pages/HyregoJobDetail';
import StudentCompetitions from './pages/StudentCompetitions';
import StudentCompetitionDetail from './pages/StudentCompetitionDetail';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE'}>
      <Router>
        <AuthProvider>
          <Toaster position="top-center" reverseOrder={false} />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/select-role" element={<RoleSelection />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/hyrego/:id" element={<HyregoJobDetail />} />
            <Route path="/app" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route index element={<RoleRedirect />} />
              <Route path="dashboard" element={<ProtectedRoute allowedRoles={['STUDENT']}><Dashboard /></ProtectedRoute>} />
              <Route path="jobs" element={<ProtectedRoute allowedRoles={['STUDENT']}><AiJobSearch /></ProtectedRoute>} />
              <Route path="saved" element={<ProtectedRoute allowedRoles={['STUDENT']}><SavedJobs /></ProtectedRoute>} />
              <Route path="job/:id" element={<ProtectedRoute allowedRoles={['STUDENT', 'RECRUITER']}><JobDetails /></ProtectedRoute>} />
              <Route path="resume" element={<ProtectedRoute allowedRoles={['STUDENT']}><AiResumeBuilder /></ProtectedRoute>} />
              <Route path="profile" element={<ProtectedRoute allowedRoles={['STUDENT', 'RECRUITER', 'COLLEGE_ADMIN']}><StudentProfile /></ProtectedRoute>} />
              <Route path="profile/:section" element={<ProtectedRoute allowedRoles={['STUDENT', 'RECRUITER', 'COLLEGE_ADMIN']}><StudentProfile /></ProtectedRoute>} />
              <Route path="applications" element={<ProtectedRoute allowedRoles={['STUDENT']}><MyApplications /></ProtectedRoute>} />
              <Route path="hyrego-jobs" element={<ProtectedRoute allowedRoles={['STUDENT']}><SpecialJobs /></ProtectedRoute>} />
              <Route path="recruiter" element={<ProtectedRoute allowedRoles={['RECRUITER']}><RecruiterDashboard /></ProtectedRoute>} />
              <Route path="recruiter/listings" element={<ProtectedRoute allowedRoles={['RECRUITER']}><RecruiterJobs /></ProtectedRoute>} />
              <Route path="recruiter/post-job" element={<ProtectedRoute allowedRoles={['RECRUITER']}><PostJob /></ProtectedRoute>} />
              <Route path="recruiter/manage/:jobId" element={<ProtectedRoute allowedRoles={['RECRUITER']}><ManageApplicants /></ProtectedRoute>} />
              <Route path="recruiter/competitions" element={<ProtectedRoute allowedRoles={['RECRUITER']}><RecruiterCompetitions /></ProtectedRoute>} />
              <Route path="recruiter/colleges" element={<ProtectedRoute allowedRoles={['RECRUITER']}><RecruiterColleges /></ProtectedRoute>} />
              
              <Route path="college" element={<ProtectedRoute allowedRoles={['COLLEGE_ADMIN']}><CollegeLayout /></ProtectedRoute>}>
                <Route index element={<CollegeOverview />} />
                <Route path="profile" element={<CollegeProfile />} />
                <Route path="drives" element={<CollegeDrives />} />
                <Route path="companies" element={<CollegeCompanies />} />
                <Route path="emails" element={<CollegeEmails />} />
                <Route path="placement" element={<CollegePlacement />} />
                <Route path="help" element={<HelpCenter />} />
              </Route>
              <Route path="admin" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminOverview />} />
                <Route path="students" element={<AdminUsers role="STUDENT" />} />
                <Route path="recruiters" element={<AdminUsers role="RECRUITER" />} />
                <Route path="colleges" element={<AdminUsers role="COLLEGE_ADMIN" />} />
                <Route path="teachers" element={<AdminUsers role="TEACHER" />} />
                <Route path="jobs" element={<AdminJobs />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="courses/:id" element={<CourseManagement />} />

                <Route path="applications" element={<AdminApplications />} />
                <Route path="competitions" element={<AdminCompetitions />} />
                <Route path="issues" element={<AdminIssues />} />
                <Route path="payments" element={<AdminPayments />} />
              </Route>
              <Route path="teacher" element={<ProtectedRoute allowedRoles={['TEACHER', 'SUPER_ADMIN']}><TeacherLayout /></ProtectedRoute>}>
                <Route index element={<TeacherOverview />} />
                <Route path="courses" element={<TeacherCourses />} />
                <Route path="courses/:id" element={<CourseManagement />} />
                <Route path="profile" element={<TeacherProfile />} />
              </Route>
              <Route path="interview" element={<ProtectedRoute allowedRoles={['STUDENT']}><InterviewPage /></ProtectedRoute>} />
              <Route path="english-tutor" element={<ProtectedRoute allowedRoles={['STUDENT']}><TutorLayout /></ProtectedRoute>}>
                  <Route index element={<TutorDashboard />} />
                  <Route path="welcome" element={<TutorWelcome />} />
                  <Route path="assessment" element={<TutorAssessment />} />
                  <Route path="lesson" element={<TutorLesson />} />
              </Route>
              <Route path="learning/*" element={<ProtectedRoute allowedRoles={['STUDENT']}><SkillLearning /></ProtectedRoute>} />
              <Route path="community" element={<ProtectedRoute allowedRoles={['STUDENT']}><ComingSoon feature="Community" /></ProtectedRoute>} />
              <Route path="competitions" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentCompetitions /></ProtectedRoute>} />
              <Route path="competitions/:id" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentCompetitionDetail /></ProtectedRoute>} />
              <Route path="notifications" element={<ProtectedRoute allowedRoles={['STUDENT']}><ComingSoon feature="Notifications" /></ProtectedRoute>} />
              <Route path="messages" element={<ProtectedRoute allowedRoles={['STUDENT']}><ComingSoon feature="Messages" /></ProtectedRoute>} />
              <Route path="help" element={<HelpCenter />} />
              <Route path="contact" element={<CustomerService />} />
              <Route path="settings" element={<ProtectedRoute allowedRoles={['STUDENT', 'RECRUITER', 'TEACHER', 'SUPER_ADMIN']}><ComingSoon feature="Settings" /></ProtectedRoute>} />
            </Route>
            <Route path="/candidate-interview/:token" element={<ProtectedRoute allowedRoles={['STUDENT']}><CandidateInterviewPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
