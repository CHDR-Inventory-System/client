import '../scss/profile-avatar.scss';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Divider, Dropdown, Menu, Modal } from 'antd';
import {
  AiOutlineCalendar,
  AiOutlineDashboard,
  AiOutlineEdit,
  AiOutlineLogout
} from 'react-icons/ai';
import useUser from '../hooks/user';

const ProfileAvatar = (): JSX.Element => {
  const navigate = useNavigate();
  const user = useUser();
  const userInitials = useMemo(() => {
    if (!user.state.fullName) {
      return '';
    }

    const [firstName, lastName] = user.state.fullName.split(' ');

    return firstName[0] + lastName[0];
  }, [user]);

  const logout = () => {
    user.logout();
    navigate('/auth', { replace: true });
  };

  const confirmLogout = () => {
    Modal.confirm({
      title: 'Log Out',
      content: 'Are you sure you want to log out?',
      okText: 'Log Out',
      onOk: () => {
        setTimeout(logout, 500);
      }
    });
  };

  const goToDashboard = () => navigate('/dashboard');

  const menu = (
    <Menu className="profile-avatar-dropdown-menu">
      <p className="menu-extra-message">Signed in as {user.state.email}</p>
      <Divider className="menu-divider" />
      <Menu.Item key="edit-account" icon={<AiOutlineEdit size={18} />}>
        Edit Account
      </Menu.Item>
      <Menu.Item key="reservations" icon={<AiOutlineCalendar size={18} />}>
        My Reservations
      </Menu.Item>
      {user.state.role === 'Admin' ||
        (user.state.role === 'Super' && (
          <Menu.Item
            key="dashboard"
            icon={<AiOutlineDashboard size={18} />}
            onClick={goToDashboard}
          >
            Dashboard
          </Menu.Item>
        ))}
      <Menu.Item
        key="logout"
        icon={<AiOutlineLogout size={18} />}
        onClick={confirmLogout}
      >
        Log out
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <Avatar>{userInitials}</Avatar>
    </Dropdown>
  );
};

export default ProfileAvatar;
