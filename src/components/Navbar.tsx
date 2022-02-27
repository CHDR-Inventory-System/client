import '../scss/navbar.scss';
import React from 'react';
import { PageHeader } from 'antd';
import { Link } from 'react-router-dom';
import ProfileAvatar from './ProfileAvatar';

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
    title={<Link to="/">{title}</Link>}
    className={`navbar ${className}`}
    subTitle={subTitle}
    extra={[<ProfileAvatar key="avatar" />]}
  />
);

export default Navbar;
