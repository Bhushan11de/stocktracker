// frontend/src/components/user/Watchlist.js
import React, { useEffect, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaShoppingCart, FaSearch } from 'react-icons/fa';
import { StockContext } from '../../contexts/StockContext';

const Watchlist = () => {
  const { watchlist, getUserWatchlist, removeFromWatchlist, loading } = useContext(StockContext);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    getUserWatchlist();
  }, [getUserWatchlist]);
  
  // Filter watchlist based on search term
  const filteredWatchlist = watchlist.filter(item => 
    item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleRemoveFromWatchlist = async (stockId) => {
    try {
      await removeFromWatchlist(stockId);
    } catch (error) {
      console.error('Error removing from watchlist:', error);
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
      <h1>My Watchlist</h1>
      
      <div className="card">
        <div className="card-header">
          <h2>Watched Stocks</h2>
          <div className="search-form">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search stocks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-primary">
                <FaSearch />
              </button>
            </div>
          </div>
        </div>
        
        {watchlist.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Name</th>
                  <th>Current Price</th>
                  <th>Change</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWatchlist.map((stock) => {
                  const priceChange = stock.previous_close 
                    ? stock.current_price - stock.previous_close 
                    : 0;
                  const percentChange = stock.previous_close 
                    ? (priceChange / stock.previous_close) * 100 
                    : 0;
                  
                  return (
                    <tr key={stock.id}>
                      <td>{stock.symbol}</td>
                      <td>{stock.name}</td>
                      <td>${parseFloat(stock.current_price).toFixed(2)}</td>
                      <td className={priceChange >= 0 ? 'text-success' : 'text-danger'}>
                        {priceChange >= 0 ? '+' : ''}
                        ${Math.abs(priceChange).toFixed(2)} (
                        {percentChange >= 0 ? '+' : ''}
                        {percentChange.toFixed(2)}%)
                      </td>
                      <td>
                        <div className="stock-actions">
                          <Link to={`/buy-stock/${stock.stock_id}`} className="btn btn-success btn-sm">
                            <FaShoppingCart /> Buy
                          </Link>
                          <button
                            onClick={() => handleRemoveFromWatchlist(stock.stock_id)}
                            className="btn btn-danger btn-sm"
                          >
                            <FaTrash /> Remove
                          </button>
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
            <p>You don't have any stocks in your watchlist yet.</p>
            <Link to="/buy-stock" className="btn btn-primary">Browse Stocks</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;