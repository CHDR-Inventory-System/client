import '../scss/dashboard.scss';
import { Tabs } from 'antd';
import React from 'react';
import Navbar from '../components/Navbar';
import UserTable from '../components/dashboard/UserTable';
import InventoryTable from '../components/dashboard/InventoryTable';

const { TabPane } = Tabs;

const Dashboard = (): JSX.Element => (
  <div className="dashboard">
    <Navbar title="CHDR - Inventory" subTitle="Admin" />
    <div className="content">
      <Tabs defaultActiveKey="inventory">
        <TabPane tab="Inventory" key="inventory">
          <InventoryTable />
        </TabPane>
        <TabPane tab="Users" key="users">
          <UserTable />
        </TabPane>
        <TabPane tab="Reservations" key="reservations" />
      </Tabs>
    </div>
  </div>
);

export default Dashboard;
