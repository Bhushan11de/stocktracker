import React from 'react';

const GlobalLoadingSpinner = () => {
  return (
    <div className="global-loading-container">
      <div className="loading-spinner">
        <div className="spinner-inner"></div>
      </div>
      <p className="loading-text">Loading...</p>
    </div>
  );
};

export default GlobalLoadingSpinner;