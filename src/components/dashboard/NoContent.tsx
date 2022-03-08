import '../../scss/no-content.scss';
import React from 'react';

type NoContentProps = {
  icon: React.ReactNode;
  text: string;
  className?: string;
};

const NoContent = ({ icon, text, className = '' }: NoContentProps): JSX.Element => (
  <div className={`no-content ${className}`}>
    {icon}
    <p>{text}</p>
  </div>
);

export default NoContent;
