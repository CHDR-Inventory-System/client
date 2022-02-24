import '../scss/verify-account-page.scss';
import { Card, Alert, AlertProps } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, Transition, Variants } from 'framer-motion';
import useUser from '../hooks/user';
import useLoader from '../hooks/loading';
import LoadingSpinner from '../components/LoadingSpinner';

const animationOpts: Transition = {
  delay: 0.3,
  duration: 1.5,
  ease: [0.16, 1, 0.3, 1]
};

const animationVariants: Variants = {
  hidden: {
    opacity: 0,
    transform: 'translateY(20%)'
  },
  show: {
    opacity: 1,
    transform: 'translateY(0%)'
  }
};

const getAlertProps = (isLinkInvalid: boolean): Partial<AlertProps> => ({
  type: isLinkInvalid ? 'error' : 'success',
  message: isLinkInvalid ? 'Invalid Link' : 'Thanks!',
  description: isLinkInvalid ? (
    <div>
      This verification link is invalid. Make sure the URL matches the link from your
      email. <Link to="/auth">Click here to go back to the login page.</Link>
    </div>
  ) : (
    <div>
      Your account has been verified, you&apos;ll be redirected to the login page
      shortly... If you aren&apos;t, <Link to="/auth">click here.</Link>
    </div>
  )
});

const VerifyAccount = (): JSX.Element => {
  const navigate = useNavigate();
  const loader = useLoader(false);
  const user = useUser();
  const [params] = useSearchParams();
  const [isLinkInvalid, setLinkInvalid] = useState(false);

  const verifyAccount = async () => {
    const userId = parseInt(params.get('id') || '', 10);
    const verificationCode = params.get('verificationCode');

    if (Number.isNaN(userId) || !verificationCode) {
      setLinkInvalid(true);
      return;
    }

    loader.startLoading();

    try {
      await user.verifyAccount(userId, verificationCode);
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    } catch {
      setLinkInvalid(true);
    }

    loader.stopLoading();
  };

  useEffect(() => {
    verifyAccount();
    document.title = 'CHDR Inventory - Verify Account';
  }, []);

  return (
    <div className="verify-account">
      <header>
        <h1>CHDR Inventory</h1>
        <p>Center for Humanities and Digital Research</p>
      </header>
      <motion.div
        initial="hidden"
        animate="show"
        transition={animationOpts}
        variants={animationVariants}
      >
        <Card title="Verify Account" className="verified-card">
          {loader.isLoading ? (
            <LoadingSpinner />
          ) : (
            <Alert {...getAlertProps(isLinkInvalid)} />
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default VerifyAccount;
