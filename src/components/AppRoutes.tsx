import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import useLoader from '../hooks/loading';
import useUser from '../hooks/user';
import { User } from '../types/API';
import PageNotFound from './PageNotFound';

const MainPage = lazy(() => import('../pages/MainPage'));
const Auth = lazy(() => import('../pages/Auth'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const VerifyAccountPage = lazy(() => import('../pages/VerifyAccountPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
const UpdateEmailPage = lazy(() => import('../pages/UpdateEmailPage'));
const ReservationPage = lazy(() => import('../pages/ReservationPage'));
const MyReservations = lazy(() => import('../pages/MyReservations'));
const ReservationCalendar = lazy(() => import('../pages/ReservationCalendar'));

const requiredAuthPaths = ['/', '/dashboard', '/reservations', '/calendar'];
const reserveRouteRegex = /reserve\/[0-9]/;

const AppRoutes = (): JSX.Element | null => {
  const location = useLocation();
  const user = useUser();
  const navigate = useNavigate();
  const loader = useLoader();

  const validateAuth = async () => {
    // Before the user goes to a route that requires them to be authenticated,
    // we need to make sure the user's credentials are still valid.
    if (
      requiredAuthPaths.includes(location.pathname) ||
      reserveRouteRegex.test(location.pathname)
    ) {
      loader.startLoading();

      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '') as User;

        // When the browser is refreshed, React's state is cleared so we need to
        // check if the user's state is set. If not, we'll set it from localStorage
        const hasMissingValue = Object.values(user.state || {}).some(
          value => value === null || value === undefined
        );

        if (user.isAuthenticated()) {
          if (hasMissingValue) {
            user.init(storedUser);
          }
        } else {
          await user.logout();
          navigate('/auth', { replace: true });
        }
      } catch (err) {
        await user.logout();
        navigate('/auth', { replace: true });
      }

      loader.stopLoading();
    }
  };

  useEffect(() => {
    validateAuth();
  }, [location.pathname]);

  if (loader.isLoading) {
    return null;
  }

  return (
    <Routes>
      <Route path="*" element={<PageNotFound />} />
      <Route
        path="/"
        element={
          <Suspense fallback={<div />}>{user.isAuthenticated() && <MainPage />}</Suspense>
        }
      />
      <Route
        path="/dashboard"
        element={
          <Suspense fallback={<div />}>
            {user.isAuthenticated() && <Dashboard key="Dashboard" />}
          </Suspense>
        }
      />
      <Route
        path="/reserve/:itemId"
        element={
          <Suspense fallback={<div />}>
            {user.isAuthenticated() && <ReservationPage />}
          </Suspense>
        }
      />
      <Route
        path="/reservations"
        element={
          <Suspense fallback={<div />}>
            {user.isAuthenticated() && <MyReservations />}
          </Suspense>
        }
      />
      <Route
        path="/calendar"
        element={
          <Suspense fallback={<div />}>
            {user.isAuthenticated() && <ReservationCalendar />}
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
    </Routes>
  );
};

export default AppRoutes;
