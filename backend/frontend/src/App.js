// frontend/src/App.js
import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthContext, AuthProvider } from './contexts/AuthContext';
import { StockProvider } from './contexts/StockContext';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';

// Auth Components
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';

// User Components
import UserDashboard from './components/user/UserDashboard';
import Portfolio from './components/user/Portfolio';
import Watchlist from './components/user/Watchlist';
import BuyStock from './components/user/BuyStock';
import SellStock from './components/user/SellStock';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import AddStock from './components/admin/AddStock';
import StockList from './components/admin/StockList';
import UserList from './components/admin/UserList';

// Routes
import PrivateRoute from './components/routes/PrivateRoute';
import AdminRoute from './components/routes/AdminRoute';

// CSS
import './App.css';

// Authentication State Debugger Component
const AuthStateDebugger = () => {
  const { user, isAuthenticated, isAdmin, loading } = useContext(AuthContext);
  
  useEffect(() => {
    console.log('App-level Auth State:', { 
      user, 
      isAuthenticated, 
      isAdmin, 
      loading 
    });
  }, [user, isAuthenticated, isAdmin, loading]);
  
  return null; // This component doesn't render anything
};

function App() {
  return (
    <AuthProvider>
      <StockProvider>
        <Router>
          <AuthStateDebugger />
          <div className="app">
            <ToastContainer position="top-right" autoClose={3000} />
            <Header />
            <div className="main-container">
              <Sidebar />
              <main className="content">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  
                  {/* User Routes */}
                  <Route 
                    path="/" 
                    element={
                      <PrivateRoute>
                        <UserDashboard />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/portfolio" 
                    element={
                      <PrivateRoute>
                        <Portfolio />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/watchlist" 
                    element={
                      <PrivateRoute>
                        <Watchlist />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/buy-stock/:id?" 
                    element={
                      <PrivateRoute>
                        <BuyStock />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/sell-stock/:id?" 
                    element={
                      <PrivateRoute>
                        <SellStock />
                      </PrivateRoute>
                    } 
                  />
                  
                  {/* Admin Routes */}
                  <Route 
                    path="/admin" 
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    } 
                  />
                  <Route 
                    path="/admin/add-stock" 
                    element={
                      <AdminRoute>
                        <AddStock />
                      </AdminRoute>
                    } 
                  />
                  <Route 
                    path="/admin/stocks" 
                    element={
                      <AdminRoute>
                        <StockList />
                      </AdminRoute>
                    } 
                  />
                  <Route 
                    path="/admin/users" 
                    element={
                      <AdminRoute>
                        <UserList />
                      </AdminRoute>
                    } 
                  />
                </Routes>
              </main>
            </div>
            <Footer />
          </div>
        </Router>
      </StockProvider>
    </AuthProvider>
  );
}

export default App;
