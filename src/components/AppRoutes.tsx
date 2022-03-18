import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import useLoader from '../hooks/loading';
import useUser from '../hooks/user';
import { User } from '../types/API';
import Navbar from './Navbar';
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

  /**
   * When the browser is refreshed, React's state is cleared so we need to
   * check if the user's state is set. If not, we'll set it from localStorage
   */
  const loadUserFromStorage = () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '') as User;
      const hasMissingValues = Object.values(user.state || {}).some(
        value => value === null || value === undefined || value === ''
      );

      if (user.isAuthenticated() && hasMissingValues) {
        user.init(storedUser);
      }
    } catch (err) {
      // Ignored
    }
  };

  /**
   * Before the user goes to a route that requires them to be authenticated,
   * we need to make sure the user's credentials are still valid.
   */
  const validateAuth = async () => {
    if (
      requiredAuthPaths.includes(location.pathname) ||
      reserveRouteRegex.test(location.pathname)
    ) {
      loader.startLoading();

      if (!user.isAuthenticated()) {
        await user.logout();
        navigate('/auth', { replace: true });
      }

      loader.stopLoading();
    }
  };

  useEffect(() => {
    loadUserFromStorage();
    validateAuth();
  }, [location.pathname]);

  if (loader.isLoading) {
    return <Navbar showAvatar={false} />;
  }

  return (
    <Routes>
      <Route path="*" element={<PageNotFound />} />
      <Route
        path="/"
        element={
          <Suspense fallback={<Navbar showAvatar={false} />}>
            {user.isAuthenticated() && <MainPage />}
          </Suspense>
        }
      />
      <Route
        path="/dashboard"
        element={
          <Suspense fallback={<Navbar showAvatar={false} />}>
            {user.isAuthenticated() && <Dashboard key="Dashboard" />}
          </Suspense>
        }
      />
      <Route
        path="/reserve/:itemId"
        element={
          <Suspense fallback={<Navbar showAvatar={false} />}>
            {user.isAuthenticated() && <ReservationPage />}
          </Suspense>
        }
      />
      <Route
        path="/reservations"
        element={
          <Suspense fallback={<Navbar showAvatar={false} />}>
            {user.isAuthenticated() && <MyReservations />}
          </Suspense>
        }
      />
      <Route
        path="/calendar"
        element={
          <Suspense fallback={<Navbar showAvatar={false} />}>
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
        path="/verify/:userId/:verificationCode"
        element={
          <Suspense fallback={<div />}>
            <VerifyAccountPage />
          </Suspense>
        }
      />
      <Route
        path="/reset-password/:userId/:verificationCode"
        element={
          <Suspense fallback={<div />}>
            <ResetPasswordPage />
          </Suspense>
        }
      />
      <Route
        path="/update-email/:userId/:verificationCode"
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
