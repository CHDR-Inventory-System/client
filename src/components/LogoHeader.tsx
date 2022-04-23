import '../scss/logo-header.scss';
import React from 'react';
import logo from '../assets/images/logo.png';

const LogoHeader = (): JSX.Element => (
  <header className="logo-header">
    <img src={logo} alt="UCF CHDR logo" />
    <div className="logo-container">
      <h1>CHDR Inventory</h1>
      <p>Center for Humanities and Digital Research</p>
    </div>
  </header>
);

export default LogoHeader;
