// frontend/src/components/admin/UserList.js
import React, { useState, useEffect } from 'react';
import { FaSearch, FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await adminService.getUsers();
        // Make sure we're handling different response formats
        const userData = response.data && response.data.data 
          ? response.data.data 
          : (Array.isArray(response.data) ? response.data : []);
        
        console.log('Fetched users data:', userData);
        setUsers(userData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Ensure users is an array before filtering
  const usersArray = Array.isArray(users) ? users : [];
  
  // Filter users based on search term
  const filteredUsers = searchTerm.trim() === '' 
    ? usersArray 
    : usersArray.filter(user => 
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (user.first_name && user.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.last_name && user.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  
  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }
  
  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }
  
  // Calculate user statistics safely
  const adminCount = usersArray.filter(user => user.role === 'admin').length;
  const regularUserCount = usersArray.filter(user => user.role === 'user').length;
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const newUserCount = usersArray.filter(user => {
    return user.created_at && new Date(user.created_at) >= thirtyDaysAgo;
  }).length;
  
  return (
    <div>
      <h1>Manage Users</h1>
      
      <div className="card">
        <div className="card-header">
          <h2>User List</h2>
          <div className="search-form">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-primary">
                <FaSearch />
              </button>
            </div>
          </div>
        </div>
        
        {filteredUsers.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.email || 'N/A'}</td>
                    <td>
                      {user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : 'N/A'}
                    </td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <Link
                        to={`/admin/users/${user.id}`}
                        className="btn btn-info btn-sm"
                      >
                        <FaEye /> View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-4">
            <p>{searchTerm ? 'No users match your search.' : 'No users found.'}</p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="btn btn-outline-primary"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* User statistics */}
      <div className="stats-container mt-4">
        <div className="stat-card">
          <h3>Total Users</h3>
          <div className="stat-value">{usersArray.length}</div>
        </div>
        <div className="stat-card">
          <h3>Admin Users</h3>
          <div className="stat-value">{adminCount}</div>
        </div>
        <div className="stat-card">
          <h3>Regular Users</h3>
          <div className="stat-value">{regularUserCount}</div>
        </div>
        <div className="stat-card">
          <h3>New Users (30 days)</h3>
          <div className="stat-value">{newUserCount}</div>
        </div>
      </div>
    </div>
  );
};

export default UserList;