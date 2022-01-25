/* eslint-disable */
import React from 'react';
import { Table, Card, Menu, Dropdown, Tooltip, Modal } from 'antd';
import { ColumnsType } from 'antd/lib/table';
// eslint-disable-next-line import/no-extraneous-dependencies
import { MenuInfo } from 'rc-menu/lib/interface';
import { AiOutlineDown, AiOutlineUser } from 'react-icons/ai';
import { User, UserRole } from '../../types/API';

const users: User[] = [
  {
    ID: 10,
    created: 'Sat, 22 Jan 2022 05:45:25 GMT',
    email: 'test1234@example.com',
    nid: 'test1234',
    role: 'User'
  },
  {
    ID: 11,
    created: 'Sat, 22 Jan 2022 05:45:25 GMT',
    email: 'test1234@example.com',
    nid: 'test5267',
    role: 'User'
  },
  {
    ID: 12,
    created: 'Sat, 22 Jan 2022 05:45:25 GMT',
    email: 'test1234@example.com',
    nid: 'test0000',
    role: 'User'
  },
  {
    ID: 13,
    created: 'Sat, 22 Jan 2022 05:45:25 GMT',
    email: 'test1234@example.com',
    nid: 'test1111',
    role: 'User'
  },
  {
    ID: 14,
    created: 'Sat, 22 Jan 2022 05:45:25 GMT',
    email: 'test1234@example.com',
    nid: 'test0593',
    role: 'User'
  },
  {
    ID: 15,
    created: 'Sat, 22 Jan 2022 05:45:25 GMT',
    email: 'test1234@example.com',
    nid: 'test5039',
    role: 'User'
  },
  {
    ID: 16,
    created: 'Sat, 22 Jan 2022 05:45:25 GMT',
    email: 'test1234@example.com',
    nid: 'test5039',
    role: 'User'
  },
  {
    ID: 17,
    created: 'Sat, 22 Jan 2022 05:45:25 GMT',
    email: 'test1234@example.com',
    nid: 'test1085',
    role: 'User'
  },
  {
    ID: 18,
    created: 'Sat, 22 Jan 2022 05:45:25 GMT',
    email: 'test1234@example.com',
    nid: 'test3049',
    role: 'User'
  },
  {
    ID: 19,
    created: 'Sat, 22 Jan 2022 05:45:25 GMT',
    email: 'test1234@example.com',
    nid: 'test5555',
    role: 'User'
  },
  {
    ID: 20,
    created: 'Sat, 22 Jan 2022 05:45:25 GMT',
    email: 'test1234@example.com',
    nid: 'test0583',
    role: 'User'
  },
  {
    ID: 21,
    created: 'Sat, 22 Jan 2022 05:45:25 GMT',
    email: 'test1234@example.com',
    nid: 'test5948',
    role: 'User'
  }
];

const dataSource = users.map(user => ({
  ...user,
  created: new Date(user.created).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }),
  key: user.ID
}));

const UserTable = (): JSX.Element => {
  const onMenuItemClick = (user: User, role: UserRole) => {
    Modal.confirm({
      title: "Are you sure you want to change this user's role?",
      content: (
        <p>
          This will change <b>{user.email}</b>&apos;s role from <b>{user.role}</b> to{' '}
          <b>{role}</b>.
        </p>
      ),
      okText: 'Change Role',
      cancelText: 'Cancel',
      onOk: () => console.log(`New role => ${role}`, user),
      maskClosable: true,
      centered: true,
      icon: (
        <span className="anticon">
          <AiOutlineUser color="#000" />
        </span>
      )
    });
  };

  const createRoleMenu = (user: User) => (
    <Menu>
      <Menu.Item
        key="User"
        disabled={user.role === 'User'}
        onClick={(info: MenuInfo) => onMenuItemClick(user, info.key as UserRole)}
      >
        User
      </Menu.Item>
      <Menu.Item
        key="Admin"
        disabled={user.role === 'Admin'}
        onClick={(info: MenuInfo) => onMenuItemClick(user, info.key as UserRole)}
      >
        Admin
      </Menu.Item>
      <Menu.Item
        key="Super"
        disabled={user.role === 'Super'}
        onClick={(info: MenuInfo) => onMenuItemClick(user, info.key as UserRole)}
      >
        Super
      </Menu.Item>
    </Menu>
  );

  const columns: ColumnsType<User> = [
    {
      title: 'Email',
      key: 'email',
      dataIndex: 'email'
    },
    {
      title: 'NID',
      key: 'nid',
      dataIndex: 'nid'
    },
    {
      title: 'Role',
      key: 'role',
      dataIndex: 'role',
      render: (text: string, row: User) => (
        <Tooltip placement="top" title="Change this user's role">
          <Dropdown overlay={createRoleMenu(row)} trigger={['click']}>
            <div>
              {text} <AiOutlineDown />
            </div>
          </Dropdown>
        </Tooltip>
      )
    },
    {
      title: 'Created',
      key: 'created',
      dataIndex: 'created'
    }
  ];

  return (
    <Card bordered={false}>
      <Table dataSource={dataSource} columns={columns} scroll={{ x: true }} />
    </Card>
  );
};

export default UserTable;
