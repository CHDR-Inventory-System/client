import '../scss/dashboard.scss';
import { Button, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import UserTable from '../components/dashboard/UserTable';
import InventoryTable from '../components/dashboard/inventory/InventoryTable';
import ReservationTable from '../components/dashboard/ReservationTable';
import AddItemDrawer from '../components/drawers/AddItemDrawer';
import useDrawer from '../hooks/drawer';
import useUser from '../hooks/user';
import PageNotFound from '../components/PageNotFound';

type TabKey = 'inventory' | 'users' | 'reservations';

const { TabPane } = Tabs;

const sortMessage = (
  <p className="table-sort-message">
    Tip: you can drag a table&apos;s header to rearrange it&apos;s columns.
  </p>
);

const Dashboard = (): JSX.Element => {
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useUser();

  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const tab = (searchParams.get('tab') || 'inventory') as TabKey;
    return ['inventory', 'users', 'reservations'].includes(tab) ? tab : 'inventory';
  });

  const drawer = useDrawer({
    addItem: false,
    createReservation: false
  });

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
      </div>
      <InventoryTable />
    </div>
  );

  const userTabContent = (
    <div className="tab-content">
      {sortMessage}
      <UserTable />
    </div>
  );

  const reservationTabContent = (
    <div className="tab-content">
      {sortMessage}
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
