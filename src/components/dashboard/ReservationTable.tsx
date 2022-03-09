import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Table, Card, Input, Button, notification, InputRef } from 'antd';
import Highlighter from 'react-highlight-words';
import { AiOutlineSearch, AiOutlineCalendar } from 'react-icons/ai';
import { ColumnsType, ColumnType } from 'antd/lib/table';
import { FilterDropdownProps } from 'antd/lib/table/interface';
// lodash is needed to filter values from the table since it has
// a nested data structure: https://stackoverflow.com/a/61742923/9124220
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import type { Reservation, ReservationStatus } from '../../types/API';
import useReservations from '../../hooks/reservation';
import useLoader from '../../hooks/loading';
import LoadingSpinner from '../LoadingSpinner';
import NoContent from './NoContent';
import useModal from '../../hooks/modal';
import UpdateReservationModal from '../modals/UpdateReservationModal';
import { formatDate } from '../../util/date';

const createDateSorter = (first: Reservation, second: Reservation) =>
  Date.parse(first.endDateTime) - Date.parse(second.endDateTime);

const STATUSES: ReservationStatus[] = [
  'Approved',
  'Cancelled',
  'Checked Out',
  'Denied',
  'Late',
  'Missed',
  'Pending',
  'Returned'
];

/**
 * Used to show the current table count along with the
 * total number of items on the current page
 */
const renderTableCount = (total: number, range: [number, number]) =>
  `${range[0]}-${range[1]} of ${total}`;

const ReservationTable = (): JSX.Element => {
  const reservations = useReservations();
  const loader = useLoader();
  const updateReservationModal = useModal();
  const [searchedText, setSearchedText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(
    null
  );
  const searchInputRef = useRef<InputRef>(null);

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

  const createFilterDropdown = (
    dataIndex: string,
    inputPlaceholder: string,
    { setSelectedKeys, selectedKeys, confirm, clearFilters }: FilterDropdownProps
  ) => (
    <div className="table-filter-dropdown">
      <Input
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

  // NOTE: The date tnd the status need to be rendered in spans because their values
  // won't update otherwise when a reservation is updated (not sure why this happens)
  const columns: ColumnsType<Reservation> = useMemo(
    () => [
      {
        ellipsis: true,
        title: 'Check Out',
        key: 'checkOutDate',
        dataIndex: 'startDateTime',
        className: 'cell-checkout-date',
        sorter: createDateSorter,
        render: date => <span>{date}</span>
      },
      {
        ellipsis: true,
        title: 'Return',
        key: 'return Date',
        dataIndex: 'endDateTime',
        className: 'cell-return-date',
        sorter: createDateSorter,
        render: date => <span>{date}</span>
      },
      {
        ellipsis: true,
        title: 'Status',
        key: 'status',
        dataIndex: 'status',
        filters: STATUSES.map(status => ({
          value: status,
          text: status
        })),
        className: 'cell-status',
        onFilter: (value, reservation) =>
          reservation.status.indexOf(value as string) === 0,
        sorter: (first, second) => first.status.localeCompare(second.status),
        render: status => <span>{status}</span>
      },
      {
        ellipsis: true,
        title: 'Name',
        key: 'userFullName',
        dataIndex: ['user', 'fullName'],
        sorter: (first, second) =>
          first.user.fullName.localeCompare(second.user.fullName),
        ...getColumnSearchProps('user.fullName', 'user name')
      },
      {
        title: 'Item Name',
        key: 'itemName',
        ellipsis: true,
        dataIndex: ['item', 'name'],
        sorter: (first, second) => first.item.name.localeCompare(second.item.name),
        ...getColumnSearchProps('item.name', 'item name')
      },
      {
        title: 'Email',
        key: 'email',
        dataIndex: ['user', 'email'],
        sorter: (first, second) => first.user.email.localeCompare(second.user.email),
        ...getColumnSearchProps('user.email', 'user email')
      },
      {
        title: 'Created',
        key: 'created',
        dataIndex: 'created',
        ellipsis: true,
        defaultSortOrder: 'descend',
        sorter: (first, second) => Date.parse(first.created) - Date.parse(second.created),
        render: (created: string) => <span>{formatDate(created)}</span>
      }
    ],
    [reservations.state]
  );

  const loadReservations = async () => {
    loader.startLoading();

    try {
      await reservations.initAllReservations();
    } catch {
      notification.error({
        key: 'reservation-load-error',
        message: "Couldn't Load Reservations",
        description:
          'An error occurred while loading reservations. Refresh the page to try again.'
      });
    }

    loader.stopLoading();
  };

  const onRowClick = (reservation: Reservation) => ({
    onClick: () => {
      setSelectedReservation(reservation);
      updateReservationModal.open();
    }
  });

  useEffect(() => {
    loadReservations();
  }, []);

  return (
    <Card bordered={false} className="reservation-table">
      {selectedReservation && (
        <UpdateReservationModal
          reservation={selectedReservation}
          visible={updateReservationModal.isVisible}
          onClose={updateReservationModal.close}
        />
      )}
      <Table
        rowKey="ID"
        loading={{
          spinning: loader.isLoading,
          indicator: <LoadingSpinner />
        }}
        locale={{
          emptyText: (
            <NoContent
              icon={<AiOutlineCalendar size={84} />}
              text="No reservations to display."
            />
          )
        }}
        onRow={onRowClick}
        dataSource={reservations.state}
        columns={columns}
        pagination={{
          showTotal: renderTableCount,
          showSizeChanger: true,
          pageSize: 50
        }}
        scroll={{ x: true }}
      />
    </Card>
  );
};

export default ReservationTable;
