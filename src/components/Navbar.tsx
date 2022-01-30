import '../scss/navbar.scss';
import React from 'react';
import { Avatar, PageHeader } from 'antd';

type NavbarProps = {
  title?: string;
  className?: string;
  subTitle?: string;
};

const Navbar = ({
  title = 'CHDR - Inventory',
  className = '',
  subTitle
}: NavbarProps): JSX.Element => (
  <PageHeader
    title={title}
    className={`navbar ${className}`}
    subTitle={subTitle}
    extra={[<Avatar key="avatar">JS</Avatar>]}
  />
);

export default Navbar;
