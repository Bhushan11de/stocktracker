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
        setStats(response.data);
        setLoading(false);
      } catch (err) {
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
    return <div className="alert alert-danger">{error}</div>;
  }
  
  return (
    <div>
      <h1>Admin Dashboard</h1>
      
      {/* Statistics */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Users</h3>
          <div className="stat-value">{stats?.totalUsers || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Total Stocks</h3>
          <div className="stat-value">{stats?.totalStocks || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Total Transactions</h3>
          <div className="stat-value">{stats?.totalTransactions || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Transaction Volume</h3>
          <div className="stat-value">
            ${((stats?.buyVolume || 0) + (stats?.sellVolume || 0)).toFixed(2)}
          </div>
        </div>
      </div>
      
      {/* Transaction Volume Chart */}
      <div className="chart-container">
        <Bar data={transactionChart} options={chartOptions} />
      </div>
      
      {/* Recent Transactions */}
      <div className="card">
        <div className="card-header">
          <h2>Recent Transactions</h2>
          <Link to="/admin/transactions" className="btn btn-secondary">View All</Link>
        </div>
        
        {stats?.recentTransactions?.length > 0 ? (
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
                {stats.recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.user_email}</td>
                    <td>{transaction.symbol}</td>
                    <td>
                      <span className={transaction.type === 'buy' ? 'text-success' : 'text-danger'}>
                        {transaction.type.toUpperCase()}
                      </span>
                    </td>
                    <td>{transaction.quantity}</td>
                    <td>${parseFloat(transaction.price).toFixed(2)}</td>
                    <td>${parseFloat(transaction.total_amount).toFixed(2)}</td>
                    <td>{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center p-3">No recent transactions</p>
        )}
      </div>
      
      {/* Quick Links */}
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <h3>Manage Users</h3>
              <p>View and manage user accounts</p>
              <Link to="/admin/users" className="btn btn-primary">Go to Users</Link>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <h3>Manage Stocks</h3>
              <p>View, add, edit, or delete stocks</p>
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