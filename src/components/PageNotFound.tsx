import '../scss/page-not-found.scss';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import useUser from '../hooks/user';

const PageNotFound = (): JSX.Element => {
  const user = useUser();

  useEffect(() => {
    document.title = 'CHDR Inventory - Are You Lost?';
  }, []);

  return (
    <div className="page-not-found">
      <Navbar showAvatar={user.isAuthenticated()} />
      <div className="container">
        <h1>404</h1>
        <p>
          Whoops...
          <br /> We couldn&apos;t find the page you were looking for!
        </p>
        <Link to="/">Go Home</Link>
      </div>
    </div>
  );
};

export default PageNotFound;
