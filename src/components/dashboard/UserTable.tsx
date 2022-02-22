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
import type { BaseUser, UserRole } from '../../types/API';
import mockUsers from '../../assets/mocks/users.json';
import API from '../../util/API';

/**
 * Used to show the current table count along with the
 * total number of items on the current page
 */
const renderTableCount = (total: number, range: [number, number]) =>
  `${range[0]}-${range[1]} of ${total}`;

const mockDataSource: BaseUser[] = (mockUsers as BaseUser[]).map(user => ({
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
  const [searchedColumn, setSearchedColumn] = useState<keyof BaseUser>();
  const [isLoading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<BaseUser[]>(mockDataSource);
  const searchInputRef = useRef<Input>(null);

  const updateUserRole = (user: BaseUser, role: UserRole) => {
    // eslint-disable-next-line no-console
    console.log(`New role => ${role}`, user);
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
          <AiOutlineUser color="#000" />
        </span>
      )
    });
  };

  /**
   * Renders the menu that drops down when a user's role is clicked
   */
  const createRoleMenu = (user: BaseUser) => {
    const userRoles: UserRole[] = ['User', 'Admin', 'Super'];

    return (
      <Menu>
        {userRoles.map(role => (
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
  };

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
            searchWords={[searchedText]}
            autoEscape
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
      onFilter: (value, user) => user.role.indexOf(value as string) === 0,
      render: (text: string, row: BaseUser) => (
        <Tooltip placement="left" title="Change this user's role">
          <Dropdown overlay={createRoleMenu(row)} trigger={['click']}>
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
