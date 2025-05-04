// frontend/src/components/user/UserDashboard.js
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSync, FaExchangeAlt, FaChartLine } from 'react-icons/fa';

// Context Hooks
import { useAuth } from '../../contexts/AuthContext';
import { useStockContext } from '../../contexts/StockContext';

// API and Service Imports
import axios from '../../utils/axios';
import { handleApiError } from '../../utils/errorHandler';

// Component Imports
import GlobalLoadingSpinner from '../../components/GlobalLoadingSpinner';

// Import CSS
import '../../assets/css/dashboard.css';

const UserDashboard = () => {
  // Context Hooks
  const { user } = useAuth();
  const { 
    portfolio, 
    watchlist, 
    getUserPortfolio, 
    getUserWatchlist, 
    loading: contextLoading, 
    error: contextError 
  } = useStockContext();

  // Local State Management
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Helper function to calculate portfolio summary
  const calculatePortfolioSummary = useCallback((portfolioData) => {
    if (!portfolioData || portfolioData.length === 0) {
      return {
        totalValue: 0,
        profitLoss: 0,
        percentageChange: 0
      };
    }

    const totalValue = portfolioData.reduce((total, item) => 
      total + ((item.quantity || 0) * parseFloat(item.current_price || 0)), 0);
    const totalCost = portfolioData.reduce((total, item) => 
      total + ((item.quantity || 0) * parseFloat(item.average_buy_price || 0)), 0);
    const profitLoss = totalValue - totalCost;
    const percentageChange = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

    return {
      totalValue,
      profitLoss,
      percentageChange
    };
  }, []);

  // Fetch Dashboard Data
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setRefreshing(true);
      console.log('Fetching dashboard data...');
      
      // Fetch portfolio and watchlist data
      await getUserPortfolio();
      await getUserWatchlist();
      
      // Try to fetch additional dashboard data if endpoint exists
      try {
        const dashboardResponse = await axios.get('/users/dashboard');
        console.log('Dashboard data received:', dashboardResponse.data);
        setDashboardData(dashboardResponse.data.data || dashboardResponse.data);
      } catch (dashboardErr) {
        console.log('Dashboard endpoint not available, using portfolio data instead');
        
        // Create synthetic dashboard data from portfolio and watchlist
        const portfolioArray = Array.isArray(portfolio) ? portfolio : [];
        setDashboardData({
          portfolioSummary: calculatePortfolioSummary(portfolioArray),
          recentTransactions: [], // We don't have this data without the dashboard endpoint
          insights: [] // We don't have this data without the dashboard endpoint
        });
      }
      
      setError(null);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Dashboard Fetch Error:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [getUserPortfolio, getUserWatchlist, portfolio, calculatePortfolioSummary]);

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Memoized Portfolio Calculations
  const portfolioSummary = useMemo(() => {
    // If we have dashboard data with portfolio summary, use that
    if (dashboardData?.portfolioSummary) {
      return {
        totalValue: dashboardData.portfolioSummary.totalValue || 0,
        profitLoss: dashboardData.portfolioSummary.profitLoss || 
                    dashboardData.portfolioSummary.totalProfitLoss || 0,
        percentageChange: dashboardData.portfolioSummary.percentageChange || 
                          dashboardData.portfolioSummary.profitLossPercentage || 0
      };
    }
    
    // Otherwise calculate from portfolio data
    const portfolioArray = Array.isArray(portfolio) ? portfolio : [];
    return calculatePortfolioSummary(portfolioArray);
  }, [dashboardData?.portfolioSummary, portfolio, calculatePortfolioSummary]);

  const handleRefresh = () => {
    fetchDashboardData();
    toast.info('Refreshing dashboard data...');
  };

  // Render Loading State
  if (isLoading || contextLoading) {
    return <GlobalLoadingSpinner />;
  }

  // Render Error State
  if (error || contextError) {
    return (
      <div className="error-container">
        <h2>Dashboard Error</h2>
        <p>{error || contextError}</p>
        <div className="error-actions">
          <button 
            onClick={fetchDashboardData} 
            className="btn-retry"
          >
            Retry Loading
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            className="btn-home"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Safely access data with fallbacks to prevent rendering errors
  const recentTransactions = dashboardData?.recentTransactions || [];
  const insights = dashboardData?.insights || [];
  const portfolioItems = Array.isArray(portfolio) ? portfolio : [];
  const watchlistItems = Array.isArray(watchlist) ? watchlist : [];

  // Format user name
  const userName = user?.name || user?.first_name || 'Investor';

  // Helper function to safely format transaction amount
  const formatTransactionAmount = (transaction) => {
    // Try multiple possible amount fields, ensuring it's a number
    const amount = 
      parseFloat(transaction.totalAmount) || 
      parseFloat(transaction.total_amount) || 
      parseFloat(transaction.amount) || 
      0;
    
    return amount.toFixed(2);
  };

  return (
    <div className="user-dashboard container">
      {/* Welcome Section */}
      <div className="dashboard-header">
        <div className="d-flex justify-content-between align-items-center">
          <div className="header-content">
            <h1>Welcome, {userName}!</h1>
            <p className="header-subtitle">
              Here's an overview of your investment portfolio
            </p>
          </div>
          <button 
            onClick={handleRefresh} 
            className="btn btn-outline-primary"
            disabled={refreshing}
          >
            <FaSync className={refreshing ? 'fa-spin' : ''} /> Refresh
          </button>
        </div>
        <div className="header-actions mt-3">
          <Link to="/buy-stock" className="btn btn-primary me-2">
            <FaExchangeAlt className="me-1" /> Trade
          </Link>
          <Link to="/portfolio" className="btn btn-secondary">
            <FaChartLine className="me-1" /> Manage Portfolio
          </Link>
        </div>
      </div>

      {/* Portfolio Overview */}
      <section className="portfolio-overview mt-4">
        <div className="row">
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h3 className="card-title">Total Portfolio Value</h3>
                <div className="card-value">
                  ₹{portfolioSummary?.totalValue.toFixed(2) || '0.00'}
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className={`card ${(portfolioSummary?.profitLoss || 0) >= 0 ? 'border-success' : 'border-danger'}`}>
              <div className="card-body">
                <h3 className="card-title">Total Profit/Loss</h3>
                <div className={`card-value ${(portfolioSummary?.profitLoss || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                  {(portfolioSummary?.profitLoss || 0) >= 0 ? '+' : '-'}
                  ₹{Math.abs(portfolioSummary?.profitLoss || 0).toFixed(2)}
                  <span className="percentage-change">
                    ({(portfolioSummary?.percentageChange || 0) >= 0 ? '+' : ''}
                    {(portfolioSummary?.percentageChange || 0).toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h3 className="card-title">Total Stocks</h3>
                <div className="card-value">
                  {portfolioItems.length || 0}
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h3 className="card-title">Watchlist</h3>
                <div className="card-value">
                  {watchlistItems.length || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="recent-transactions mt-4">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h2>Recent Transactions</h2>
            <Link to="/transactions" className="btn btn-sm btn-outline-primary">View All</Link>
          </div>
          <div className="card-body">
            {recentTransactions.length > 0 ? (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Stock</th>
                      <th>Type</th>
                      <th>Quantity</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.slice(0, 5).map((transaction, index) => (
                      <tr key={transaction.id || `transaction-${index}`}>
                        <td className="stock-symbol">{transaction.stockSymbol || transaction.symbol || 'Unknown'}</td>
                        <td>
                          <span className={`badge ${transaction.type === 'buy' ? 'bg-success' : 'bg-danger'}`}>
                            {transaction.type || 'Unknown'}
                          </span>
                        </td>
                        <td>{transaction.quantity || 0}</td>
                        <td>₹{formatTransactionAmount(transaction)}</td>
                        <td>{transaction.date || transaction.transaction_date 
                            ? new Date(transaction.date || transaction.transaction_date).toLocaleDateString() 
                            : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center p-4">
                <p>No recent transactions</p>
                <Link to="/buy-stock" className="btn btn-primary">Start Trading</Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Watchlist Preview */}
      <section className="watchlist-preview mt-4">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h2>Watchlist</h2>
            <Link to="/watchlist" className="btn btn-sm btn-outline-primary">View All</Link>
          </div>
          <div className="card-body">
            {watchlistItems.length > 0 ? (
              <div className="row">
                {watchlistItems.slice(0, 5).map((stock, index) => {
                  const current_price = parseFloat(stock.current_price || stock.currentPrice || 0);
                  const previous_close = parseFloat(stock.previous_close || stock.previousClose || 0);
                  const priceChange = previous_close 
                    ? ((current_price - previous_close) / previous_close) * 100 
                    : 0;
                  
                  return (
                    <div key={stock.id || stock.stock_id || `stock-${index}`} className="col-md-4 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <h5 className="card-title">{stock.symbol}</h5>
                          <h6 className="card-subtitle mb-2 text-muted">{stock.name}</h6>
                          <div className="d-flex justify-content-between">
                            <span>₹{current_price.toFixed(2)}</span>
                            <span className={`${priceChange >= 0 ? 'text-success' : 'text-danger'}`}>
                              {priceChange >= 0 ? '+' : ''}
                              {priceChange.toFixed(2)}%
                            </span>
                          </div>
                          <div className="mt-2">
                            <Link to={`/buy-stock/${stock.stock_id || stock.id}`} className="btn btn-sm btn-outline-success">
                              Buy
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-4">
                <p>Your watchlist is empty</p>
                <Link to="/buy-stock" className="btn btn-primary">Explore Stocks</Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Investment Insights */}
      {insights.length > 0 && (
        <section className="investment-insights mt-4 mb-4">
          <div className="card">
            <div className="card-header">
              <h2>Investment Insights</h2>
            </div>
            <div className="card-body">
              <div className="row">
                {insights.map((insight, index) => (
                  <div key={insight.id || `insight-${index}`} className="col-md-4 mb-3">
                    <div className="card h-100"><div className="card-body">
                        <h5 className="card-title">{insight.title}</h5>
                        <span className={`badge bg-${(insight.type || '').toLowerCase() === 'tip' ? 'info' : 'warning'} mb-2`}>
                          {insight.type}
                        </span>
                        <p className="card-text">{insight.description}</p>
                        <Link 
                          to={`/stocks/${insight.stockSymbol}`} 
                          className="btn btn-sm btn-outline-primary"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default UserDashboard;