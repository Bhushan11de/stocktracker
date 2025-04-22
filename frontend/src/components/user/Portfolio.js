// frontend/src/components/user/Portfolio.js
import React, { useEffect, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { StockContext } from '../../contexts/StockContext';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const Portfolio = () => {
  const { portfolio, portfolioSummary, getUserPortfolio, loading } = useContext(StockContext);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    getUserPortfolio();
  }, [getUserPortfolio]);
  
  // Filter portfolio based on search term
  const filteredPortfolio = portfolio.filter(item => 
    item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Prepare data for pie chart
  const pieChartData = {
    labels: portfolio.map(item => item.symbol),
    datasets: [
      {
        label: 'Portfolio Distribution',
        data: portfolio.map(item => (item.quantity * item.current_price)),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)',
          'rgba(83, 102, 255, 0.6)',
          'rgba(40, 159, 64, 0.6)',
          'rgba(210, 199, 199, 0.6)',
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
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Portfolio Distribution'
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
  
  return (
    <div>
      <h1>My Portfolio</h1>
      
      {/* Portfolio Summary */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Value</h3>
          <div className="stat-value">
            ${portfolioSummary?.totalValue?.toFixed(2) || '0.00'}
          </div>
        </div>
        <div className="stat-card">
          <h3>Total Cost</h3>
          <div className="stat-value">
            ${portfolioSummary?.totalCost?.toFixed(2) || '0.00'}
          </div>
        </div>
        <div className={`stat-card ${portfolioSummary?.totalProfitLoss >= 0 ? 'profit' : 'loss'}`}>
          <h3>Total Profit/Loss</h3>
          <div className="stat-value">
            ${Math.abs(portfolioSummary?.totalProfitLoss || 0).toFixed(2)} 
            {portfolioSummary?.totalProfitLoss >= 0 ? ' Profit' : ' Loss'}
          </div>
        </div>
        <div className={`stat-card ${portfolioSummary?.profitLossPercentage >= 0 ? 'profit' : 'loss'}`}>
          <h3>Profit/Loss %</h3>
          <div className="stat-value">
            {portfolioSummary?.profitLossPercentage >= 0 ? '+' : ''}
            {portfolioSummary?.profitLossPercentage?.toFixed(2) || '0.00'}%
          </div>
        </div>
      </div>
      
      {/* Portfolio Distribution Chart */}
      {portfolio.length > 0 && (
        <div className="chart-container">
          <Pie data={pieChartData} options={pieOptions} />
        </div>
      )}
      
      {/* Portfolio Holdings */}
      <div className="card">
        <div className="card-header">
          <h2>My Holdings</h2>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search stocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
            />
          </div>
        </div>
        
        {portfolio.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Avg. Buy Price</th>
                  <th>Current Price</th>
                  <th>Value</th>
                  <th>Profit/Loss</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPortfolio.map((stock) => {
                  const value = stock.quantity * stock.current_price;
                  const cost = stock.quantity * stock.average_buy_price;
                  const profitLoss = value - cost;
                  const profitLossPercentage = (profitLoss / cost) * 100;
                  
                  return (
                    <tr key={stock.stock_id}>
                      <td>{stock.symbol}</td>
                      <td>{stock.name}</td>
                      <td>{stock.quantity}</td>
                      <td>${parseFloat(stock.average_buy_price).toFixed(2)}</td>
                      <td>${parseFloat(stock.current_price).toFixed(2)}</td>
                      <td>${value.toFixed(2)}</td>
                      <td className={profitLoss >= 0 ? 'text-success' : 'text-danger'}>
                        ${Math.abs(profitLoss).toFixed(2)} ({profitLossPercentage >= 0 ? '+' : ''}
                        {profitLossPercentage.toFixed(2)}%)
                      </td>
                      <td>
                        <div className="stock-actions">
                          <Link to={`/buy-stock/${stock.stock_id}`} className="btn btn-success btn-sm">Buy</Link>
                          <Link to={`/sell-stock/${stock.stock_id}`} className="btn btn-danger btn-sm">Sell</Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center" style={{ padding: '20px' }}>
            <p>You don't have any stocks in your portfolio yet.</p>
            <Link to="/buy-stock" className="btn btn-primary">Buy Stocks</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;