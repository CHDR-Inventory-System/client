import '../scss/dashboard.scss';
import { Button, notification, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import { AiOutlinePlus, AiOutlineFileText } from 'react-icons/ai';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import UserTable from '../components/dashboard/UserTable';
import InventoryTable from '../components/dashboard/inventory/InventoryTable';
import ReservationTable from '../components/dashboard/ReservationTable';
import AddItemDrawer from '../components/drawers/AddItemDrawer';
import useDrawer from '../hooks/drawer';
import useUser from '../hooks/user';
import PageNotFound from '../components/PageNotFound';
import useInventory from '../hooks/inventory';
import useLoader from '../hooks/loading';
import { Item } from '../types/API';
import useReservations from '../hooks/reservation';
import CSVGenerator from '../util/csv-generator';
import useRegisteredUsers from '../hooks/registered-users';

type TabKey = 'inventory' | 'users' | 'reservations';

const { TabPane } = Tabs;

const sortMessage = (
  <p className="table-sort-message">
    Tip: you can drag a table&apos;s header to rearrange it&apos;s columns.
  </p>
);

const downloadFile = (content: string, filename: string) => {
  const file = new File([content], filename);
  const link = document.createElement('a');

  link.style.display = 'none';
  link.href = URL.createObjectURL(file);
  link.download = filename;

  document.body.appendChild(link);
  link.click();

  window.setTimeout(() => {
    URL.revokeObjectURL(link.href);
    link.remove();
  }, 0);
};

const Dashboard = (): JSX.Element => {
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useUser();
  const inventory = useInventory();
  const loader = useLoader();
  const reservations = useReservations();
  const users = useRegisteredUsers();

  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const tab = (searchParams.get('tab') || 'inventory') as TabKey;
    return ['inventory', 'users', 'reservations'].includes(tab) ? tab : 'inventory';
  });

  const drawer = useDrawer({
    addItem: false,
    createReservation: false
  });

  const downloadInventoryCSV = () => {
    loader.startLoading();
    downloadFile(
      CSVGenerator.createInventoryCSV(inventory.items as Item[]),
      'inventory.csv'
    );
    loader.stopLoading();
  };

  const downloadReservationCSV = () => {
    loader.startLoading();
    downloadFile(
      CSVGenerator.generateReservationCSV(reservations.state),
      'reservations.csv'
    );
    loader.stopLoading();
  };

  const downloadUsersCSV = () => {
    loader.startLoading();
    downloadFile(CSVGenerator.generateRegisteredUsersCSV(users.state), 'users.csv');
    loader.stopLoading();
  };

  const downloadUsageStatsCSV = async () => {
    loader.startLoading();

    try {
      const csv = await CSVGenerator.generateUsageStatistics();
      downloadFile(csv, 'inventory-usage-report.csv');
    } catch (err) {
      notification.error({
        key: 'generate-report-error',
        message: 'Error Creating Report',
        description: 'An error occurred while generating the report. Please try again.'
      });
      // eslint-disable-next-line no-console
      console.error(err);
    }

    loader.stopLoading();
  };

  const inventoryTabContent = (
    <div className="tab-content">
      {sortMessage}
      <div className="table-actions">
        <Button
          type="primary"
          icon={<AiOutlinePlus />}
          className="table-action"
          onClick={() => drawer.open('addItem')}
        >
          Add Item
        </Button>
        <Button
          type="primary"
          icon={<AiOutlineFileText />}
          className="table-action"
          disabled={inventory.items.length === 0}
          loading={loader.isLoading}
          onClick={downloadInventoryCSV}
        >
          Export to CSV
        </Button>
        <Button
          type="primary"
          icon={<AiOutlineFileText />}
          className="table-action"
          disabled={inventory.items.length === 0}
          loading={loader.isLoading}
          onClick={downloadUsageStatsCSV}
        >
          Export Usage Report
        </Button>
      </div>
      <InventoryTable />
    </div>
  );

  const userTabContent = (
    <div className="tab-content">
      {sortMessage}
      <div className="table-actions">
        <Button
          type="primary"
          icon={<AiOutlineFileText />}
          className="table-action"
          disabled={users.state.length === 0}
          loading={loader.isLoading}
          onClick={downloadUsersCSV}
        >
          Export to CSV
        </Button>
      </div>
      <UserTable />
    </div>
  );

  const reservationTabContent = (
    <div className="tab-content">
      {sortMessage}
      <div className="table-actions">
        <Button
          type="primary"
          icon={<AiOutlineFileText />}
          className="table-action"
          disabled={reservations.state.length === 0}
          loading={loader.isLoading}
          onClick={downloadReservationCSV}
        >
          Export to CSV
        </Button>
      </div>
      <ReservationTable />
    </div>
  );

  useEffect(() => {
    if (user.isAdminOrSuper()) {
      document.title = 'CHDR Inventory - Dashboard';
    }
  }, []);

  useEffect(() => {
    if (user.isAdminOrSuper()) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [activeTab]);

  if (!user.isAdminOrSuper()) {
    return <PageNotFound />;
  }

  return (
    <div className="dashboard">
      <Navbar />
      <AddItemDrawer
        onClose={() => drawer.close('addItem')}
        visible={drawer.state.addItem}
      />
      <div className="content">
        <Tabs defaultActiveKey={activeTab} onChange={key => setActiveTab(key as TabKey)}>
          <TabPane tab="Inventory" key="inventory">
            {inventoryTabContent}
          </TabPane>
          <TabPane tab="Users" key="users">
            {userTabContent}
          </TabPane>
          <TabPane tab="Reservations" key="reservations">
            {reservationTabContent}
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
