// frontend/src/components/user/Watchlist.js
import React, { useEffect, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaShoppingCart, FaSearch, FaSync } from 'react-icons/fa';
import { StockContext } from '../../contexts/StockContext';
import { toast } from 'react-toastify';

const Watchlist = () => {
  const { watchlist, getUserWatchlist, removeFromWatchlist, loading } = useContext(StockContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  
  const fetchWatchlist = async () => {
    try {
      setLocalLoading(true);
      setLocalError(null);
      await getUserWatchlist();
      setLocalLoading(false);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      setLocalError('Failed to load watchlist. Please try again.');
      setLocalLoading(false);
    }
  };
  
  useEffect(() => {
    fetchWatchlist();
  }, [getUserWatchlist]);
  
  // Ensure watchlist is an array before filtering
  const watchlistItems = Array.isArray(watchlist) ? watchlist : [];
  
  // Filter watchlist based on search term
  const filteredWatchlist = searchTerm.trim() === '' 
    ? watchlistItems 
    : watchlistItems.filter(item => 
        (item.symbol && item.symbol.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  
  const handleRemoveFromWatchlist = async (stockId) => {
    try {
      setLocalLoading(true);
      await removeFromWatchlist(stockId);
      toast.success('Stock removed from watchlist');
      setLocalLoading(false);
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      toast.error('Failed to remove stock from watchlist');
      setLocalLoading(false);
    }
  };
  
  const handleRefresh = () => {
    fetchWatchlist();
    toast.info('Refreshing watchlist data...');
  };
  
  if (loading || localLoading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }
  
  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>My Watchlist</h1>
        <button 
          onClick={handleRefresh} 
          className="btn btn-outline-primary"
          disabled={loading || localLoading}
        >
          <FaSync className={loading || localLoading ? 'fa-spin' : ''} /> Refresh
        </button>
      </div>
      
      {localError && (
        <div className="alert alert-danger mb-4">
          {localError}
          <button 
            className="btn btn-sm btn-outline-danger ms-2" 
            onClick={fetchWatchlist}
          >
            Try Again
          </button>
        </div>
      )}
      
      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
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
        </div>
        
        {watchlistItems.length > 0 ? (
          <div className="table-responsive">
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
                {filteredWatchlist.length > 0 ? (
                  filteredWatchlist.map((stock) => {
                    const current_price = parseFloat(stock.current_price || 0);
                    const previous_close = parseFloat(stock.previous_close || 0);
                    const priceChange = previous_close 
                      ? current_price - previous_close 
                      : 0;
                    const percentChange = previous_close 
                      ? (priceChange / previous_close) * 100 
                      : 0;
                    
                    return (
                      <tr key={stock.id || stock.stock_id}>
                        <td>{stock.symbol || 'N/A'}</td>
                        <td>{stock.name || 'N/A'}</td>
                        <td>${current_price.toFixed(2)}</td>
                        <td className={priceChange >= 0 ? 'text-success' : 'text-danger'}>
                          {priceChange >= 0 ? '+' : ''}
                          ${Math.abs(priceChange).toFixed(2)} (
                          {percentChange >= 0 ? '+' : ''}
                          {percentChange.toFixed(2)}%)
                        </td>
                        <td>
                          <div className="stock-actions">
                            <Link to={`/buy-stock/${stock.stock_id || stock.id}`} className="btn btn-success btn-sm me-1">
                              <FaShoppingCart /> Buy
                            </Link>
                            <button
                              onClick={() => handleRemoveFromWatchlist(stock.stock_id || stock.id)}
                              className="btn btn-danger btn-sm"
                              disabled={localLoading}
                            >
                              <FaTrash /> Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No stocks match your search.
                      {searchTerm && (
                        <button 
                          onClick={() => setSearchTerm('')} 
                          className="btn btn-sm btn-outline-primary ms-2"
                        >
                          Clear Search
                        </button>
                      )}
                    </td>
                  </tr>
                )}
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