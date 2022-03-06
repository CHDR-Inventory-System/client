import '../scss/navbar.scss';
import React from 'react';
import { PageHeader } from 'antd';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import ProfileAvatar from './ProfileAvatar';
import useUser from '../hooks/user';

type NavbarProps = {
  className?: string;
  sticky?: boolean;
};

const Navbar = ({ sticky, className = '' }: NavbarProps): JSX.Element => {
  const user = useUser();

  return (
    <PageHeader
      title={<Link to="/">CHDR - Inventory</Link>}
      className={classNames({
        navbar: true,
        [className]: className,
        'navbar--sticky': sticky
      })}
      subTitle={
        user.state.role === 'Admin' || user.state.role === 'Super' ? 'Admin' : null
      }
      extra={[<ProfileAvatar key="avatar" />]}
    />
  );
};

export default Navbar;
