import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Books from "./pages/Books";
import LandingPage from "./pages/Landing";
import OTPVerification from "./pages/OTPVerification";
import Settings from "./pages/Settings";
import BookForm from "./pages/BookForm";
import BookUpdateForm from "./pages/BookUpdateForm";

import RequireRole from "./routes/RequireRole";
import LibraryRegistrations from "./pages/admin/LibraryRegistrations";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/Admin/Registrations" element={<RequireRole role="SuperAdmin"><LibraryRegistrations /></RequireRole>} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/OTPVerification" element={<OTPVerification />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/Dashboard" element={<RequireRole><Dashboard /></RequireRole>} />
        <Route path="/Profile" element={<RequireRole><Profile /></RequireRole>} />
        <Route path="/EnglishBooks" element={<RequireRole><Books /></RequireRole>} />
        <Route path="/MyanmarBooks" element={<RequireRole><Books /></RequireRole>} />
        <Route path="/EnglishBooks/New" element={<RequireRole><BookForm /></RequireRole>} />
        <Route path="/MyanmarBooks/New" element={<RequireRole><BookForm /></RequireRole>} />
        <Route path="/EnglishBooks/:bookId/Update" element={<RequireRole><BookUpdateForm /></RequireRole>} />
        <Route path="/MyanmarBooks/:bookId/Update" element={<RequireRole><BookUpdateForm /></RequireRole>} />
        <Route path="/Settings" element={<RequireRole><Settings /></RequireRole>} />
      </Routes>
    </Router>
  );
}

export default App;
