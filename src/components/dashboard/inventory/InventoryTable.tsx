import '../../../scss/inventory-table.scss';
import React, { useRef, useState, useEffect } from 'react';
import { Table, Card, Input, Button, notification } from 'antd';
import Highlighter from 'react-highlight-words';
import { AiOutlineSearch, AiOutlineDown } from 'react-icons/ai';
import { BsBoxSeam } from 'react-icons/bs';
import { ColumnsType, ColumnType } from 'antd/lib/table';
import classNames from 'classnames';
import { FilterDropdownProps } from 'antd/lib/table/interface';
// eslint-disable-next-line import/no-extraneous-dependencies
import { RenderExpandIconProps } from 'rc-table/lib/interface';
import moment from 'moment';
import EditItemDrawer from './EditItemDrawer';
import useLoader from '../../../hooks/loading';
import useInventory from '../../../hooks/inventory';
import AddItemDrawer from './AddItemDrawer';
import LoadingSpinner from '../../LoadingSpinner';
import EmptyTableContent from '../EmptyTableContent';
import type { Item } from '../../../types/API';

/**
 * Used to show the current table count along with the
 * total number of items on the current page
 */
const renderTableCount = (total: number, range: [number, number]) =>
  `${range[0]}-${range[1]} of ${total}`;

const InventoryTable = (): JSX.Element => {
  const inventory = useInventory();
  const [searchedText, setSearchedText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState<keyof Item>();
  const [isEditDrawerVisible, setEditDrawerVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isAddItemDrawerVisible, setAddItemDrawerVisible] = useState(false);
  const loader = useLoader();
  const searchInputRef = useRef<Input>(null);

  const openAddItemDrawer = () => setAddItemDrawerVisible(true);
  const closeAddItemDrawer = () => setAddItemDrawerVisible(false);
  const openEditItemDrawer = () => setEditDrawerVisible(true);
  const closeEditItemDrawer = () => setEditDrawerVisible(false);

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
      ellipsis: true,
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
      render: (available: boolean) => (
        <span>{available ? 'Available' : 'Unavailable'}</span>
      )
    },
    {
      title: 'Created',
      key: 'created',
      dataIndex: 'created',
      ellipsis: true,
      defaultSortOrder: 'descend',
      sorter: (first, second) => Date.parse(first.created) - Date.parse(second.created),
      render: (created: string) => <span>{moment(created).format('MMMM Do YYYY')}</span>
    }
  ];

  const loadInventory = async () => {
    loader.startLoading();

    try {
      await inventory.init();
    } catch (err) {
      notification.error({
        duration: 0,
        message: "Couldn't Load Inventory",
        key: 'inventory-load-error',
        description: `
          An unexpected error occurred loading inventory.
          Refresh the page to try again.
        `
      });
    }

    loader.stopLoading();
  };

  const onRowClick = (item: Item) => {
    return {
      onClick: () => {
        setSelectedItem(item);
        openEditItemDrawer();
      }
    };
  };

  const expandedRowRenderer = (item: Item) => (
    <Button
      type="ghost"
      className="add-child-button"
      onClick={() => {
        setSelectedItem(item);
        openAddItemDrawer();
      }}
    >
      Add child item
    </Button>
  );

  const renderExpandIcon = ({ record: item, onExpand }: RenderExpandIconProps<Item>) => {
    if (!item.main) {
      return null;
    }

    return (
      <Button
        className="row-action"
        icon={<AiOutlineDown />}
        onClick={event => {
          onExpand(item, event);
          event.stopPropagation();
        }}
      />
    );
  };

  useEffect(() => {
    loadInventory();
  }, []);

  return (
    <Card bordered={false} className="inventory-table">
      {selectedItem && (
        <>
          <EditItemDrawer
            itemId={selectedItem.ID}
            visible={isEditDrawerVisible}
            onClose={closeEditItemDrawer}
          />
          <AddItemDrawer
            visible={isAddItemDrawerVisible}
            onClose={closeAddItemDrawer}
            parentItem={selectedItem}
          />
        </>
      )}
      <Table
        rowKey="ID"
        loading={{
          spinning: loader.isLoading,
          indicator: <LoadingSpinner />
        }}
        dataSource={inventory.items}
        columns={columns}
        locale={{
          emptyText: (
            <EmptyTableContent
              icon={<BsBoxSeam size={84} />}
              text="No items in inventory."
            />
          )
        }}
        pagination={{
          showTotal: renderTableCount,
          showSizeChanger: true
        }}
        expandable={{
          expandedRowRender: expandedRowRenderer,
          expandIcon: renderExpandIcon,
          fixed: 'left'
        }}
        onRow={onRowClick}
        // Only allow the table to scroll if there's actually data in it
        scroll={{ x: true }}
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
