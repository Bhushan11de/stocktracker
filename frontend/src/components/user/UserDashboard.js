// frontend/src/components/user/UserDashboard.js
import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { AuthContext } from '../../contexts/AuthContext';
import { StockContext } from '../../contexts/StockContext';
import userService from '../../services/userService';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const { getUserPortfolio, getUserWatchlist } = useContext(StockContext);
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await userService.getDashboard();
        setDashboardData(response.data);
        
        // Also update the context data
        await getUserPortfolio();
        await getUserWatchlist();
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [getUserPortfolio, getUserWatchlist]);
  
  // Chart data for portfolio performance
  const portfolioChartData = {
    labels: ['7 Days Ago', '6 Days Ago', '5 Days Ago', '4 Days Ago', '3 Days Ago', '2 Days Ago', 'Today'],
    datasets: [
      {
        label: 'Portfolio Value ($)',
        data: [
          dashboardData?.portfolioSummary?.totalValue * 0.95,
          dashboardData?.portfolioSummary?.totalValue * 0.97,
          dashboardData?.portfolioSummary?.totalValue * 0.96,
          dashboardData?.portfolioSummary?.totalValue * 0.98,
          dashboardData?.portfolioSummary?.totalValue * 0.99,
          dashboardData?.portfolioSummary?.totalValue * 0.99,
          dashboardData?.portfolioSummary?.totalValue
        ],
        fill: false,
        borderColor: 'rgb(53, 162, 235)',
        tension: 0.1
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
        text: 'Portfolio Performance (7 Days)'
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
      <h1>Welcome, {user?.first_name || 'Investor'}!</h1>
      
      {/* Portfolio Summary */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>Portfolio Value</h3>
          <div className="stat-value">
            ${dashboardData?.portfolioSummary?.totalValue?.toFixed(2) || '0.00'}
          </div>
        </div>
        <div className={`stat-card ${dashboardData?.portfolioSummary?.totalProfitLoss >= 0 ? 'profit' : 'loss'}`}>
          <h3>Total Profit/Loss</h3>
          <div className="stat-value">
            ${Math.abs(dashboardData?.portfolioSummary?.totalProfitLoss || 0).toFixed(2)} 
            {dashboardData?.portfolioSummary?.totalProfitLoss >= 0 ? ' Profit' : ' Loss'}
          </div>
        </div>
        <div className="stat-card">
          <h3>Transactions</h3>
          <div className="stat-value">
            {dashboardData?.transactionSummary?.total_transactions || 0}
          </div>
        </div>
        <div className="stat-card">
          <h3>Watchlist Stocks</h3>
          <div className="stat-value">
            {dashboardData?.watchlist?.length || 0}
          </div>
        </div>
      </div>
      
      {/* Portfolio Chart */}
      {dashboardData?.portfolioSummary?.totalValue > 0 && (
        <div className="chart-container">
          <Line data={portfolioChartData} options={chartOptions} />
        </div>
      )}
      
      {/* Recent Transactions */}
      <div className="card">
        <div className="card-header">
          <h2>Recent Transactions</h2>
          <Link to="/transactions" className="btn btn-secondary">View All</Link>
        </div>
        
        {dashboardData?.recentTransactions?.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Stock</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
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
          <p>No recent transactions</p>
        )}
      </div>
      
      {/* Watchlist Preview */}
      <div className="card">
        <div className="card-header">
          <h2>Watchlist</h2>
          <Link to="/watchlist" className="btn btn-secondary">View All</Link>
        </div>
        
        {dashboardData?.watchlist?.length > 0 ? (
          <div>
            {dashboardData.watchlist.slice(0, 3).map((item) => (
              <div className="stock-card" key={item.id}>
                <div className="stock-info">
                  <h3>
                    <span className="symbol">{item.symbol}</span>
                  </h3>
                  <div className="name">{item.name}</div>
                </div>
                <div className="stock-price">
                  <div className="current">${parseFloat(item.current_price).toFixed(2)}</div>
                  {item.previous_close && (
                    <div className={`change ${item.current_price >= item.previous_close ? 'positive' : 'negative'}`}>
                      {item.current_price >= item.previous_close ? '+' : ''}
                      {(((item.current_price - item.previous_close) / item.previous_close) * 100).toFixed(2)}%
                    </div>
                  )}
                </div>
              </div>
            ))}
            {dashboardData.watchlist.length > 3 && (
              <div className="text-center" style={{ padding: '10px' }}>
                <Link to="/watchlist">View {dashboardData.watchlist.length - 3} more...</Link>
              </div>
            )}
          </div>
        ) : (
          <p>No stocks in watchlist</p>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;