import React, { useEffect, useState, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from '../contexts/UserContext';
import useLoader from '../hooks/loading';
import { User } from '../types/API';
import { InventoryProvider } from '../contexts/InventoryContext';

const MainPage = lazy(() => import('../pages/MainPage'));
const Auth = lazy(() => import('../pages/Auth'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const VerifyAccountPage = lazy(() => import('../pages/VerifyAccountPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));

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
            <Route
              path="/"
              element={
                <Suspense fallback={<div />}>
                  <MainPage />
                </Suspense>
              }
            />
            <Route
              path="/auth"
              element={
                <Suspense fallback={<div />}>
                  <Auth />
                </Suspense>
              }
            />
            <Route
              path="/dashboard"
              element={
                <Suspense fallback={<div />}>
                  <Dashboard />
                </Suspense>
              }
            />
            <Route
              path="/verify"
              element={
                <Suspense fallback={<div />}>
                  <VerifyAccountPage />
                </Suspense>
              }
            />
            <Route
              path="/reset-password"
              element={
                <Suspense fallback={<div />}>
                  <ResetPasswordPage />
                </Suspense>
              }
            />
          </Routes>
        </HashRouter>
      </UserProvider>
    </InventoryProvider>
  );
};

export default App;
