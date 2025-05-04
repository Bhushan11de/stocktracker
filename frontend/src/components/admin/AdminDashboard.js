// frontend/src/components/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import adminService from '../../services/adminService';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await adminService.getDashboardStats();
        console.log('Dashboard API response:', response); // Debug log
        
        // Extract the data from the response, handling different structures
        const statsData = response.data && response.data.data 
          ? response.data.data 
          : (response.data || {});
        
        console.log('Extracted stats data:', statsData); // Debug log
        setStats(statsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard statistics');
        setLoading(false);
      }
    };
    
    fetchDashboardStats();
  }, []);
  
  // Transaction volume chart data
  const transactionChart = {
    labels: ['Buy Volume', 'Sell Volume'],
    datasets: [
      {
        label: 'Transaction Volume ($)',
        data: [stats?.buyVolume || 0, stats?.sellVolume || 0],
        backgroundColor: [
          'rgba(52, 152, 219, 0.6)',
          'rgba(231, 76, 60, 0.6)'
        ],
        borderColor: [
          'rgba(52, 152, 219, 1)',
          'rgba(231, 76, 60, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Transaction Volume'
      }
    }
  };
  
  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="alert alert-danger">
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
        <button 
          className="btn btn-outline-primary mt-2"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }
  
  // Safely get properties with fallbacks
  const totalUsers = stats?.totalUsers || 0;
  const totalStocks = stats?.totalStocks || 0;
  const totalTransactions = stats?.totalTransactions || 0;
  const buyVolume = stats?.buyVolume || 0;
  const sellVolume = stats?.sellVolume || 0;
  const recentTransactions = Array.isArray(stats?.recentTransactions) 
    ? stats.recentTransactions 
    : [];
  
  return (
    <div>
      <h1>Admin Dashboard</h1>
      
      {/* Statistics */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Users</h3>
          <div className="stat-value">{totalUsers}</div>
        </div>
        <div className="stat-card">
          <h3>Total Stocks</h3>
          <div className="stat-value">{totalStocks}</div>
        </div>
        <div className="stat-card">
          <h3>Total Transactions</h3>
          <div className="stat-value">{totalTransactions}</div>
        </div>
        <div className="stat-card">
          <h3>Transaction Volume</h3>
          <div className="stat-value">
            ${(buyVolume + sellVolume).toFixed(2)}
          </div>
        </div>
      </div>
      
      {/* Transaction Volume Chart */}
      <div className="chart-container">
        <Bar data={transactionChart} options={chartOptions} />
      </div>
      
      {/* Recent Transactions */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h2>Recent Transactions</h2>
          <div>
            <button onClick={() => window.location.reload()} className="btn btn-outline-primary me-2">
              Refresh
            </button>
            <Link to="/admin/transactions" className="btn btn-secondary">View All</Link>
          </div>
        </div>
        
        {recentTransactions.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Stock</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.user_email || 'Unknown'}</td>
                    <td>{transaction.symbol || 'Unknown'}</td>
                    <td>
                      <span className={transaction.type === 'buy' ? 'text-success' : 'text-danger'}>
                        {(transaction.type || '').toUpperCase()}
                      </span>
                    </td>
                    <td>{transaction.quantity || 0}</td>
                    <td>${parseFloat(transaction.price || 0).toFixed(2)}</td>
                    <td>${parseFloat(transaction.total_amount || 0).toFixed(2)}</td>
                    <td>{transaction.transaction_date 
                      ? new Date(transaction.transaction_date).toLocaleDateString() 
                      : 'Unknown'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-4">
            <p>No recent transactions</p>
          </div>
        )}
      </div>
      
      {/* Quick Links */}
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <h3>Manage Users</h3>
              <p>View and manage user accounts ({totalUsers})</p>
              <Link to="/admin/users" className="btn btn-primary">Go to Users</Link>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <h3>Manage Stocks</h3>
              <p>View, add, edit, or delete stocks ({totalStocks})</p>
              <Link to="/admin/stocks" className="btn btn-primary">Go to Stocks</Link>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <h3>Add New Stock</h3>
              <p>Add a new stock to the platform</p>
              <Link to="/admin/add-stock" className="btn btn-success">Add Stock</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;