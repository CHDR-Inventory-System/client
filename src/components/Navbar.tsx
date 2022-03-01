import '../scss/navbar.scss';
import React from 'react';
import { PageHeader } from 'antd';
import { Link } from 'react-router-dom';
import ProfileAvatar from './ProfileAvatar';
import useUser from '../hooks/user';

type NavbarProps = {
  className?: string;
};

const Navbar = ({ className = '' }: NavbarProps): JSX.Element => {
  const user = useUser();

  return (
    <PageHeader
      title={<Link to="/">CHDR - Inventory</Link>}
      className={`navbar ${className}`}
      subTitle={
        user.state.role === 'Admin' || user.state.role === 'Super' ? 'Admin' : null
      }
      extra={[<ProfileAvatar key="avatar" />]}
    />
  );
};

export default Navbar;
