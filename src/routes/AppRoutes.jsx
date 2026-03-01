import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Home from '../pages/dashboard/Home';
import ApplicationTracker from '../pages/dashboard/ApplicationTracker';
import InterviewPractice from '../pages/dashboard/InterviewPractice';
import InterviewQnAGenerator from '../pages/dashboard/InterviewQnAGenerator';
import ResumeGenerator from '../pages/resume-generator';
import JobRecommendations from '../pages/dashboard/JobRecommendations';
import Profile from '../pages/profile/Profile';
import Pricing from '../pages/pricing/Pricing';
import Settings from '../pages/Settings';
import StartPage from '../pages/start/StartPage';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/start" element={<StartPage />} />
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/application-tracker" element={<ApplicationTracker />} />
            <Route path="/interview-practice" element={<InterviewPractice />} />
            <Route path="/interview-practice/:interviewId/questions" element={<InterviewQnAGenerator />} />
            <Route path="/resume-generator" element={<ResumeGenerator />} />
            <Route path="/job-recommendations" element={<JobRecommendations />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/pricing" element={<Pricing />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
