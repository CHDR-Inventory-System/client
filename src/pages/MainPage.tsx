import React, { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types/API';

const MainPage = (): JSX.Element | null => {
  const navigate = useNavigate();

  // Because we won't have access to the updated user state after
  // a call to dispatch, we can't rely on it's value. Therefore, we'll
  // have to read from local storage
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '') as User;
    } catch (err) {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, []);

  if (!user) {
    return null;
  }

  return <h1>Hello, {user.fullName}!</h1>;
};

export default MainPage;
