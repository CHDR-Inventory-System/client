import 'antd/dist/antd.css';
import './scss/ant-overrides.scss';
import './scss/index.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

if (module.hot) {
  module.hot.accept();
}

ReactDOM.render(
  <HashRouter>
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  </HashRouter>,
  document.getElementById('app')
);
