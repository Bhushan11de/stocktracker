// frontend/src/components/auth/Login.js
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    isAdmin: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const { email, password, isAdmin } = formData;

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(formData);
      console.log('Login response:', response); // Debug log
      
      // Check if user is admin
      if (response.data.role === 'admin') {
        console.log('Navigating to admin dashboard'); // Debug log
        navigate('/admin');
      } else {
        console.log('Navigating to user dashboard'); // Debug log
        navigate('/');
      }
      
      toast.success('Login successful!');
    } catch (err) {
      console.error('Login error:', err); // Debug log
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login to Your Account</h2>
      {error && <div className="alert alert-danger">{error}</div>}
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
          />
        </div>
        <div className="form-group">
          <div className="checkbox">
            <label>
              <input
                type="checkbox"
                name="isAdmin"
                checked={isAdmin}
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