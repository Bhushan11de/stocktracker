// frontend/src/components/user/BuyStock.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSearch, FaStar, FaRegStar } from 'react-icons/fa';
import { StockContext } from '../../contexts/StockContext';
import { toast } from 'react-toastify';

const BuyStock = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const {
    stocks,
    getAllStocks,
    getStockById,
    addToWatchlist,
    removeFromWatchlist,
    buyStock,
    loading,
    error
  } = useContext(StockContext);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [buyPrice, setBuyPrice] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  
  // Fetch all stocks on mount
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        await getAllStocks();
      } catch (error) {
        console.error('Error fetching stocks:', error);
        setLocalError('Failed to load stocks. Please try again.');
      }
    };
    
    fetchStocks();
  }, [getAllStocks]);
  
  // Fetch specific stock if ID is provided in URL
  useEffect(() => {
    const fetchStockById = async () => {
      if (id) {
        try {
          setLocalLoading(true);
          const stockData = await getStockById(id);
          
          if (!stockData) {
            setLocalError('Stock not found');
            setLocalLoading(false);
            return;
          }
          
          console.log('Fetched stock data:', stockData);
          setSelectedStock(stockData);
          setIsInWatchlist(stockData.isInWatchlist || false);
          setBuyPrice(stockData.current_price || 0);
          setTotalAmount((stockData.current_price || 0) * quantity);
          setLocalLoading(false);
        } catch (error) {
          console.error('Error fetching stock:', error);
          setLocalError('Failed to load stock details');
          setLocalLoading(false);
        }
      }
    };
    
    fetchStockById();
  }, [id, getStockById, quantity]);
  
  // Make sure stocks is an array before filtering
  const stocksArray = Array.isArray(stocks) ? stocks : [];
  
  // Filter stocks based on search term
  const filteredStocks = searchTerm.trim() === '' 
    ? stocksArray 
    : stocksArray.filter(stock => 
        (stock.symbol && stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (stock.name && stock.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  
  // Update total amount when quantity or price changes
  useEffect(() => {
    if (buyPrice && quantity) {
      setTotalAmount(buyPrice * quantity);
    }
  }, [buyPrice, quantity]);
  
  const handleSelectStock = async (stock) => {
    try {
      setLocalLoading(true);
      setLocalError(null);
      
      console.log('Selected stock:', stock);
      const stockData = await getStockById(stock.id);
      
      if (!stockData) {
        setLocalError('Failed to load stock details');
        setLocalLoading(false);
        return;
      }
      
      setSelectedStock(stockData);
      setIsInWatchlist(stockData.isInWatchlist || false);
      setBuyPrice(stockData.current_price || 0);
      setTotalAmount((stockData.current_price || 0) * quantity);
      setLocalLoading(false);
    } catch (error) {
      console.error('Error fetching stock details:', error);
      setLocalError('Failed to load stock details');
      setLocalLoading(false);
    }
  };
  
  const handleToggleWatchlist = async () => {
    if (!selectedStock) return;
    
    try {
      setLocalLoading(true);
      
      if (isInWatchlist) {
        await removeFromWatchlist(selectedStock.id);
        setIsInWatchlist(false);
        toast.success('Removed from watchlist');
      } else {
        await addToWatchlist(selectedStock.id);
        setIsInWatchlist(true);
        toast.success('Added to watchlist');
      }
      
      setLocalLoading(false);
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      toast.error('Failed to update watchlist');
      setLocalLoading(false);
    }
  };
  
  const handleBuyStock = async (e) => {
    e.preventDefault();
    
    if (!selectedStock || !quantity || quantity <= 0) {
      toast.error('Please select a stock and enter a valid quantity');
      return;
    }
    
    if (!buyPrice || buyPrice <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    
    try {
      setLocalLoading(true);
      setLocalError(null);
      
      console.log('Buying stock:', {
        stockId: selectedStock.id,
        quantity,
        price: buyPrice
      });
      
      await buyStock(selectedStock.id, quantity, buyPrice);
      toast.success(`Successfully purchased ${quantity} shares of ${selectedStock.symbol}`);
      navigate('/portfolio');
    } catch (error) {
      console.error('Error buying stock:', error);
      setLocalError(error.response?.data?.error || 'Failed to buy stock. Please try again.');
      setLocalLoading(false);
    }
  };
  
  if ((loading || localLoading) && !stocksArray.length) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }
  
  return (
    <div>
      <h1>Buy Stocks</h1>
      
      {localError && (
        <div className="alert alert-danger mb-3">
          {localError}
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger mb-3">
          {error}
        </div>
      )}
      
      <div className="row">
        {/* Stock List */}
        <div className="col-md-5">
          <div className="card" style={{ height: '600px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <h2>Available Stocks</h2>
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
            
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {filteredStocks.length > 0 ? (
                filteredStocks.map((stock) => (
                  <div 
                    key={stock.id} 
                    className={`stock-card ${selectedStock && selectedStock.id === stock.id ? 'selected' : ''}`}
                    onClick={() => handleSelectStock(stock)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="stock-info">
                      <h3>
                        <span className="symbol">{stock.symbol}</span>
                      </h3>
                      <div className="name">{stock.name}</div>
                    </div>
                    <div className="stock-price">
                      <div className="current">${parseFloat(stock.current_price || 0).toFixed(2)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-4">
                  <p>No stocks found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Buy Form */}
        <div className="col-md-7">
          <div className="card">
            <div className="card-header">
              <h2>Buy Stock</h2>
            </div>
            
            {selectedStock ? (
              <div className="card-body">
                <div className="selected-stock-info" style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>
                      {selectedStock.symbol} - {selectedStock.name}
                    </h3>
                    <button
                      className="btn btn-link"
                      onClick={handleToggleWatchlist}
                      style={{ fontSize: '1.5rem' }}
                    >
                      {isInWatchlist ? <FaStar color="#f39c12" /> : <FaRegStar />}
                    </button>
                  </div>
                  <div className="stock-price-info">
                    <p><strong>Current Price:</strong> ${parseFloat(selectedStock.current_price || 0).toFixed(2)}</p>
                    {selectedStock.previous_close && (
                      <p>
                        <strong>Change:</strong>
                        <span className={selectedStock.current_price >= selectedStock.previous_close ? 'text-success' : 'text-danger'}>
                          {selectedStock.current_price >= selectedStock.previous_close ? '+' : ''}
                          ${Math.abs(selectedStock.current_price - selectedStock.previous_close).toFixed(2)} (
                          {((selectedStock.current_price - selectedStock.previous_close) / selectedStock.previous_close * 100).toFixed(2)}%)
                        </span>
                      </p>
                    )}
                  </div>
                  {selectedStock.description && (
                    <div className="description">
                      <p>{selectedStock.description}</p>
                    </div>
                  )}
                </div>
                
                <form onSubmit={handleBuyStock}>
                  <div className="form-group mb-3">
                    <label htmlFor="quantity">Quantity</label>
                    <input
                      type="number"
                      id="quantity"
                      className="form-control"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                      min="1"
                      required
                    />
                  </div>
                  
                  <div className="form-group mb-3">
                    <label htmlFor="buyPrice">Price per Share ($)</label>
                    <input
                      type="number"
                      id="buyPrice"
                      className="form-control"
                      value={buyPrice}
                      onChange={(e) => setBuyPrice(parseFloat(e.target.value) || 0)}
                      step="0.01"
                      min="0.01"
                      required
                    />
                  </div>
                  
                  <div className="form-group mb-3">
                    <label htmlFor="totalAmount">Total Amount</label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">$</span>
                      </div>
                      <input
                        type="text"
                        id="totalAmount"
                        className="form-control"
                        value={totalAmount.toFixed(2)}
                        readOnly
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="btn btn-success"
                    style={{ width: '100%', marginTop: '20px' }}
                    disabled={loading || localLoading}
                  >
                    {loading || localLoading ? 'Processing...' : 'Buy Now'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="card-body text-center">
                <p>Select a stock from the list to buy.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyStock;