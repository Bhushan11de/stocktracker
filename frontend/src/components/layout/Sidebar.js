// frontend/src/components/layout/Sidebar.js
import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { FaHome, FaChartLine, FaListUl, FaMoneyBillWave, FaExchangeAlt, FaUsersCog, FaPlusCircle, FaDatabase } from 'react-icons/fa';

const Sidebar = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const isAdmin = user && user.role === 'admin';

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="sidebar">
      <div className="sidebar-menu">
        {/* User Links */}
        {!isAdmin && (
          <>
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaHome /> Dashboard
            </NavLink>
            <NavLink to="/portfolio" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaChartLine /> Portfolio
            </NavLink>
            <NavLink to="/watchlist" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaListUl /> Watchlist
            </NavLink>
            <NavLink to="/buy-stock" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaMoneyBillWave /> Buy Stocks
            </NavLink>
            <NavLink to="/sell-stock" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaExchangeAlt /> Sell Stocks
            </NavLink>
          </>
        )}

        {/* Admin Links */}
        {isAdmin && (
          <>
            <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaHome /> Admin Dashboard
            </NavLink>
            <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaUsersCog /> Manage Users
            </NavLink>
            <NavLink to="/admin/stocks" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaDatabase /> Manage Stocks
            </NavLink>
            <NavLink to="/admin/add-stock" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaPlusCircle /> Add New Stock
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;