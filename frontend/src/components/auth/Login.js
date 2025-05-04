import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    isAdmin: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated, isAdmin, error: authError } = useContext(AuthContext);
  const navigate = useNavigate();

  const { email, password, isAdmin: isAdminLogin } = formData;

  // Redirect logic with detailed logging
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Authentication Status:', {
        isAuthenticated,
        isAdmin,
        redirecting: true,
      });

      if (isAdmin) {
        console.log('Redirecting to admin dashboard');
        navigate('/admin/dashboard');
      } else {
        console.log('Redirecting to user dashboard');
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Handle auth context errors
  useEffect(() => {
    if (authError) {
      setError(authError);
      toast.error(authError);
    }
  }, [authError]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear previous errors when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset error and start loading
    setError('');
    setLoading(true);

    // Validation and normalization
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      setError('Please provide both email and password');
      toast.error('Please provide both email and password');
      setLoading(false);
      return;
    }

    try {
      console.log('Login Attempt:', {
        email: normalizedEmail,
        isAdmin: isAdminLogin,
        timestamp: new Date().toISOString(),
      });

      // Attempt login (isAdmin is not sent to backend, used for navigation only)
      await login({ email: normalizedEmail, password });

      // Navigation handled by useEffect
    } catch (err) {
      console.error('Login Error:', {
        errorObject: err,
        errorType: typeof err,
      });

      // Extract detailed error message
      const errorDetails = err.details || err.error || 'Login failed. Please try again.';
      let errorMessage = errorDetails;
      if (errorDetails === 'Incorrect password') {
        errorMessage = (
          <>
            Incorrect password.{' '}
            <Link to="/forgot-password">Reset your password</Link>.
          </>
        );
      } else if (errorDetails === 'Email not found') {
        errorMessage = 'No account found with this email. Please sign up.';
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isAdminLogin ? 'Administrator Login' : 'User Login'}</h2>

      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-control"
            value={email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            className="form-control"
            value={password}
            onChange={handleChange}
            required
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </div>

        <div className="form-group">
          <div className="checkbox">
            <label>
              <input
                type="checkbox"
                name="isAdmin"
                checked={isAdminLogin}
                onChange={handleChange}
              /> Login as Administrator
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="auth-links">
        <Link to="/forgot-password">Forgot Password?</Link>
        <p>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;