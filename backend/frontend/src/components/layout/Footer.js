// frontend/src/components/layout/Footer.js
import React from 'react';

const Footer = () => {
  return (
    <div className="footer">
      <p>&copy; {new Date().getFullYear()} Stock Market App. All rights reserved.</p>
    </div>
  );
};

export default Footer;