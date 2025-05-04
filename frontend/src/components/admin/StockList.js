// frontend/src/components/admin/StockList.js
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { StockContext } from '../../contexts/StockContext';
import adminService from '../../services/adminService';

const StockList = () => {
  const { stocks, getAllStocks, loading } = useContext(StockContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLocalLoading(true);
        await getAllStocks();
        console.log("Stocks fetched successfully");
      } catch (error) {
        console.error("Error fetching stocks:", error);
        toast.error("Failed to load stocks");
      } finally {
        setLocalLoading(false);
      }
    };
    
    fetchStocks();
  }, [getAllStocks]);
  
  // Ensure stocks is an array before filtering
  const stocksArray = Array.isArray(stocks) ? stocks : [];
  
  // Debug log to check what stocks we have
  console.log("Current stocks in state:", stocksArray);
  
  // Filter stocks based on search term
  const filteredStocks = searchTerm.trim() === '' 
    ? stocksArray 
    : stocksArray.filter(stock => 
        (stock.symbol && stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (stock.name && stock.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  
  const handleDeleteStock = async (id, symbol) => {
    if (window.confirm(`Are you sure you want to delete ${symbol}? This will remove all related data including portfolio entries and watchlist items.`)) {
      try {
        setDeleteLoading(true);
        await adminService.deleteStock(id);
        await getAllStocks(); // Refresh the list
        toast.success(`Stock ${symbol} deleted successfully`);
      } catch (error) {
        toast.error('Failed to delete stock');
        console.error('Error deleting stock:', error);
      } finally {
        setDeleteLoading(false);
      }
    }
  };
  
  const handleRefreshStocks = async () => {
    try {
      setLocalLoading(true);
      await getAllStocks();
      toast.success("Stocks refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh stocks");
    } finally {
      setLocalLoading(false);
    }
  };
  
  if ((loading || localLoading) && stocksArray.length === 0) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }
  
  return (
    <div>
      <h1>Manage Stocks</h1>
      
      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h2>Stock List</h2>
            <div>
              <button onClick={handleRefreshStocks} className="btn btn-info me-2" disabled={loading || localLoading}>
                {(loading || localLoading) ? 'Refreshing...' : 'Refresh'}
              </button>
              <Link to="/admin/add-stock" className="btn btn-success">
                Add New Stock
              </Link>
            </div>
          </div>
          <div className="search-form mt-3">
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
        
        {stocksArray.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Name</th>
                  <th>Current Price</th>
                  <th>Previous Close</th>
                  <th>Market Cap</th>
                  <th>Volume</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStocks.map((stock) => (
                  <tr key={stock.id || stock.stock_id}>
                    <td>{stock.symbol || 'Unknown'}</td>
                    <td>{stock.name || 'Unknown'}</td>
                    <td>${parseFloat(stock.current_price || 0).toFixed(2)}</td>
                    <td>
                      {stock.previous_close 
                        ? `$${parseFloat(stock.previous_close).toFixed(2)}` 
                        : 'N/A'}
                    </td>
                    <td>
                      {stock.market_cap 
                        ? `$${(stock.market_cap / 1000000000).toFixed(2)}B` 
                        : 'N/A'}
                    </td>
                    <td>
                      {stock.volume 
                        ? `${(stock.volume / 1000000).toFixed(2)}M` 
                        : 'N/A'}
                    </td>
                    <td>
                      <div className="stock-actions">
                        <Link 
                          to={`/admin/edit-stock/${stock.id || stock.stock_id}`} 
                          className="btn btn-primary btn-sm me-1"
                        >
                          <FaEdit /> Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteStock(stock.id || stock.stock_id, stock.symbol || 'Unknown')}
                          className="btn btn-danger btn-sm"
                          disabled={deleteLoading}
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-4">
            <p>{searchTerm ? 'No stocks match your search.' : 'No stocks found. Add stocks to get started.'}</p>
            {searchTerm ? (
              <button 
                onClick={() => setSearchTerm('')} 
                className="btn btn-outline-primary me-2"
              >
                Clear Search
              </button>
            ) : null}
            <Link to="/admin/add-stock" className="btn btn-primary">Add Stock</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockList;