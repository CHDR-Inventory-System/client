import React, { useRef, useState, useEffect } from 'react';
import { Table, Card, Menu, Dropdown, Tooltip, Modal, Input, Button } from 'antd';
// Disabled so we don't have to install an extra library just
// to access this type. It's a dependency of Ant Design
// eslint-disable-next-line import/no-extraneous-dependencies
import type { MenuInfo } from 'rc-menu/lib/interface';
import Highlighter from 'react-highlight-words';
import { AiOutlineDown, AiOutlineUser, AiOutlineSearch } from 'react-icons/ai';
import { ColumnsType, ColumnType } from 'antd/lib/table';
import {
  FilterDropdownProps,
  FilterValue,
  SorterResult,
  TableCurrentDataSource,
  TablePaginationConfig
} from 'antd/lib/table/interface';
import type { User, UserRole } from '../../types/API';
import mockUsers from '../../assets/mocks/users.json';
import API from '../../util/API';

const mockDataSource: User[] = (mockUsers as User[]).map(user => ({
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
  const [rowCount, setRowCount] = useState(mockDataSource.length);
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

  /**
   * Used to show the current table count along with the
   * total number of items on the current page
   */
  const renderTableCount = (total: number, range: [number, number]) =>
    `${range[0]}-${range[1]} of ${total}`;

  /**
   * Because filtering the table doesn't actually change the size of
   * `tableData`, we'll need to manually keep track of how many rows
   * are in the table.
   */
  const onTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<User> | SorterResult<User>[],
    extra: TableCurrentDataSource<User>
  ) => {
    setRowCount(extra.currentDataSource.length);
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

  /**
   * Renders the menu that drops down when a user's role is clicked
   */
  const createRoleMenu = (user: User) => {
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
      title: 'NID',
      key: 'nid',
      dataIndex: 'nid',
      sorter: (first, second) => first.nid.localeCompare(second.nid),
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
      onFilter: (value, user) => user.role.indexOf(value as string) === 0,
      render: (text: string, row: User) => (
        <Tooltip placement="left" title="Change this user's role">
          <Dropdown overlay={createRoleMenu(row)} trigger={['click']}>
            <div>
              {text} <AiOutlineDown />
            </div>
          </Dropdown>
        </Tooltip>
      )
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
        onChange={onTableChange}
        dataSource={tableData}
        columns={columns}
        pagination={{
          showTotal: renderTableCount,
          showSizeChanger: true
        }}
        // Only allow the table to scroll if there's actually data in it
        scroll={{ x: rowCount > 0 ? true : undefined }}
      />
    </Card>
  );
};

export default UserTable;
