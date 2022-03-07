import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import jwtDecode, { JwtPayload } from 'jwt-decode';
import useUser from '../hooks/user';
import { User, UserRole } from '../types/API';
import Navbar from './Navbar';
import PageNotFound from './PageNotFound';

type UserJwt = JwtPayload & {
  sub?: {
    ID: number;
    role: UserRole;
    verified: number;
  };
};

const MainPage = lazy(() => import('../pages/MainPage'));
const Auth = lazy(() => import('../pages/Auth'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const VerifyAccountPage = lazy(() => import('../pages/VerifyAccountPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
const UpdateEmailPage = lazy(() => import('../pages/UpdateEmailPage'));
const ReservationPage = lazy(() => import('../pages/ReservationPage'));

const requiredAuthPaths = ['/dashboard', '/'];
const reserveRouteRegex = /reserve\/[0-9]/;

const AppRoutes = (): JSX.Element => {
  const location = useLocation();
  const user = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // Before the user goes to a route that requires them to be authenticated,
    // we need to make sure the user's credentials are still in local storage.
    // We'll also make sure the stored JWT is valid
    if (
      requiredAuthPaths.includes(location.pathname) ||
      reserveRouteRegex.test(location.pathname)
    ) {
      try {
        const parsedUser = JSON.parse(localStorage.getItem('user') || '') as User | null;

        if (!parsedUser || !parsedUser.token.trim()) {
          navigate('/auth');
          return;
        }

        const jwt = jwtDecode<UserJwt>(parsedUser.token);

        if (!jwt.sub || !jwt.sub?.verified) {
          navigate('/auth');
        } else {
          user.init(parsedUser);
        }
      } catch (err) {
        navigate('/auth');
      }
    }
  }, [location]);

  return (
    <Routes>
      <Route path="*" element={<PageNotFound />} />
      <Route
        path="/"
        element={
          <Suspense fallback={<Navbar showAvatar={false} />}>
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
          <Suspense fallback={<Navbar showAvatar={false} />}>
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
          <Suspense fallback={<Navbar showAvatar={false} />}>
            <ReservationPage />
          </Suspense>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
