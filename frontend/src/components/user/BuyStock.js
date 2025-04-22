// frontend/src/components/user/BuyStock.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSearch, FaStar, FaRegStar } from 'react-icons/fa';
import { StockContext } from '../../contexts/StockContext';

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
    loading
  } = useContext(StockContext);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [buyPrice, setBuyPrice] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  
  // Fetch all stocks on mount
  useEffect(() => {
    const fetchStocks = async () => {
      await getAllStocks();
    };
    
    fetchStocks();
  }, [getAllStocks]);
  
  // Fetch specific stock if ID is provided in URL
  useEffect(() => {
    const fetchStockById = async () => {
      if (id) {
        try {
          const stockData = await getStockById(id);
          setSelectedStock(stockData);
          setIsInWatchlist(stockData.isInWatchlist);
          setBuyPrice(stockData.current_price);
          setTotalAmount(stockData.current_price * quantity);
        } catch (error) {
          console.error('Error fetching stock:', error);
        }
      }
    };
    
    fetchStockById();
  }, [id, getStockById]);
  
  // Filter stocks based on search term
  const filteredStocks = stocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Update total amount when quantity or price changes
  useEffect(() => {
    if (buyPrice && quantity) {
      setTotalAmount(buyPrice * quantity);
    }
  }, [buyPrice, quantity]);
  
  const handleSelectStock = async (stock) => {
    try {
      const stockData = await getStockById(stock.id);
      setSelectedStock(stockData);
      setIsInWatchlist(stockData.isInWatchlist);
      setBuyPrice(stockData.current_price);
      setTotalAmount(stockData.current_price * quantity);
    } catch (error) {
      console.error('Error fetching stock details:', error);
    }
  };
  
  const handleToggleWatchlist = async () => {
    if (!selectedStock) return;
    
    try {
      if (isInWatchlist) {
        await removeFromWatchlist(selectedStock.id);
        setIsInWatchlist(false);
      } else {
        await addToWatchlist(selectedStock.id);
        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    }
  };
  
  const handleBuyStock = async (e) => {
    e.preventDefault();
    
    if (!selectedStock || !quantity || quantity <= 0) {
      return;
    }
    
    try {
      await buyStock(selectedStock.id, quantity, buyPrice);
      navigate('/portfolio');
    } catch (error) {
      console.error('Error buying stock:', error);
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
      <h1>Buy Stocks</h1>
      
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
              {filteredStocks.map((stock) => (
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
                    <div className="current">${parseFloat(stock.current_price).toFixed(2)}</div>
                  </div>
                </div>
              ))}
              
              {filteredStocks.length === 0 && (
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
                    <p><strong>Current Price:</strong> ${parseFloat(selectedStock.current_price).toFixed(2)}</p>
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
                  <div className="form-group">
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
                  
                  <div className="form-group">
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
                  
                  <div className="form-group">
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
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Buy Now'}
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