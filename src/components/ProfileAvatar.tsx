import '../scss/profile-avatar.scss';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Divider, Dropdown, Menu, Modal } from 'antd';
import {
  AiOutlineCalendar,
  AiOutlineDashboard,
  AiOutlineEdit,
  AiOutlineLogout
} from 'react-icons/ai';
import { BsCalendarWeek } from 'react-icons/bs';
import useUser from '../hooks/user';
import EditAccountModal from './modals/EditAccountModal';

const ProfileAvatar = (): JSX.Element => {
  const [isAccountModalShowing, setAccountModalShowing] = useState(false);
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
  const goToReservationCalendar = () => navigate('/calendar');

  const menu = (
    <Menu className="profile-avatar-dropdown-menu">
      <p className="menu-extra-message">Signed in as {user.state.email}</p>
      <Divider className="menu-divider" />
      <Menu.Item
        key="edit-account"
        icon={<AiOutlineEdit size={18} />}
        onClick={() => setAccountModalShowing(true)}
      >
        Edit Account
      </Menu.Item>
      <Menu.Item
        key="reservations"
        className="menu-item-mobile"
        icon={<AiOutlineCalendar size={18} />}
      >
        My Reservations
      </Menu.Item>
      {user.isAdminOrSuper() && (
        <Menu.Item
          className="menu-item-mobile"
          key="dashboard"
          icon={<AiOutlineDashboard size={18} />}
          onClick={goToDashboard}
        >
          Admin Dashboard
        </Menu.Item>
      )}
      {user.isAdminOrSuper() && (
        <Menu.Item
          className="menu-item-mobile"
          key="calendar"
          icon={<BsCalendarWeek size={16} />}
          onClick={goToReservationCalendar}
        >
          Reservation Calendar
        </Menu.Item>
      )}
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
    <>
      <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
        <Avatar>{userInitials}</Avatar>
      </Dropdown>
      <EditAccountModal
        visible={isAccountModalShowing}
        onClose={() => setAccountModalShowing(false)}
      />
    </>
  );
};

export default ProfileAvatar;
