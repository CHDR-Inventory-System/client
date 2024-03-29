import '../../../scss/inventory-table.scss';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Table, Card, Input, Button, notification, InputRef, Tooltip } from 'antd';
import Highlighter from 'react-highlight-words';
import { AiOutlineSearch, AiOutlineDown } from 'react-icons/ai';
import { GrLineChart } from 'react-icons/gr';
import { BsBoxSeam } from 'react-icons/bs';
import { ColumnsType, ColumnType } from 'antd/lib/table';
import classNames from 'classnames';
import { FilterDropdownProps } from 'antd/lib/table/interface';
// eslint-disable-next-line import/no-extraneous-dependencies
import { RenderExpandIconProps } from 'rc-table/lib/interface';
import ReactDragListView from 'react-drag-listview';
import EditItemDrawer from '../../drawers/EditItemDrawer';
import useLoader from '../../../hooks/loading';
import useInventory from '../../../hooks/inventory';
import AddItemDrawer from '../../drawers/AddItemDrawer';
import LoadingSpinner from '../../LoadingSpinner';
import NoContent from '../NoContent';
import type { Item } from '../../../types/API';
import useDrawer from '../../../hooks/drawer';
import { formatDate } from '../../../util/date';
import useModal from '../../../hooks/modal';
import UsageStatisticsModal from '../../modals/UsageStatisticsModal';

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
  const usageStatisticsModal = useModal();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const drawer = useDrawer({
    addItem: false,
    editItem: false
  });
  const loader = useLoader();
  const searchInputRef = useRef<InputRef>(null);

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

  const [columnSortIndices, setColumnSortIndices] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('inventoryTableSort') || '') as string[];
    } catch {
      return ['name', 'barcode', 'type', 'quantity', 'location', 'available', 'created'];
    }
  });

  const columns = useMemo<ColumnsType<Item>>(() => {
    const cols: ColumnsType<Item> = [
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
        render: (created: string) => <span>{formatDate(created)}</span>
      }
    ];

    cols.sort(
      (a, b) =>
        columnSortIndices.indexOf(a.key as string) -
        columnSortIndices.indexOf(b.key as string)
    );

    return cols;
  }, [inventory.items, columnSortIndices]);

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
        drawer.open('editItem');
      }
    };
  };

  const expandedRowRenderer = (item: Item) => (
    <Button
      type="ghost"
      className="add-child-button"
      onClick={() => {
        setSelectedItem(item);
        drawer.open('addItem');
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
      <div className="row-actions">
        <Button
          className={classNames('row-action', {
            'row-action-expand': (item.children || []).length > 0
          })}
          title="Expand row"
          icon={<AiOutlineDown />}
          onClick={event => {
            onExpand(item, event);
            event.stopPropagation();
          }}
        />
        <Tooltip title="View usage statistics">
          <Button
            className="row-action"
            icon={<GrLineChart />}
            onClick={event => {
              setSelectedItem(item);
              usageStatisticsModal.open();
              event.stopPropagation();
            }}
          />
        </Tooltip>
      </div>
    );
  };

  const onDragEnd = (fromIndex: number, toIndex: number) => {
    if (fromIndex === 0 || toIndex === 0) {
      // Prevent the first column from being dragged since it has
      // the actions for the row
      return;
    }

    const cols = [...columns];

    // Need to subtract 1 from `fromIndex` and `toIndex` because the 0th
    // column has the row's actions
    const item = cols.splice(fromIndex - 1, 1)[0];
    cols.splice(toIndex - 1, 0, item);

    const keys = cols.map(column => column.key as string);
    setColumnSortIndices(keys);
    localStorage.setItem('inventoryTableSort', JSON.stringify(keys));
  };

  useEffect(() => {
    loadInventory();
  }, []);

  return (
    <Card bordered={false} className="inventory-table">
      {selectedItem && (
        <>
          <EditItemDrawer
            item={selectedItem}
            visible={drawer.state.editItem}
            onClose={() => drawer.close('editItem')}
          />
          <AddItemDrawer
            visible={drawer.state.addItem}
            onClose={() => drawer.close('addItem')}
            parentItem={selectedItem}
          />
          <UsageStatisticsModal
            onClose={usageStatisticsModal.close}
            visible={usageStatisticsModal.isVisible}
            item={selectedItem}
          />
        </>
      )}
      <ReactDragListView.DragColumn onDragEnd={onDragEnd} nodeSelector="th">
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
              <NoContent icon={<BsBoxSeam size={84} />} text="No items in inventory." />
            )
          }}
          pagination={{
            showTotal: renderTableCount,
            showSizeChanger: true,
            defaultPageSize: 50
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
      </ReactDragListView.DragColumn>
    </Card>
  );
};

export default InventoryTable;
