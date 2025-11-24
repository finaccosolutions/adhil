import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./pages/HomePage";
import { Packages } from "./pages/Packages";
import { PackageDetails } from "./pages/PackageDetails";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import { Signup } from "./pages/SignUp";
import { AdminLogin } from "./pages/AdminLogin";
import { AdminDashboard } from "./pages/AdminDashboard";
import BookingPage from "./pages/BookingPage";
import PaymentPage from "./pages/PaymentPage";
import RemainingPaymentPage from "./pages/RemainingPaymentPage";
import UserBookings from "./pages/UserBookings";

function ProtectedRoute({ children, requireAuth = false }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function UserLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

export default function AppRouter() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>

        {/* Admin Route */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminDashboard />} />

        {/* User Layout */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/package/:id" element={<PackageDetails />} />
          
          {/* Protected Routes */}
          <Route
            path="/booking/:id"
            element={
              <ProtectedRoute requireAuth>
                <BookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/:id"
            element={
              <ProtectedRoute requireAuth>
                <PaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/remaining-payment/:id"
            element={
              <ProtectedRoute requireAuth>
                <RemainingPaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute requireAuth>
                <UserBookings />
              </ProtectedRoute>
            }
          />

          {/* Public */}
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

      </Routes>
    </div>
  );
}
