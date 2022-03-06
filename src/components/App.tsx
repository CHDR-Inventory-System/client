import React, { useEffect, useState, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from '../contexts/UserContext';
import useLoader from '../hooks/loading';
import type { User } from '../types/API';
import { InventoryProvider } from '../contexts/InventoryContext';
import { RegisteredUsersProvider } from '../contexts/RegisteredUsers';
import { ReservationProvider } from '../contexts/ReservationContext';

const MainPage = lazy(() => import('../pages/MainPage'));
const Auth = lazy(() => import('../pages/Auth'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const VerifyAccountPage = lazy(() => import('../pages/VerifyAccountPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
const UpdateEmailPage = lazy(() => import('../pages/UpdateEmailPage'));
const ReservationPage = lazy(() => import('../pages/ReservationPage'));

const routes = (
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
    <Route
      path="/update-email"
      element={
        <Suspense fallback={<div />}>
          <UpdateEmailPage />
        </Suspense>
      }
    />
    <Route
      path="/reserve/:itemId"
      element={
        <Suspense fallback={<div />}>
          <ReservationPage />
        </Suspense>
      }
    />
  </Routes>
);

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
        <RegisteredUsersProvider>
          <ReservationProvider>
            <HashRouter>{routes}</HashRouter>
          </ReservationProvider>
        </RegisteredUsersProvider>
      </UserProvider>
    </InventoryProvider>
  );
};

export default App;
