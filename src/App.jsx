import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Books from './pages/Books';
import LandingPage from './pages/Landing';
import OTPVerification from './pages/OTPVerification';

function App() {
  return (
    <Router basename="/UnionCatalog">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/OTP-Verification" element={<OTPVerification />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/EnglishBooks" element={<Books />} />
        <Route path="/MyanmarBooks" element={<Books />} />
      </Routes>
    </Router>
  );
}

export default App;
