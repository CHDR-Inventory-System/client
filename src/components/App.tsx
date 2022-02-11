import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from '../contexts/UserContext';
import useLoader from '../hooks/loading';
import Auth from '../pages/Auth';
import { User } from '../types/API';
import MainPage from '../pages/MainPage';
import Dashboard from '../pages/Dashboard';
import { InventoryProvider } from '../contexts/InventoryContext';

const App = (): JSX.Element | null => {
  const [initialUserValue, setInitialUserValue] = useState<User | null>(null);
  const loader = useLoader(true);

  // If the user was previously logged in, grab their credentials
  // from localStorage, set the the user context object,
  // then take them to the main screen
  const loadUserFromStorage = () => {
    const user = localStorage.getItem('user');

    if (!user) {
      loader.stopLoading();
      return;
    }

    try {
      setInitialUserValue(JSON.parse(user));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Error parsing user from storage', err);
    }

    loader.stopLoading();
  };

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  if (loader.isLoading) {
    return null;
  }

  return (
    <InventoryProvider>
      <UserProvider initialValue={initialUserValue}>
        <HashRouter>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </HashRouter>
      </UserProvider>
    </InventoryProvider>
  );
};

export default App;
