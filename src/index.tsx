import 'antd/dist/antd.css';
import './scss/ant-overrides.scss';
import './scss/index.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth';

if (module.hot) {
  module.hot.accept();
}

ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/auth" element={<Auth />} />
    </Routes>
  </BrowserRouter>,
  document.getElementById('app')
);
