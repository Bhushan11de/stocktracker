import axios from '../utils/axios';

// Set auth token for all requests
const setAuthToken = (token) => {
  if (token) {
    console.log("Setting auth token in axios headers");
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log("Auth header set:", axios.defaults.headers.common['Authorization'] ? "Yes" : "No");
  } else {
    console.log("Removing auth token from axios headers");
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Remove auth token
const removeAuthToken = () => {
  delete axios.defaults.headers.common['Authorization'];
};

// Register user
const register = async (userData) => {
  try {
    console.log('Registering with data:', { ...userData, password: '******' });
    const response = await axios.post('/auth/register', userData);
    console.log('Register response:', response);
    return response;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

// Login user
const login = async (loginData) => {
  try {
    // Validate and normalize input
    const email = loginData.email?.trim().toLowerCase();
    const password = loginData.password?.trim();
    
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Prepare payload
    const payload = { email, password };
    
    // Detailed logging (without exposing password)
    console.log('Attempting login with:', { 
      email, 
      password: '******' 
    });
    
    // Make login request
    const response = await axios.post('/auth/login', payload);
    
    console.log('Login response:', {
      token: response.data.token ? '[MASKED]' : 'No Token',
      user: response.data.user ? {
        id: response.data.user.id,
        email: response.data.user.email,
        role: response.data.user.role
      } : 'No User Data'
    });
    
    return response.data;
  } catch (error) {
    console.error('Login error:', {
      message: error.response?.data?.error || error.message,
      status: error.response?.status,
      details: error.response?.data?.details
    });
    
    // Throw a more informative error
    throw {
      error: error.response?.data?.error || 'Login failed. Please check your credentials.',
      status: error.response?.status,
      details: error.response?.data?.details
    };
  }
};

// Get current user
const getCurrentUser = async () => {
  try {
    console.log("Request headers for /auth/me:", {
      Authorization: axios.defaults.headers.common['Authorization'] || 'Not set'
    });
    
    const response = await axios.get('/auth/me');
    console.log('Get current user response:', {
      id: response.data.data.id,
      email: response.data.data.email,
      role: response.data.data.role
    });
    return response.data;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

// Update profile
const updateProfile = async (userData) => {
  try {
    const response = await axios.put('/users/profile', userData);
    console.log('Update profile response:', response);
    return response;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

// Change password
const changePassword = async (passwordData) => {
  try {
    const response = await axios.post('/auth/change-password', passwordData);
    console.log('Change password response:', response);
    return response;
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
};

// Reset password request
const requestPasswordReset = async (email) => {
  try {
    const response = await axios.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
    console.log('Request password reset response:', response);
    return response;
  } catch (error) {
    console.error('Request password reset error:', error);
    throw error;
  }
};

// Reset password with token
const resetPassword = async (token, password) => {
  try {
    const response = await axios.post(`/auth/reset-password/${token}`, { password });
    console.log('Reset password response:', response);
    return response;
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};

const authService = {
  setAuthToken,
  removeAuthToken,
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  requestPasswordReset,
  resetPassword
};

export default authService;