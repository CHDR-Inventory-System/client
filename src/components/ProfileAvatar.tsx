import '../scss/profile-avatar.scss';
import React from 'react';
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
import useModal from '../hooks/modal';

const ProfileAvatar = (): JSX.Element => {
  const accountModal = useModal();
  const navigate = useNavigate();
  const user = useUser();
  const userInitials = user.state.firstName[0] + user.state.lastName[0];

  const logout = async () => {
    await user.logout();
    Modal.destroyAll();
    navigate('/auth', { replace: true });
  };

  const confirmLogout = () => {
    Modal.confirm({
      title: 'Log Out',
      content: 'Are you sure you want to log out?',
      okText: 'Log Out',
      onOk: () => logout()
    });
  };

  const goToDashboard = () => navigate('/dashboard');
  const goToReservationCalendar = () => navigate('/calendar');
  const goToReservations = () => navigate('/reservations');

  const menu = (
    <Menu className="profile-avatar-dropdown-menu">
      <p className="menu-extra-message">Signed in as {user.state.email}</p>
      <Divider className="menu-divider" />
      <Menu.Item
        key="edit-account"
        icon={<AiOutlineEdit size={18} />}
        onClick={accountModal.open}
      >
        Edit Account
      </Menu.Item>
      <Menu.Item
        key="reservations"
        className="menu-item-mobile"
        onClick={goToReservations}
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
      <EditAccountModal visible={accountModal.isVisible} onClose={accountModal.close} />
    </>
  );
};

export default ProfileAvatar;
