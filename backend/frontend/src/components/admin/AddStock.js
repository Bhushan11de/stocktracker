// frontend/src/components/admin/AddStock.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';

const AddStock = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    currentPrice: '',
    previousClose: '',
    marketCap: '',
    volume: '',
    description: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { symbol, name, currentPrice, previousClose, marketCap, volume, description } = formData;
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await adminService.addStock({
        symbol,
        name,
        currentPrice: parseFloat(currentPrice),
        previousClose: previousClose ? parseFloat(previousClose) : null,
        marketCap: marketCap ? parseInt(marketCap) : null,
        volume: volume ? parseInt(volume) : null,
        description
      });
      
      toast.success('Stock added successfully');
      navigate('/admin/stocks');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add stock');
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h1>Add New Stock</h1>
      
      <div className="card">
        <div className="card-header">
          <h2>Stock Information</h2>
        </div>
        
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="symbol">Stock Symbol</label>
                <input
                  type="text"
                  id="symbol"
                  name="symbol"
                  className="form-control"
                  value={symbol}
                  onChange={handleChange}
                  placeholder="e.g. AAPL"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="name">Company Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  value={name}
                  onChange={handleChange}
                  placeholder="e.g. Apple Inc."
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="currentPrice">Current Price ($)</label>
                <input
                  type="number"
                  id="currentPrice"
                  name="currentPrice"
                  className="form-control"
                  value={currentPrice}
                  onChange={handleChange}
                  placeholder="e.g. 150.25"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="previousClose">Previous Close ($)</label>
                <input
                  type="number"
                  id="previousClose"
                  name="previousClose"
                  className="form-control"
                  value={previousClose}
                  onChange={handleChange}
                  placeholder="e.g. 149.75"
                  step="0.01"
                  min="0.01"
                />
                <small className="text-muted">Optional</small>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="marketCap">Market Cap</label>
                <input
                  type="number"
                  id="marketCap"
                  name="marketCap"
                  className="form-control"
                  value={marketCap}
                  onChange={handleChange}
                  placeholder="e.g. 2500000000"
                  min="0"
                />
                <small className="text-muted">Optional</small>
              </div>
              <div className="form-group">
                <label htmlFor="volume">Volume</label>
                <input
                  type="number"
                  id="volume"
                  name="volume"
                  className="form-control"
                  value={volume}
                  onChange={handleChange}
                  placeholder="e.g. 15000000"
                  min="0"
                />
                <small className="text-muted">Optional</small>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                value={description}
                onChange={handleChange}
                placeholder="Enter company description..."
                rows="4"
              ></textarea>
              <small className="text-muted">Optional</small>
            </div>
            
            <div className="form-group mt-4">
              <button
                type="submit"
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Stock'}
              </button>
              <button
                type="button"
                className="btn btn-secondary ml-3"
                onClick={() => navigate('/admin/stocks')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStock;