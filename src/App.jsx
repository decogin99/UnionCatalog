import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/common/ErrorBoundary";

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
// const BookUpdateForm = lazy(() => import("./pages/BookUpdateForm"));
const BookUpdateInfo = lazy(() => import("./pages/BookUpdateInfo"));
const BookDetail = lazy(() => import("./pages/BookDetail"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const BarCode = lazy(() => import("./pages/BarCode"));
const LabelView = lazy(() => import("./pages/LabelView"));
const DDCView = lazy(() => import("./pages/DDCView"));
const BookReport = lazy(() => import("./pages/BookReport"));
const LibraryVerify = lazy(() => import("./pages/LibraryVerify"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const PublicBooks = lazy(() => import("./pages/PublicBooks"));
const MARC = lazy(() => import("./pages/MARC"));
const Members = lazy(() => import("./pages/Members"));
const ImportMARC = lazy(() => import("./components/marc/ImportMARC"));
const ImportBatches = lazy(() => import("./components/marc/ImportBatches"));
const ImportReview = lazy(() => import("./components/marc/ImportReview"));

import RequireRole from "./routes/RequireRole";
import Libraries from "./pages/admin/Libraries";
import FullPageSuspense from "./components/common/FullPageSuspense";

function App() {
  return (
    <Router>
      <Suspense fallback={<FullPageSuspense />}>
        <ErrorBoundary>
          <Routes>
            <Route path="/Admin/Libraries" element={<RequireRole role="SuperAdmin"><Libraries /></RequireRole>} />
            <Route path="/" element={<LandingPage />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/OTPVerification" element={<OTPVerification />} />
            <Route path="/Signup" element={<Signup />} />
            <Route path="/ForgotPassword" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/Dashboard" element={<RequireRole><Dashboard /></RequireRole>} />
            <Route path="/Profile" element={<RequireRole><Profile /></RequireRole>} />
            <Route path="/Members" element={<RequireRole><Members /></RequireRole>} />
            {/* <Route path="/EnglishBooks" element={<RequireRole><Books /></RequireRole>} />
            <Route path="/MyanmarBooks" element={<RequireRole><Books /></RequireRole>} />
            <Route path="/EnglishBooks/New" element={<RequireRole><BookForm /></RequireRole>} />
            <Route path="/MyanmarBooks/New" element={<RequireRole><BookForm /></RequireRole>} />
            <Route path="/EnglishBooks/Update/:bookId" element={<RequireRole><BookUpdateInfo /></RequireRole>} />
            <Route path="/MyanmarBooks/Update/:bookId" element={<RequireRole><BookUpdateInfo /></RequireRole>} />
            <Route path="/EnglishBooks/Detail" element={<RequireRole><BookDetail /></RequireRole>} />
            <Route path="/EnglishBooks/Detail/:bookId" element={<RequireRole><BookDetail /></RequireRole>} />
            <Route path="/MyanmarBooks/Detail" element={<RequireRole><BookDetail /></RequireRole>} />
            <Route path="/MyanmarBooks/Detail/:bookId" element={<RequireRole><BookDetail /></RequireRole>} /> */}
            <Route path="/:bookCategory">
              <Route
                index
                element={
                  <RequireRole>
                    <Books />
                  </RequireRole>
                }
              />

              <Route
                path="New"
                element={
                  <RequireRole>
                    <BookForm />
                  </RequireRole>
                }
              />

              <Route
                path="Update/:bookId"
                element={
                  <RequireRole>
                    <BookUpdateInfo />
                  </RequireRole>
                }
              />

              <Route
                path="Detail"
                element={
                  <RequireRole>
                    <BookDetail />
                  </RequireRole>
                }
              />

              <Route
                path="Detail/:bookId"
                element={
                  <RequireRole>
                    <BookDetail />
                  </RequireRole>
                }
              />
            </Route>
            <Route path="/BarCode" element={<RequireRole><BarCode /></RequireRole>} />
            <Route path="/Label" element={<RequireRole><LabelView /></RequireRole>} />
            <Route path="/DDC" element={<RequireRole><DDCView /></RequireRole>} />
            <Route path="/BookReport" element={<RequireRole><BookReport /></RequireRole>} />
            <Route path="/Settings" element={<RequireRole><Settings /></RequireRole>} />
            <Route path="/LibraryVerify" element={<RequireRole><LibraryVerify /></RequireRole>} />
            <Route path="/PublicProfile/:profileId" element={<RequireRole><PublicProfile /></RequireRole>} />
            <Route path="/PublicBooks/EnglishBooks" element={<RequireRole><PublicBooks /></RequireRole>} />
            <Route path="/PublicBooks/MyanmarBooks" element={<RequireRole><PublicBooks /></RequireRole>} />
            <Route path="/MARC" element={<RequireRole><MARC /></RequireRole>} />
            <Route path="/MARC/Import" element={<RequireRole><ImportMARC /></RequireRole>} />
            <Route path="/MARC/Import/Batches" element={<RequireRole><ImportBatches /></RequireRole>} />
            <Route path="/MARC/Import/Review" element={<RequireRole><ImportReview /></RequireRole>} />
          </Routes>
        </ErrorBoundary>
      </Suspense>
    </Router>
  );
}

export default App;
