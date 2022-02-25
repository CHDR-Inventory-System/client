import '../../scss/user-table.scss';
import React, { useRef, useState, useEffect } from 'react';
import {
  Table,
  Card,
  Menu,
  Dropdown,
  Tooltip,
  Modal,
  Input,
  Button,
  notification
} from 'antd';
// Disabled so we don't have to install an extra library just
// to access this type. It's a dependency of Ant Design
// eslint-disable-next-line import/no-extraneous-dependencies
import Highlighter from 'react-highlight-words';
import { AiOutlineDown, AiOutlineUser, AiOutlineSearch } from 'react-icons/ai';
import type { MenuInfo } from 'rc-menu/lib/interface';
import type { ColumnsType, ColumnType } from 'antd/lib/table';
import type { FilterDropdownProps } from 'antd/lib/table/interface';
import type { BaseUser, UserRole } from '../../types/API';
import useRegisteredUsers from '../../hooks/registeredUsers';
import useLoader from '../../hooks/loading';
import LoadingSpinner from '../LoadingSpinner';
import EmptyTableContent from './EmptyTableContent';

/**
 * Used to show the current table count along with the
 * total number of items on the current page
 */
const renderTableCount = (total: number, range: [number, number]) =>
  `${range[0]}-${range[1]} of ${total}`;

const USER_ROLES: UserRole[] = ['User', 'Admin', 'Super'];

const UserTable = (): JSX.Element => {
  const registeredUsers = useRegisteredUsers();
  const loader = useLoader();
  const searchInputRef = useRef<Input>(null);
  const [searchedText, setSearchedText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState<keyof BaseUser>();

  const updateUserRole = async (user: BaseUser, role: UserRole) => {
    const previousRole = user.role;
    loader.startLoading();

    try {
      await registeredUsers.updateRole(user.ID, role);
      notification.success({
        key: 'update-role-success',
        message: 'Role Changed',
        description: (
          <p>
            <b>{user.email}</b>&apos;s role was changed from <b>{previousRole}</b> to{' '}
            <b>{role}</b>
          </p>
        )
      });
    } catch {
      notification.error({
        key: 'update-role-error',
        message: "Couldn't Change Role",
        description:
          "An error occurred while changing this user's role, please try again."
      });
    }

    loader.stopLoading();
  };

  const handleSearch = (
    searchQuery: string,
    confirm: () => void,
    dataIndex: keyof BaseUser
  ) => {
    setSearchedColumn(dataIndex);
    setSearchedText(searchQuery);
    confirm();
  };

  const handleSearchReset = (confirm: () => void, clearFilters?: () => void) => {
    clearFilters?.();
    setSearchedText('');
    confirm();
  };

  const onMenuItemClick = (user: BaseUser, role: UserRole) => {
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
      onOk: () => updateUserRole(user, role),
      maskClosable: true,
      centered: true,
      icon: (
        <span className="anticon">
          <AiOutlineUser color="#000" size={24} />
        </span>
      )
    });
  };

  /**
   * Renders the menu that drops down when a user's role is clicked
   */
  const createRoleMenu = (user: BaseUser) => (
    <Menu>
      {USER_ROLES.map(role => (
        <Menu.Item
          key={role}
          disabled={user.role === role}
          onClick={(info: MenuInfo) => onMenuItemClick(user, info.key as UserRole)}
        >
          {role}
        </Menu.Item>
      ))}
    </Menu>
  );

  /**
   * Renders the filter search component that renders when the
   * search icon in the table's header is clicked
   */
  const createFilterDropdown = (
    dataIndex: keyof BaseUser,
    { setSelectedKeys, selectedKeys, confirm, clearFilters }: FilterDropdownProps
  ) => (
    <div className="table-filter-dropdown">
      <Input
        ref={searchInputRef}
        value={selectedKeys[0]}
        enterKeyHint="search"
        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
        onPressEnter={() => handleSearch(selectedKeys[0] as string, confirm, dataIndex)}
        placeholder={`Search ${dataIndex}`}
      />
      <div className="filter-actions">
        <Button type="ghost" onClick={() => handleSearchReset(confirm, clearFilters)}>
          Reset
        </Button>
        <Button
          type="primary"
          onClick={() => handleSearch(selectedKeys[0] as string, confirm, dataIndex)}
        >
          Search
        </Button>
      </div>
    </div>
  );

  const getColumnSearchProps = (dataIndex: keyof BaseUser): ColumnType<BaseUser> => ({
    filterDropdown: props => createFilterDropdown(dataIndex, { ...props }),
    onFilterDropdownVisibleChange: (visible: boolean) => {
      // Focus the input after the dropdown opens
      if (visible) {
        setTimeout(() => searchInputRef.current?.select(), 100);
      }
    },
    filterIcon: <AiOutlineSearch size="1.5em" />,
    onFilter: (value: string | number | boolean, record: BaseUser) =>
      record[dataIndex].toString().toLowerCase().includes(value.toString().toLowerCase()),
    render: (text: string) => {
      if (searchedColumn === dataIndex) {
        return (
          <Highlighter
            autoEscape
            searchWords={[searchedText]}
            textToHighlight={text ? text.toString() : ''}
          />
        );
      }

      return text;
    }
  });

  const columns: ColumnsType<BaseUser> = [
    {
      ellipsis: true,
      title: 'Name',
      key: 'fullName',
      dataIndex: 'fullName',
      ...getColumnSearchProps('fullName'),
      sorter: (first, second) => first.fullName.localeCompare(second.fullName)
    },
    {
      title: 'Email',
      key: 'email',
      dataIndex: 'email',
      sorter: (first, second) => first.email.localeCompare(second.email),
      ...getColumnSearchProps('email')
    },
    {
      title: 'Role',
      key: 'role',
      dataIndex: 'role',
      sorter: (first, second) => first.role.localeCompare(second.role),
      sortDirections: ['ascend', 'descend'],
      filters: USER_ROLES.map(role => ({
        value: role,
        text: role
      })),
      onFilter: (value, user) => user.role.indexOf(value as string) === 0,
      render: (text: string, row: BaseUser) => (
        <Tooltip placement="right" title="Change this user's role">
          <Dropdown
            overlay={createRoleMenu(row)}
            trigger={['click']}
            className="user-role-dropdown"
          >
            <div>
              {text} <AiOutlineDown />
            </div>
          </Dropdown>
        </Tooltip>
      )
    },
    {
      ellipsis: true,
      title: 'Date Registered',
      key: 'created',
      dataIndex: 'created',
      sorter: (first, second) => Date.parse(first.created) - Date.parse(second.created)
    }
  ];

  const loadUsers = async () => {
    loader.startLoading();

    try {
      await registeredUsers.init();
    } catch {
      notification.error({
        duration: 0,
        key: 'load-error',
        message: "Couldn't Load Users",
        description:
          'An error occurred while loading users. Refresh the page to try again.'
      });
    }

    loader.stopLoading();
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <Card bordered={false}>
      <Table
        rowKey="ID"
        className="user-table"
        loading={{
          spinning: loader.isLoading,
          indicator: <LoadingSpinner />
        }}
        dataSource={registeredUsers.state}
        locale={{
          emptyText: (
            <EmptyTableContent
              icon={<AiOutlineUser size={84} />}
              text="No users to display."
            />
          )
        }}
        columns={columns}
        pagination={{
          showTotal: renderTableCount,
          showSizeChanger: true
        }}
        scroll={{ x: true }}
      />
    </Card>
  );
};

export default UserTable;
