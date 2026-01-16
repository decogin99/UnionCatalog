import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Books = lazy(() => import("./pages/Books"));
const LandingPage = lazy(() => import("./pages/Landing"));
const OTPVerification = lazy(() => import("./pages/OTPVerification"));
const Settings = lazy(() => import("./pages/Settings"));
const BookForm = lazy(() => import("./pages/BookForm"));
const BookUpdateForm = lazy(() => import("./pages/BookUpdateForm"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const BarCode = lazy(() => import("./pages/BarCode"));
const LabelView = lazy(() => import("./pages/LabelView"));
const DDCView = lazy(() => import("./pages/DDCView"));

import RequireRole from "./routes/RequireRole";
import LibraryRegistrations from "./pages/admin/LibraryRegistrations";
import FullPageSuspense from "./components/common/FullPageSuspense";

function App() {
  return (
    <Router>
      <Suspense fallback={<FullPageSuspense />}>
        <Routes>
          <Route path="/Admin/Registrations" element={<RequireRole role="SuperAdmin"><LibraryRegistrations /></RequireRole>} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/OTPVerification" element={<OTPVerification />} />
          <Route path="/Signup" element={<Signup />} />
          <Route path="/ForgotPassword" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/Dashboard" element={<RequireRole><Dashboard /></RequireRole>} />
          <Route path="/Profile" element={<RequireRole><Profile /></RequireRole>} />
          <Route path="/EnglishBooks" element={<RequireRole><Books /></RequireRole>} />
          <Route path="/MyanmarBooks" element={<RequireRole><Books /></RequireRole>} />
          <Route path="/EnglishBooks/New" element={<RequireRole><BookForm /></RequireRole>} />
          <Route path="/MyanmarBooks/New" element={<RequireRole><BookForm /></RequireRole>} />
          <Route path="/EnglishBooks/Update/:bookId" element={<RequireRole><BookUpdateForm /></RequireRole>} />
          <Route path="/MyanmarBooks/Update/:bookId" element={<RequireRole><BookUpdateForm /></RequireRole>} />
          <Route path="/BarCode" element={<RequireRole><BarCode /></RequireRole>} />
          <Route path="/Label" element={<RequireRole><LabelView /></RequireRole>} />
          <Route path="/DDC" element={<RequireRole><DDCView /></RequireRole>} />
          <Route path="/Settings" element={<RequireRole><Settings /></RequireRole>} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
