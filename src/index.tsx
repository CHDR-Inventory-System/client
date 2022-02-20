import 'simplebar/dist/simplebar.min.css';
import 'antd/dist/antd.min.css';
import './scss/ant-overrides.scss';
import './scss/index.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import { message } from 'antd';
import App from './components/App';

if (module.hot) {
  module.hot.accept();
}

message.config({ maxCount: 1 });

ReactDOM.render(<App />, document.getElementById('app'));
