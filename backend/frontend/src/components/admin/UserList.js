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
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load users');
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
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
        
        {users.length > 0 ? (
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
                    <td>{user.email}</td>
                    <td>
                      {user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : 'N/A'}
                    </td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
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
            <p>No users found.</p>
          </div>
        )}
      </div>
      
      {/* User statistics */}
      <div className="stats-container mt-4">
        <div className="stat-card">
          <h3>Total Users</h3>
          <div className="stat-value">{users.length}</div>
        </div>
        <div className="stat-card">
          <h3>Admin Users</h3>
          <div className="stat-value">
            {users.filter(user => user.role === 'admin').length}
          </div>
        </div>
        <div className="stat-card">
          <h3>Regular Users</h3>
          <div className="stat-value">
            {users.filter(user => user.role === 'user').length}
          </div>
        </div>
        <div className="stat-card">
          <h3>New Users (30 days)</h3>
          <div className="stat-value">
            {users.filter(user => {
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              return new Date(user.created_at) >= thirtyDaysAgo;
            }).length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;