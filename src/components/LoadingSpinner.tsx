import '../scss/loading-spinner.scss';
import React from 'react';
import { AiOutlineLoading } from 'react-icons/ai';

type LoadingSpinnerProps = {
  text?: string;
};

const LoadingSpinner = ({ text }: LoadingSpinnerProps): JSX.Element => (
  <div className="loading-spinner ant-spin-dot">
    <AiOutlineLoading size={52} className="loading-icon" />
    {text && <p className="loading-message">{text}</p>}
  </div>
);

export default LoadingSpinner;
