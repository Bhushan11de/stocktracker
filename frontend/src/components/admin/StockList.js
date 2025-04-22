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
  
  useEffect(() => {
    getAllStocks();
  }, [getAllStocks]);
  
  // Filter stocks based on search term
  const filteredStocks = stocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
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
  
  if (loading && !stocks.length) {
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
            <Link to="/admin/add-stock" className="btn btn-success">
              Add New Stock
            </Link>
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
        
        {stocks.length > 0 ? (
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
                  <tr key={stock.id}>
                    <td>{stock.symbol}</td>
                    <td>{stock.name}</td>
                    <td>${parseFloat(stock.current_price).toFixed(2)}</td>
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
                          to={`/admin/edit-stock/${stock.id}`} 
                          className="btn btn-primary btn-sm"
                        >
                          <FaEdit /> Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteStock(stock.id, stock.symbol)}
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
            <p>No stocks found. Add stocks to get started.</p>
            <Link to="/admin/add-stock" className="btn btn-primary">Add Stock</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockList;