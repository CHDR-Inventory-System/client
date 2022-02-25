import '../scss/loading-spinner.scss';
import React from 'react';
import { AiOutlineLoading } from 'react-icons/ai';

const LoadingSpinner = (): JSX.Element => (
  <div className="loading-spinner ant-spin-dot">
    <AiOutlineLoading size={52} className="loading-icon" />
  </div>
);

export default LoadingSpinner;
