import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import  store  from './Redux/store';
import { Toaster } from 'sonner';
//import LoginPage from './pages/LoginPage';
//import VerifyPage from './pages/VerifyPage';
//import HomePage from './pages/HomePage';
//import SignUpPage from './pages/SignUpPage'; // Import the SignUpPage component
//import AdminDashboard from './pages/AdminDashboard';

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* <Route path="/login" element={<LoginPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/signup" element={<SignUpPage />} /> 
          <Route path="/admin" element={<AdminDashboard />} /> 
          <Route path="/" element={<Navigate to="/login" replace />} /> */}
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </Provider>
  );
};
export default App;