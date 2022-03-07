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
  showAvatar?: boolean;
};

const Navbar = ({
  sticky,
  showAvatar = true,
  className = ''
}: NavbarProps): JSX.Element => {
  const user = useUser();

  return (
    <PageHeader
      title={<Link to="/">CHDR - Inventory</Link>}
      className={classNames('navbar', {
        [className]: className,
        'navbar--sticky': sticky
      })}
      subTitle={user.isAdminOrSuper() ? 'Admin' : null}
      extra={[showAvatar && <ProfileAvatar key="avatar" />]}
    />
  );
};

export default Navbar;
