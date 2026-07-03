import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './index.css';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import ConsumerDashboard from './pages/consumer/ConsumerDashboard';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import NotFoundPage from './pages/NotFoundPage';
import AddProductForm from './pages/farmer/AddProductForm';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Protected route component
  const ProtectedRoute = ({ element, requiredRole = null }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (requiredRole && user?.user_type !== requiredRole) {
      return <Navigate to="/" replace />;
    }

    return element;
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/cart" element={<CartPage />} />

            {/* Consumer Routes */}
            <Route
              path="/dashboard/consumer"
              element={<ProtectedRoute element={<ConsumerDashboard />} requiredRole="consumer" />}
            />
            <Route path="/orders/:orderId" element={<ProtectedRoute element={<OrderTrackingPage />} />} />

            {/* Farmer Routes */}
            <Route
              path="/dashboard/farmer"
              element={<ProtectedRoute element={<FarmerDashboard />} requiredRole="farmer" />}
            />
            <Route
              path="/farmer/add-product"
              element={<ProtectedRoute element={<AddProductForm />} requiredRole="farmer" />}
            />

            {/* Delivery Partner Routes */}
            <Route
              path="/dashboard/delivery"
              element={<ProtectedRoute element={<DeliveryDashboard />} requiredRole="delivery_partner" />}
            />

            {/* Admin Routes */}
            <Route
              path="/dashboard/admin"
              element={<ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />}
            />

            {/* 404 Page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
