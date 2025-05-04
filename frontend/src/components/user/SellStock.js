// frontend/src/components/user/SellStock.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StockContext } from '../../contexts/StockContext';

const SellStock = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const {
    portfolio,
    getUserPortfolio,
    sellStock,
    loading
  } = useContext(StockContext);
  
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [sellPrice, setSellPrice] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [maxQuantity, setMaxQuantity] = useState(0);
  
  // Fetch portfolio on mount
  useEffect(() => {
    const fetchPortfolio = async () => {
      await getUserPortfolio();
    };
    
    fetchPortfolio();
  }, [getUserPortfolio]);
  
  // Make sure portfolio is an array
  const portfolioItems = Array.isArray(portfolio) ? portfolio : [];
  
  // Set selected stock if ID is provided in URL
  useEffect(() => {
    if (id && portfolioItems.length > 0) {
      const stock = portfolioItems.find(item => 
        (item.stock_id && item.stock_id === parseInt(id)) || 
        (item.id && item.id === parseInt(id))
      );
      if (stock) {
        handleSelectStock(stock);
      }
    }
  }, [id, portfolioItems]);
  
  // Update total amount when quantity or price changes
  useEffect(() => {
    if (sellPrice && quantity) {
      setTotalAmount(sellPrice * quantity);
    }
  }, [sellPrice, quantity]);
  
  const handleSelectStock = (stock) => {
    setSelectedStock(stock);
    setSellPrice(stock.current_price || 0);
    setMaxQuantity(stock.quantity || 0);
    setQuantity(1);
    setTotalAmount((stock.current_price || 0) * 1);
  };
  
  const handleSellStock = async (e) => {
    e.preventDefault();
    
    if (!selectedStock || !quantity || quantity <= 0 || quantity > maxQuantity) {
      return;
    }
    
    try {
      // Use either stock_id or id, whichever is available
      const stockId = selectedStock.stock_id || selectedStock.id;
      await sellStock(stockId, quantity, sellPrice);
      navigate('/portfolio');
    } catch (error) {
      console.error('Error selling stock:', error);
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
      <h1>Sell Stocks</h1>
      
      <div className="row">
        {/* Stock List */}
        <div className="col-md-5">
          <div className="card" style={{ height: '600px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <h2>My Holdings</h2>
            </div>
            
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {portfolioItems.length > 0 ? (
                portfolioItems.map((stock) => (
                  <div 
                    key={stock.stock_id || stock.id || Math.random().toString()} 
                    className={`stock-card ${
                      selectedStock && 
                      (selectedStock.stock_id === stock.stock_id || 
                       selectedStock.id === stock.id) ? 'selected' : ''
                    }`}
                    onClick={() => handleSelectStock(stock)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="stock-info">
                      <h3>
                        <span className="symbol">{stock.symbol || 'Unknown'}</span>
                      </h3>
                      <div className="name">{stock.name || 'Unknown'}</div>
                      <div className="quantity">Quantity: {stock.quantity || 0}</div>
                    </div>
                    <div className="stock-price">
                      <div className="current">${parseFloat(stock.current_price || 0).toFixed(2)}</div>
                      <div className="avg-price">Avg: ${parseFloat(stock.average_buy_price || 0).toFixed(2)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-4">
                  <p>You don't have any stocks in your portfolio.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Sell Form */}
        <div className="col-md-7">
          <div className="card">
            <div className="card-header">
              <h2>Sell Stock</h2>
            </div>
            
            {selectedStock ? (
              <div className="card-body">
                <div className="selected-stock-info" style={{ marginBottom: '20px' }}>
                  <h3>
                    {selectedStock.symbol || 'Unknown'} - {selectedStock.name || 'Unknown'}
                  </h3>
                  <div className="stock-price-info">
                    <p><strong>Current Price:</strong> ${parseFloat(selectedStock.current_price || 0).toFixed(2)}</p>
                    <p><strong>Average Buy Price:</strong> ${parseFloat(selectedStock.average_buy_price || 0).toFixed(2)}</p>
                    <p><strong>Shares Owned:</strong> {selectedStock.quantity || 0}</p>
                    <p>
                      <strong>Current Value:</strong> ${((selectedStock.quantity || 0) * (selectedStock.current_price || 0)).toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <form onSubmit={handleSellStock}>
                  <div className="form-group">
                    <label htmlFor="quantity">Quantity to Sell</label>
                    <input
                      type="number"
                      id="quantity"
                      className="form-control"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.min(maxQuantity, Math.max(1, parseInt(e.target.value) || 0)))}
                      min="1"
                      max={maxQuantity}
                      required
                    />
                    <small className="text-muted">Maximum: {maxQuantity}</small>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="sellPrice">Price per Share ($)</label>
                    <input
                      type="number"
                      id="sellPrice"
                      className="form-control"
                      value={sellPrice}
                      onChange={(e) => setSellPrice(parseFloat(e.target.value) || 0)}
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
                  
                  <div className="potential-profit-loss">
                    {(() => {
                      const avgPrice = selectedStock.average_buy_price || 0;
                      const cost = quantity * avgPrice;
                      const revenue = quantity * sellPrice;
                      const profitLoss = revenue - cost;
                      const profitLossPercentage = cost > 0 ? (profitLoss / cost) * 100 : 0;
                      
                      return (
                        <div className={`alert ${profitLoss >= 0 ? 'alert-success' : 'alert-danger'}`}>
                          <strong>Potential {profitLoss >= 0 ? 'Profit' : 'Loss'}:</strong> ${Math.abs(profitLoss).toFixed(2)} (
                          {profitLoss >= 0 ? '+' : ''}
                          {profitLossPercentage.toFixed(2)}%)
                        </div>
                      );
                    })()}
                  </div>
                  
                  <button
                    type="submit"
                    className="btn btn-danger"
                    style={{ width: '100%', marginTop: '20px' }}
                    disabled={loading || quantity <= 0 || quantity > maxQuantity}
                  >
                    {loading ? 'Processing...' : 'Sell Now'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="card-body text-center">
                <p>Select a stock from your portfolio to sell.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellStock;