import '../../scss/reservation-table.scss';
import '../../scss/inventory-table.scss';
import React, { useRef, useState, useEffect } from 'react';
import { Table, Card, Input, Button, Menu, Modal, Tooltip, Dropdown } from 'antd';
// Disabled so we don't have to install an extra library just
// to access this type. It's a dependency of Ant Design
// eslint-disable-next-line import/no-extraneous-dependencies
import type { MenuInfo } from 'rc-menu/lib/interface';
import Highlighter from 'react-highlight-words';
import { AiOutlineDown, AiOutlineWarning, AiOutlineSearch } from 'react-icons/ai';
import { ColumnsType, ColumnType } from 'antd/lib/table';
import { FilterDropdownProps } from 'antd/lib/table/interface';
// lodash is needed to filter values from the table since it has
// a nested data structure: https://stackoverflow.com/a/61742923/9124220
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import mockReservations from '../../assets/mocks/reservations.json';
import API from '../../util/API';
import type { Reservation, ReservationStatus } from '../../types/API';

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });

const ReservationTable = (): JSX.Element => {
  const [searchedText, setSearchedText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [tableData, setTableData] = useState(mockReservations as Reservation[]);
  const searchInputRef = useRef<Input>();

  const updateReservationStatus = (
    reservation: Reservation,
    status: ReservationStatus
  ) => {
    // eslint-disable-next-line no-console
    console.log(`New reservation status => ${status}`, reservation);
  };

  const handleSearch = (searchQuery: string, confirm: () => void, dataIndex: string) => {
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

  const onMenuItemClick = (reservation: Reservation, status: ReservationStatus) => {
    Modal.confirm({
      title: "Are you sure you want to change this reservation's status?",
      content: (
        <p>
          This will update the status of <b>{reservation.item.name}</b> from{' '}
          <b>{reservation.status}</b> to <b>{status}</b>.
        </p>
      ),
      okText: 'Update Status',
      cancelText: 'Cancel',
      onOk: () => updateReservationStatus(reservation, status),
      maskClosable: true,
      centered: true,
      icon: (
        <span className="anticon">
          <AiOutlineWarning color="#000" size="1.2em" />
        </span>
      )
    });
  };

  // Renders the menu that drops down when a reservation's status
  const createStatusMenu = (reservation: Reservation) => {
    const statuses: ReservationStatus[] = [
      'Approved',
      'Checked Out',
      'Denied',
      'Late',
      'Missed',
      'Pending',
      'Returned'
    ];

    return (
      <Menu>
        {statuses.map(status => (
          <Menu.Item
            key={status}
            disabled={reservation.status === status}
            onClick={(info: MenuInfo) => {
              onMenuItemClick(reservation, info.key as ReservationStatus);
            }}
          >
            {status}
          </Menu.Item>
        ))}
      </Menu>
    );
  };

  const createFilterDropdown = (
    dataIndex: string,
    inputPlaceholder: string,
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
        placeholder={`Search ${inputPlaceholder}`}
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

  /**
   * Because the data in this table is nested, we'll need to use the `lodash`
   * {@link get} function to get the path of the nested object to filter
   * that column
   *
   * @see https://lodash.com/docs/4.17.15#get
   * @param dataIndex - The path of the object's value (using lodash's `get` syntax)
   * @param inputPlaceholder - The text of the dropdown input's placeholder
   */
  const getColumnSearchProps = (
    dataIndex: string,
    inputPlaceholder: string
  ): ColumnType<Reservation> => ({
    filterDropdown: props =>
      createFilterDropdown(dataIndex, inputPlaceholder, { ...props }),
    onFilterDropdownVisibleChange: (visible: boolean) => {
      // Focus the input after the dropdown opens
      if (visible) {
        setTimeout(() => searchInputRef.current?.select(), 100);
      }
    },
    filterIcon: <AiOutlineSearch size="1.5em" />,
    onFilter: (value: string | number | boolean, record: Reservation) =>
      get(record, dataIndex)
        ?.toString()
        .toLowerCase()
        .includes(value.toString().toLowerCase()) || false,
    render: (text: string) => {
      if (isEqual(searchedColumn, dataIndex)) {
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

  const renderDate = (value: string) => <span>{formatDate(value)}</span>;
  const createDateSorter = (first: Reservation, second: Reservation) => {
    const firstDate = +new Date(first.endDateTime);
    const secondDate = +new Date(second.endDateTime);

    return firstDate - secondDate;
  };

  const columns: ColumnsType<Reservation> = [
    {
      title: 'Item Name',
      key: 'itemName',
      dataIndex: ['item', 'name'],
      sorter: (first, second) => first.item.name.localeCompare(second.item.name),
      ...getColumnSearchProps('item.name', 'item name')
    },
    {
      title: 'Name',
      key: 'userFullName',
      dataIndex: ['user', 'fullName'],
      sorter: (first, second) => first.user.fullName.localeCompare(second.user.fullName),
      ...getColumnSearchProps('user.fullName', 'user name')
    },
    {
      title: 'Email',
      key: 'email',
      dataIndex: ['user', 'email'],
      sorter: (first, second) => first.user.email.localeCompare(second.user.email),
      ...getColumnSearchProps('user.email', 'user email')
    },
    {
      title: 'NID',
      key: 'nid',
      dataIndex: ['user', 'nid'],
      sorter: (first, second) => first.user.nid.localeCompare(second.user.nid),
      ...getColumnSearchProps('user.nid', 'user NID')
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      filters: [
        {
          value: 'Approved',
          text: 'Approved'
        },
        {
          value: 'Checked Out',
          text: 'Checked Out'
        },
        {
          value: 'Denied',
          text: 'Denied'
        },
        {
          value: 'Late',
          text: 'Late'
        },
        {
          value: 'Missed',
          text: 'Missed'
        },
        {
          value: 'Pending',
          text: 'Pending'
        },
        {
          value: 'Returned',
          text: 'Returned'
        }
      ],
      className: 'cell-status',
      onFilter: (value, reservation) => reservation.status.indexOf(value as string) === 0,
      sorter: (first, second) => first.status.localeCompare(second.status),
      render: (text: string, row: Reservation) => (
        <Tooltip placement="left" title="Change this item's status">
          <Dropdown overlay={createStatusMenu(row)} trigger={['click']}>
            <div>
              {text} <AiOutlineDown />
            </div>
          </Dropdown>
        </Tooltip>
      )
    },
    {
      title: 'Check Out',
      key: 'checkOutDate',
      dataIndex: 'startDateTime',
      className: 'cell-checkout-date',
      render: renderDate,
      sorter: createDateSorter
    },
    {
      title: 'Return',
      key: 'return Date',
      dataIndex: 'endDateTime',
      className: 'cell-return-date',
      render: renderDate,
      sorter: createDateSorter
    }
  ];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadReservations = async () => {
    setLoading(true);

    try {
      const reservations = await API.getAllReservations();
      setTableData(reservations);
    } catch (err) {
      // TODO: Catch errors here!!!
    }

    setLoading(false);
  };

  useEffect(() => {
    // loadReservations();
  }, []);

  return (
    <Card bordered={false} className="reservation-table">
      <Table
        rowKey="ID"
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

export default ReservationTable;
