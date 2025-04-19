import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import LoginPage from './pages/LoginPage';
// import VerifyPage from './pages/VerifyPage';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import CourseManagement from './pages/CourseManagement';
import VideoPlayer from './pages/VideoPlayer';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* <Route path="/verify" element={<VerifyPage />} /> */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        {/* <Route path="/admin" element={<AdminDashboard />} /> */}
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/course/:courseId" element={<CourseManagement />} />
        <Route path="/course/:courseId/video/:videoId" element={<VideoPlayer />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
};
export default App;