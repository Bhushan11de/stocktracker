// frontend/src/components/user/Portfolio.js
import React, { useEffect, useContext, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { StockContext } from '../../contexts/StockContext';
import { toast } from 'react-toastify';
import { FaSync, FaArrowUp, FaArrowDown } from 'react-icons/fa';

// Import CSS - Add this file to your assets folder
import '../../assets/css/portfolio.css';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const Portfolio = () => {
  const { 
    portfolio, 
    portfolioSummary, 
    getUserPortfolio, 
    loading, 
    error 
  } = useContext(StockContext);
  
  const [isLoading, setIsLoading] = useState(true);
  const [localError, setLocalError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'symbol', direction: 'ascending' });
  const [filterConfig, setFilterConfig] = useState({ status: 'all', search: '' });

  // Fetch portfolio data
  const fetchPortfolio = async () => {
    try {
      setIsLoading(true);
      setRefreshing(true);
      setLocalError(null);
      await getUserPortfolio();
    } catch (err) {
      setLocalError('Failed to load portfolio data');
      toast.error('Error loading portfolio data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [getUserPortfolio]);

  // Make sure portfolio is an array
  const portfolioItems = Array.isArray(portfolio) ? portfolio : [];

  // Sort handler
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Filter handlers
  const handleStatusFilter = (e) => {
    setFilterConfig({ ...filterConfig, status: e.target.value });
  };

  const handleSearchChange = (e) => {
    setFilterConfig({ ...filterConfig, search: e.target.value });
  };

  const handleRefresh = () => {
    fetchPortfolio();
    toast.info('Refreshing portfolio data...');
  };

  // Memoized sorted and filtered portfolio
  const sortedAndFilteredPortfolio = useMemo(() => {
    // Apply filters
    let filteredItems = [...portfolioItems];
    
    // Filter by status if not 'all'
    if (filterConfig.status !== 'all') {
      const isProfitable = filterConfig.status === 'profitable';
      filteredItems = filteredItems.filter(stock => {
        const currentPrice = parseFloat(stock.current_price || 0);
        const avgPrice = parseFloat(stock.average_buy_price || 0);
        const profitLoss = currentPrice - avgPrice;
        return isProfitable ? profitLoss > 0 : profitLoss <= 0;
      });
    }
    
    // Filter by search term
    if (filterConfig.search) {
      const searchTerm = filterConfig.search.toLowerCase();
      filteredItems = filteredItems.filter(stock => 
        (stock.symbol && stock.symbol.toLowerCase().includes(searchTerm)) || 
        (stock.name && stock.name.toLowerCase().includes(searchTerm))
      );
    }
    
    // Apply sorting
    return filteredItems.sort((a, b) => {
      // Handle different property names
      let aValue, bValue;
      
      switch(sortConfig.key) {
        case 'symbol':
        case 'name':
          aValue = a[sortConfig.key] || '';
          bValue = b[sortConfig.key] || '';
          break;
        case 'quantity':
          aValue = a.quantity || 0;
          bValue = b.quantity || 0;
          break;
        case 'avgPrice':
          aValue = parseFloat(a.average_buy_price || 0);
          bValue = parseFloat(b.average_buy_price || 0);
          break;
        case 'currentPrice':
          aValue = parseFloat(a.current_price || 0);
          bValue = parseFloat(b.current_price || 0);
          break;
        case 'currentValue':
          aValue = (a.quantity || 0) * parseFloat(a.current_price || 0);
          bValue = (b.quantity || 0) * parseFloat(b.current_price || 0);
          break;
        case 'profitLoss':
          const aCurrentValue = (a.quantity || 0) * parseFloat(a.current_price || 0);
          const aCostValue = (a.quantity || 0) * parseFloat(a.average_buy_price || 0);
          const bCurrentValue = (b.quantity || 0) * parseFloat(b.current_price || 0);
          const bCostValue = (b.quantity || 0) * parseFloat(b.average_buy_price || 0);
          aValue = aCurrentValue - aCostValue;
          bValue = bCurrentValue - bCostValue;
          break;
        default:
          aValue = a[sortConfig.key] || 0;
          bValue = b[sortConfig.key] || 0;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'ascending' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [portfolioItems, sortConfig, filterConfig]);

  // Prepare data for pie chart
  const pieChartData = useMemo(() => {
    if (portfolioItems.length === 0) return null;
    
    // Limit to top 10 stocks by value for better chart readability
    const sortedByValue = [...portfolioItems].sort((a, b) => {
      const aValue = (a.quantity || 0) * parseFloat(a.current_price || 0);
      const bValue = (b.quantity || 0) * parseFloat(b.current_price || 0);
      return bValue - aValue; // Sort descending
    });
    
    const top10 = sortedByValue.slice(0, 10);
    
    // If more than 10 stocks, add an "Others" category
    let othersValue = 0;
    if (sortedByValue.length > 10) {
      othersValue = sortedByValue.slice(10).reduce((sum, item) => {
        return sum + ((item.quantity || 0) * parseFloat(item.current_price || 0));
      }, 0);
    }
    
    const labels = top10.map(item => item.symbol || 'Unknown');
    const data = top10.map(item => (item.quantity || 0) * parseFloat(item.current_price || 0));
    
    if (othersValue > 0) {
      labels.push('Others');
      data.push(othersValue);
    }
    
    return {
      labels,
      datasets: [
        {
          label: 'Portfolio Distribution',
          data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)','rgba(255, 159, 64, 0.6)',
            'rgba(199, 199, 199, 0.6)',
            'rgba(83, 102, 255, 0.6)',
            'rgba(40, 159, 64, 0.6)',
            'rgba(210, 199, 199, 0.6)',
            'rgba(128, 128, 128, 0.6)', // For "Others" category
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(199, 199, 199, 1)',
            'rgba(83, 102, 255, 1)',
            'rgba(40, 159, 64, 1)',
            'rgba(210, 199, 199, 1)',
            'rgba(128, 128, 128, 1)', // For "Others" category
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [portfolioItems]);
  
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 15,
          font: {
            size: 11
          }
        }
      },
      title: {
        display: true,
        text: 'Portfolio Distribution'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return `${label}: ₹${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    }
  };

  if (isLoading || loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || localError) {
    return (
      <div className="alert alert-danger">
        <h2>Error</h2>
        <p>{error || localError}</p>
        <button onClick={fetchPortfolio} className="btn btn-warning">
          Retry
        </button>
      </div>
    );
  }

  // Safe portfolio summary with defaults
  const summary = portfolioSummary || {
    totalValue: 0,
    totalCost: 0,
    totalProfitLoss: 0,
    profitLossPercentage: 0
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title">My Investment Portfolio</h1>
        <button 
          onClick={handleRefresh} 
          className="btn btn-outline-primary"
          disabled={refreshing}
        >
          <FaSync className={refreshing ? 'fa-spin' : ''} /> Refresh
        </button>
      </div>
      
      {/* Portfolio Summary */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card h-100">
            <div className="card-body">
              <h3 className="card-title">Total Value</h3>
              <p className="stat-value">₹{summary.totalValue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card h-100">
            <div className="card-body">
              <h3 className="card-title">Total Cost</h3>
              <p className="stat-value">₹{summary.totalCost.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className={`card h-100 ${summary.totalProfitLoss >= 0 ? 'border-success' : 'border-danger'}`}>
            <div className="card-body">
              <h3 className="card-title">Profit/Loss</h3>
              <p className={`stat-value ${summary.totalProfitLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                {summary.totalProfitLoss >= 0 ? '+' : '-'}
                ₹{Math.abs(summary.totalProfitLoss).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className={`card h-100 ${summary.profitLossPercentage >= 0 ? 'border-success' : 'border-danger'}`}>
            <div className="card-body">
              <h3 className="card-title">P/L Percentage</h3>
              <p className={`stat-value ${summary.profitLossPercentage >= 0 ? 'text-success' : 'text-danger'}`}>
                {summary.profitLossPercentage >= 0 ? '+' : '-'}
                {Math.abs(summary.profitLossPercentage).toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Portfolio Distribution Chart */}
      {portfolioItems.length > 0 && pieChartData && (
        <div className="row mb-4">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <h2>Portfolio Distribution</h2>
              </div>
              <div className="card-body">
                <div className="chart-container" style={{ height: '300px' }}>
                  <Pie data={pieChartData} options={pieOptions} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Filters */}
      <div className="card mb-4">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h2>My Holdings</h2>
            <div className="d-flex">
              <div className="me-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search stocks..."
                  value={filterConfig.search}
                  onChange={handleSearchChange}
                />
              </div>
              <div>
                <select className="form-select" value={filterConfig.status} onChange={handleStatusFilter}>
                  <option value="all">All Stocks</option>
                  <option value="profitable">Profitable</option>
                  <option value="loss">Loss</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Portfolio Table */}
        <div className="card-body">
          {sortedAndFilteredPortfolio.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('symbol')} className="sortable-header">
                      Symbol {sortConfig.key === 'symbol' && (
                        sortConfig.direction === 'ascending' ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />
                      )}
                    </th>
                    <th onClick={() => handleSort('name')} className="sortable-header">
                      Name {sortConfig.key === 'name' && (
                        sortConfig.direction === 'ascending' ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />
                      )}
                    </th>
                    <th onClick={() => handleSort('quantity')} className="sortable-header">
                      Quantity {sortConfig.key === 'quantity' && (
                        sortConfig.direction === 'ascending' ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />
                      )}
                    </th>
                    <th onClick={() => handleSort('avgPrice')} className="sortable-header">
                      Avg. Price {sortConfig.key === 'avgPrice' && (
                        sortConfig.direction === 'ascending' ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />
                      )}
                    </th>
                    <th onClick={() => handleSort('currentPrice')} className="sortable-header">
                      Current Price {sortConfig.key === 'currentPrice' && (
                        sortConfig.direction === 'ascending' ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />
                      )}
                    </th>
                    <th onClick={() => handleSort('currentValue')} className="sortable-header">
                      Value {sortConfig.key === 'currentValue' && (
                        sortConfig.direction === 'ascending' ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />
                      )}
                    </th>
                    <th onClick={() => handleSort('profitLoss')} className="sortable-header">
                      P/L {sortConfig.key === 'profitLoss' && (
                        sortConfig.direction === 'ascending' ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />
                      )}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAndFilteredPortfolio.map((stock, index) => {
                    // Calculate values
                    const currentValue = (stock.quantity || 0) * parseFloat(stock.current_price || 0);
                    const costValue = (stock.quantity || 0) * parseFloat(stock.average_buy_price || 0);
                    const profitLoss = currentValue - costValue;
                    const profitLossPercentage = costValue > 0 ? (profitLoss / costValue) * 100 : 0;
                    
                    return (
                      <tr key={stock.stock_id || stock.id || `stock-${index}`}>
                        <td className="fw-bold">{stock.symbol}</td>
                        <td>{stock.name}</td>
                        <td>{stock.quantity}</td>
                        <td>₹{parseFloat(stock.average_buy_price || 0).toFixed(2)}</td>
                        <td>₹{parseFloat(stock.current_price || 0).toFixed(2)}</td>
                        <td>₹{currentValue.toFixed(2)}</td>
                        <td className={profitLoss >= 0 ? 'text-success' : 'text-danger'}>
                          {profitLoss >= 0 ? '+' : '-'}₹{Math.abs(profitLoss).toFixed(2)}
                          <span className="ms-1">
                            ({profitLossPercentage >= 0 ? '+' : ''}
                            {profitLossPercentage.toFixed(2)}%)
                          </span>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <Link to={`/buy-stock/${stock.stock_id || stock.id}`} className="btn btn-success">Buy</Link>
                            <Link to={`/sell-stock/${stock.stock_id || stock.id}`} className="btn btn-danger">Sell</Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center p-4">
              <p>No stocks in your portfolio match the current filters.</p>
              {filterConfig.status !== 'all' || filterConfig.search ? (
                <button 
                  onClick={() => setFilterConfig({ status: 'all', search: '' })}
                  className="btn btn-outline-primary"
                >
                  Clear Filters
                </button>
              ) : (
                <div>
                  <p>Start building your portfolio by buying stocks.</p>
                  <Link to="/buy-stock" className="btn btn-primary">Buy Stocks</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;