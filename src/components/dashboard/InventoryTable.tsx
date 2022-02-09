import '../../scss/inventory-table.scss';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Table, Card, Input, Button } from 'antd';
import Highlighter from 'react-highlight-words';
import { AiOutlineSearch } from 'react-icons/ai';
import { ColumnsType, ColumnType } from 'antd/lib/table';
import classNames from 'classnames';
import {
  FilterDropdownProps,
  FilterValue,
  SorterResult,
  TableCurrentDataSource,
  TablePaginationConfig
} from 'antd/lib/table/interface';
import type { Item } from '../../types/API';
import mockInventory from '../../assets/mocks/inventory.json';
import API from '../../util/API';
import InventoryItemModal from '../modals/InventoryItemModal';
import useLoader from '../../hooks/loading';

const InventoryTable = (): JSX.Element => {
  const [searchedText, setSearchedText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState<keyof Item>();
  const [tableData, setTableData] = useState<Item[]>(mockInventory as Item[]);
  const [rowCount, setRowCount] = useState(mockInventory.length);
  const [isInventoryModalVisible, setInventoryModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item>({} as Item);
  const loader = useLoader();
  const searchInputRef = useRef<Input>(null);

  const handleSearch = (
    searchQuery: string,
    confirm: () => void,
    dataIndex: keyof Item
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
    sorter: SorterResult<Item> | SorterResult<Item>[],
    extra: TableCurrentDataSource<Item>
  ) => {
    setRowCount(extra.currentDataSource.length);
  };

  /**
   * Renders the filter search component that renders when the
   * search icon in the table's header is clicked
   */
  const createFilterDropdown = (
    dataIndex: keyof Item,
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

  const getColumnSearchProps = (dataIndex: keyof Item): ColumnType<Item> => ({
    filterDropdown: props => createFilterDropdown(dataIndex, { ...props }),
    onFilterDropdownVisibleChange: (visible: boolean) => {
      // Focus the input after the dropdown opens
      if (visible) {
        setTimeout(() => searchInputRef.current?.select(), 100);
      }
    },
    filterIcon: <AiOutlineSearch size="1.5em" />,
    onFilter: (value: string | number | boolean, record: Item) =>
      !!record[dataIndex]
        ?.toString()
        .toLowerCase()
        .includes(value.toString().toLowerCase()),
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

  const columns: ColumnsType<Item> = [
    {
      title: 'Name',
      key: 'name',
      dataIndex: 'name',
      sorter: (first, second) => first.name.localeCompare(second.name),
      ...getColumnSearchProps('name')
    },
    {
      title: 'Barcode',
      key: 'barcode',
      dataIndex: 'barcode',
      sorter: (first, second) => first.barcode.localeCompare(second.barcode),
      ...getColumnSearchProps('barcode')
    },
    {
      title: 'Type',
      key: 'type',
      dataIndex: 'type',
      sorter: (first, second) => first.type.localeCompare(second.type),
      ...getColumnSearchProps('type')
    },
    {
      title: 'Quantity',
      key: 'quantity',
      dataIndex: 'quantity',
      sorter: (first, second) => first.quantity - second.quantity
    },
    {
      title: 'Location',
      key: 'location',
      dataIndex: 'location',
      ...getColumnSearchProps('location'),
      sorter: (first, second) => first.location.localeCompare(second.location)
    },
    {
      title: 'Status',
      key: 'available',
      dataIndex: 'available',
      filters: [
        {
          value: true,
          text: 'Available'
        },
        {
          value: false,
          text: 'Unavailable'
        }
      ],
      sorter: (first, second) => +first.available - +second.available,
      onFilter: (value, item) => item.available === (value as boolean),
      className: 'row-status',
      render: (value: boolean) => <span>{value ? 'Available' : 'Unavailable'}</span>
    }
  ];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadInventory = async () => {
    loader.startLoading();

    try {
      const items = await API.getAllItems();
      setTableData(items);
    } catch (err) {
      // TODO: Catch errors here!!!
    }

    loader.stopLoading();
  };

  // eslint-disable-next-line arrow-body-style
  const onRowClick = useCallback((item: Item) => {
    return {
      onClick: () => {
        setCurrentItem(item);
        setInventoryModalVisible(true);
      }
    };
  }, []);

  useEffect(() => {
    // loadInventory();
  }, []);

  return (
    <Card bordered={false} className="inventory-table">
      <InventoryItemModal
        item={currentItem}
        visible={isInventoryModalVisible}
        onClose={() => setInventoryModalVisible(false)}
      />
      <Table
        rowKey="ID"
        loading={loader.isLoading}
        onChange={onTableChange}
        dataSource={tableData}
        columns={columns}
        pagination={{
          showTotal: renderTableCount,
          showSizeChanger: true
        }}
        onRow={onRowClick}
        // Only allow the table to scroll if there's actually data in it
        scroll={{ x: rowCount > 0 ? true : undefined }}
        // eslint-disable-next-line arrow-body-style
        rowClassName={item => {
          return classNames({
            'no-children': item.children?.length === 0,
            'status-available': item.available,
            'status-unavailable': !item.available
          });
        }}
      />
    </Card>
  );
};

export default InventoryTable;
