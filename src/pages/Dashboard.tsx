import '../scss/dashboard.scss';
import { Button, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import Navbar from '../components/Navbar';
import UserTable from '../components/dashboard/UserTable';
import InventoryTable from '../components/dashboard/inventory/InventoryTable';
import ReservationTable from '../components/dashboard/ReservationTable';
import AddItemDrawer from '../components/dashboard/inventory/AddItemDrawer';

const { TabPane } = Tabs;

const Dashboard = (): JSX.Element => {
  const [isAddItemDrawerVisible, setAddItemDrawerVisible] = useState(false);

  const openAddItemDrawer = () => setAddItemDrawerVisible(true);
  const closeAddItemDrawer = () => setAddItemDrawerVisible(false);

  useEffect(() => {
    document.title = 'CHDR Inventory - Dashboard';
  }, []);

  return (
    <div className="dashboard">
      <Navbar title="CHDR - Inventory" subTitle="Admin" />
      <AddItemDrawer onClose={closeAddItemDrawer} visible={isAddItemDrawerVisible} />
      <div className="content">
        <Tabs defaultActiveKey="users">
          <TabPane tab="Inventory" key="inventory">
            <div className="tab-content">
              <div className="table-actions">
                <Button
                  type="primary"
                  icon={<AiOutlinePlus />}
                  className="table-action"
                  onClick={openAddItemDrawer}
                >
                  Add Item
                </Button>
              </div>
              <InventoryTable />
            </div>
          </TabPane>
          <TabPane tab="Users" key="users">
            <div className="tab-content">
              <UserTable />
            </div>
          </TabPane>
          <TabPane tab="Reservations" key="reservations">
            <div className="tab-content">
              <ReservationTable />
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
