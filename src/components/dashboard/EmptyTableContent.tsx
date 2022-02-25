import '../../scss/empty-inventory-list.scss';
import React from 'react';

type EmptyTableContentProps = {
  icon: React.ReactNode;
  text: string;
};

const EmptyTableContent = ({ icon, text }: EmptyTableContentProps): JSX.Element => (
  <div className="empty-inventory-list">
    {icon}
    <p>{text}</p>
  </div>
);

export default EmptyTableContent;
