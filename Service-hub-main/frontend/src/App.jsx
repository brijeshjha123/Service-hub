import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import './App.css';
import { AuthProvider } from './context/AuthProvider';
import Services from './pages/Services';
import BookService from './pages/BookService';
import MyBookings from './pages/MyBookings';
import ProviderDashboard from './pages/ProviderDashboard';
import RoleRoute from './components/RoleRoute';
import Chatbot from './components/Chatbot';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProviderSignup from './pages/ProviderSignup';
import ProviderLogin from './pages/ProviderLogin';
import { useAuth } from './hooks/useAuth';
import Footer from './components/Footer';

// Admin Route Component
const AdminRoute = ({ children }) => {
  // We need to access auth context. Since RoleRoute exists, we could use that, 
  // but Admin might be special. For now, reusing RoleRoute logic or creating simple one.
  // Let's use a simple wrapper that checks role.
  // Note: useAuth must be used inside AuthProvider, so this component must be inside too.
  const { userProfile, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;

  // Check if user is logged in and has admin role
  if (!userProfile || userProfile.role !== 'admin') {
    return <Navigate to="/system/internal/admin/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <Navbar />
          <div className="min-h-screen bg-background font-sans antialiased">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/services" element={<Services />} />

              {/* Admin Routes */}
              <Route path="/system/internal/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />

              {/* Customer Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/customer/home" element={<Navigate to="/" replace />} />
              <Route path="/customer/dashboard" element={
                <RoleRoute allowedRoles={['customer']}>
                  <MyBookings />
                </RoleRoute>
              } />
              <Route path="/book/:serviceId" element={
                <RoleRoute allowedRoles={['customer']}>
                  <BookService />
                </RoleRoute>
              } />

              {/* Legacy redirect */}
              <Route path="/bookings" element={<Navigate to="/customer/dashboard" replace />} />
              <Route path="/dashboard" element={<Navigate to="/customer/dashboard" replace />} />

              {/* Provider Routes */}
              <Route path="/provider/login" element={<ProviderLogin />} />
              <Route path="/provider/signup" element={<ProviderSignup />} />
              <Route path="/provider/dashboard" element={
                <RoleRoute allowedRoles={['provider']}>
                  <ProviderDashboard />
                </RoleRoute>
              } />
              <Route path="/pro" element={<Navigate to="/provider/dashboard" replace />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Chatbot />
          <Footer />
        </Router>
      </AuthProvider>
    </Provider>
  );
}

export default App;
