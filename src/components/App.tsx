import React from 'react';
import { HashRouter } from 'react-router-dom';
import { UserProvider } from '../contexts/UserContext';
import { InventoryProvider } from '../contexts/InventoryContext';
import { RegisteredUsersProvider } from '../contexts/RegisteredUsers';
import { ReservationProvider } from '../contexts/ReservationContext';
import AppRoutes from './AppRoutes';

const App = (): JSX.Element => (
  <InventoryProvider>
    <UserProvider>
      <RegisteredUsersProvider>
        <ReservationProvider>
          <HashRouter>
            <AppRoutes />
          </HashRouter>
        </ReservationProvider>
      </RegisteredUsersProvider>
    </UserProvider>
  </InventoryProvider>
);

export default App;
