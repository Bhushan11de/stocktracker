// frontend/src/utils/helpers.js

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency symbol (default: '$')
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = '$', decimals = 2) => {
    if (amount === null || amount === undefined) {
      return `${currency}0.00`;
    }
    
    return `${currency}${parseFloat(amount).toFixed(decimals)}`;
  };
  
  /**
   * Format a number with commas as thousands separators
   * @param {number} number - The number to format
   * @returns {string} Formatted number with commas
   */
  export const formatNumberWithCommas = (number) => {
    if (number === null || number === undefined) {
      return '0';
    }
    
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  /**
   * Format percentage values
   * @param {number} value - The percentage value
   * @param {boolean} includeSymbol - Whether to include % symbol (default: true)
   * @param {number} decimals - Number of decimal places (default: 2)
   * @returns {string} Formatted percentage
   */
  export const formatPercentage = (value, includeSymbol = true, decimals = 2) => {
    if (value === null || value === undefined) {
      return includeSymbol ? '0.00%' : '0.00';
    }
    
    const formattedValue = parseFloat(value).toFixed(decimals);
    return includeSymbol ? `${formattedValue}%` : formattedValue;
  };
  
  /**
   * Format a date string to a more readable format
   * @param {string|Date} dateString - The date to format
   * @param {object} options - Intl.DateTimeFormat options
   * @returns {string} Formatted date string
   */
  export const formatDate = (dateString, options = {}) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    
    // Default options
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    };
    
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
  };
  
  /**
   * Format a date string to include time
   * @param {string|Date} dateString - The date to format
   * @returns {string} Formatted date and time string
   */
  export const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    
    return formatDate(dateString, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  /**
   * Calculate percentage change between two values
   * @param {number} currentValue - Current value
   * @param {number} previousValue - Previous value
   * @returns {number} Percentage change
   */
  export const calculatePercentageChange = (currentValue, previousValue) => {
    if (!previousValue || previousValue === 0) return 0;
    
    return ((currentValue - previousValue) / previousValue) * 100;
  };
  
  /**
   * Truncate text to a certain length and add ellipsis
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length before truncating
   * @returns {string} Truncated text
   */
  export const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    
    return `${text.substring(0, maxLength)}...`;
  };
  
  /**
   * Generate a random color for charts
   * @param {number} opacity - Color opacity (default: 0.6)
   * @returns {string} Random RGBA color string
   */
  export const getRandomColor = (opacity = 0.6) => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  
  /**
   * Generate an array of random colors for charts
   * @param {number} count - Number of colors to generate
   * @param {number} opacity - Color opacity (default: 0.6)
   * @returns {string[]} Array of random RGBA color strings
   */
  export const generateChartColors = (count, opacity = 0.6) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(getRandomColor(opacity));
    }
    return colors;
  };
  
  /**
   * Create chart data for a pie/doughnut chart
   * @param {Array} data - Array of data objects
   * @param {string} labelKey - Key for the label
   * @param {string} valueKey - Key for the value
   * @returns {object} Chart.js data object
   */
  export const createPieChartData = (data, labelKey, valueKey) => {
    const labels = data.map(item => item[labelKey]);
    const values = data.map(item => item[valueKey]);
    const backgroundColors = generateChartColors(data.length);
    const borderColors = backgroundColors.map(color => color.replace(opacity, 1));
    
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1
        }
      ]
    };
  };
  
  /**
   * Convert large numbers to abbreviated form
   * @param {number} num - Number to abbreviate
   * @param {number} digits - Decimal digits to show (default: 1)
   * @returns {string} Abbreviated number
   */
  export const abbreviateNumber = (num, digits = 1) => {
    if (num === null || num === undefined) return '0';
    
    const lookup = [
      { value: 1, symbol: '' },
      { value: 1e3, symbol: 'K' },
      { value: 1e6, symbol: 'M' },
      { value: 1e9, symbol: 'B' },
      { value: 1e12, symbol: 'T' }
    ];
    
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    const item = lookup
      .slice()
      .reverse()
      .find(function(item) {
        return num >= item.value;
      });
      
    return item
      ? (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol
      : '0';
  };
  
  /**
   * Debounce function to limit how often a function is called
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  export const debounce = (func, wait) => {
    let timeout;
    
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  
  /**
   * Sort an array of objects by a specific key
   * @param {Array} array - Array to sort
   * @param {string} key - Key to sort by
   * @param {boolean} ascending - Sort direction (default: true)
   * @returns {Array} Sorted array
   */
  export const sortArrayByKey = (array, key, ascending = true) => {
    return [...array].sort((a, b) => {
      if (a[key] < b[key]) return ascending ? -1 : 1;
      if (a[key] > b[key]) return ascending ? 1 : -1;
      return 0;
    });
  };
  
  /**
   * Filter an array of objects by search term across multiple keys
   * @param {Array} array - Array to filter
   * @param {string} searchTerm - Search term
   * @param {Array} keys - Keys to search in
   * @returns {Array} Filtered array
   */
  export const filterArrayBySearchTerm = (array, searchTerm, keys) => {
    if (!searchTerm) return array;
    
    const term = searchTerm.toLowerCase();
    return array.filter(item => {
      return keys.some(key => {
        const value = item[key];
        if (value === null || value === undefined) return false;
        return value.toString().toLowerCase().includes(term);
      });
    });
  };
  
  /**
   * Check if a string is a valid email format
   * @param {string} email - Email to validate
   * @returns {boolean} Whether email is valid
   */
  export const isValidEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };
  
  /**
   * Check if a password meets strength requirements
   * @param {string} password - Password to check
   * @returns {boolean} Whether password is strong enough
   */
  export const isStrongPassword = (password) => {
    // At least 8 characters, one uppercase, one lowercase, one number, one special character
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };
  
  /**
   * Calculate profit/loss percentage
   * @param {number} currentValue - Current value
   * @param {number} costBasis - Original cost
   * @returns {number} Profit/loss percentage
   */
  export const calculateProfitLossPercentage = (currentValue, costBasis) => {
    if (!costBasis || costBasis === 0) return 0;
    return ((currentValue - costBasis) / costBasis) * 100;
  };
  
  /**
   * Calculate portfolio value
   * @param {Array} holdings - Array of holdings
   * @returns {number} Total portfolio value
   */
  export const calculatePortfolioValue = (holdings) => {
    return holdings.reduce((total, holding) => {
      return total + (holding.quantity * holding.current_price);
    }, 0);
  };
  
  /**
   * Calculate total cost basis of portfolio
   * @param {Array} holdings - Array of holdings
   * @returns {number} Total cost basis
   */
  export const calculatePortfolioCostBasis = (holdings) => {
    return holdings.reduce((total, holding) => {
      return total + (holding.quantity * holding.average_buy_price);
    }, 0);
  };