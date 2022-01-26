import React, { useRef, useState, useEffect } from 'react';
import { Table, Card, Menu, Dropdown, Tooltip, Modal, Input, Button } from 'antd';
// Disabled so we don't have to install an extra library just
// to access this type. It's a dependency of Ant Design
// eslint-disable-next-line import/no-extraneous-dependencies
import type { MenuInfo } from 'rc-menu/lib/interface';
import Highlighter from 'react-highlight-words';
import { AiOutlineDown, AiOutlineUser, AiOutlineSearch } from 'react-icons/ai';
import { ColumnsType, ColumnType } from 'antd/lib/table';
import { FilterDropdownProps } from 'antd/lib/table/interface';
import type { User, UserRole } from '../../types/API';
import { mockUsers } from '../../util/mock-data';
import API from '../../util/API';

const mockDataSource: User[] = mockUsers.map(user => ({
  ...user,
  created: new Date(user.created).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }),
  key: user.ID
}));

const UserTable = (): JSX.Element => {
  const [searchedText, setSearchedText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState<keyof User>();
  const [isLoading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<User[]>(mockDataSource);
  const searchInputRef = useRef<Input>();

  const updateUserRole = (user: User, role: UserRole) => {
    // eslint-disable-next-line no-console
    console.log(`New role => ${role}`, user);
  };

  const handleSearch = (
    searchQuery: string,
    confirm: () => void,
    dataIndex: keyof User
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
      onOk: () => updateUserRole(user, role),
      maskClosable: true,
      centered: true,
      icon: (
        <span className="anticon">
          <AiOutlineUser color="#000" />
        </span>
      )
    });
  };

  // Renders the menu that drops down when a user's role is clicked
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

  // Renders the filter search component that renders when the search icon in
  // the table's header is clicked
  const createFilterDropdown = (
    dataIndex: keyof User,
    { setSelectedKeys, selectedKeys, confirm, clearFilters }: FilterDropdownProps
  ) => (
    <div className="table-filter-dropdown">
      <Input
        // Disabled since ant's input refs don't play nicely
        // with TypeScript's ref definition
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ref={searchInputRef}
        value={selectedKeys[0]}
        enterKeyHint="search"
        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
        onPressEnter={() => handleSearch(selectedKeys[0] as string, confirm, dataIndex)}
        placeholder={`Search ${dataIndex}`}
      />
      <div className="filter-actions">
        <Button
          type="primary"
          onClick={() => handleSearch(selectedKeys[0] as string, confirm, dataIndex)}
        >
          Search
        </Button>
        <Button type="ghost" onClick={() => handleSearchReset(confirm, clearFilters)}>
          Reset
        </Button>
      </div>
    </div>
  );

  const getColumnSearchProps = (dataIndex: keyof User): ColumnType<User> => ({
    filterDropdown: props => createFilterDropdown(dataIndex, { ...props }),
    onFilterDropdownVisibleChange: (visible: boolean) => {
      // Focus the input after the dropdown opens
      if (visible) {
        setTimeout(() => searchInputRef.current?.select(), 100);
      }
    },
    filterIcon: <AiOutlineSearch size="1.5em" />,
    onFilter: (value: string | number | boolean, record: User) =>
      record[dataIndex].toString().toLowerCase().includes(value.toString().toLowerCase()),
    render: (text: string) => {
      if (searchedColumn === dataIndex) {
        return (
          <Highlighter
            searchWords={[searchedText]}
            autoEscape
            textToHighlight={text ? text.toString() : ''}
          />
        );
      }

      return text;
    }
  });

  const columns: ColumnsType<User> = [
    {
      title: 'Email',
      key: 'email',
      dataIndex: 'email',
      sorter: (first, second) => first.role.localeCompare(second.role),
      ...getColumnSearchProps('email')
    },
    {
      title: 'NID',
      key: 'nid',
      dataIndex: 'nid',
      sorter: (first, second) => first.role.localeCompare(second.role),
      ...getColumnSearchProps('nid')
    },
    {
      title: 'Role',
      key: 'role',
      dataIndex: 'role',
      sorter: (first, second) => first.role.localeCompare(second.role),
      sortDirections: ['ascend', 'descend'],
      filters: [
        {
          value: 'User',
          text: 'User'
        },
        {
          value: 'Admin',
          text: 'Admin'
        },
        {
          value: 'Super',
          text: 'Super'
        }
      ],
      onFilter: (value, record) => record.role.indexOf(value as string) === 0,
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
      dataIndex: 'created',
      sorter: (first, second) =>
        new Date(first.created).getTime() - new Date(second.created).getTime()
    }
  ];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadUsers = async () => {
    setLoading(true);

    try {
      const allUsers = await API.getAllUsers();
      const tableDataSource = allUsers.map(user => ({
        ...user,
        created: new Date(user.created).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        key: user.ID
      }));

      setTableData(tableDataSource);
    } catch (err) {
      // TODO: Catch errors here!!!
    }

    setLoading(false);
  };

  useEffect(() => {
    // loadUsers();
  }, []);

  return (
    <Card bordered={false}>
      <Table
        loading={isLoading}
        dataSource={tableData}
        columns={columns}
        scroll={{
          // Only allow the table to scroll if there's actually data in it
          x: tableData.length > 0 ? true : undefined
        }}
      />
    </Card>
  );
};

export default UserTable;
