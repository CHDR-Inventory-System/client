import '../scss/auth.scss';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignUpCard from '../components/cards/SignUpCard';
import LogInCard from '../components/cards/LogInCard';
import ResetPasswordCard from '../components/cards/ResetPasswordCard';
import useUser from '../hooks/user';

type CardType = 'login' | 'signUp' | 'forgotPassword';

const Auth = (): JSX.Element | null => {
  const [card, setCard] = useState<CardType>('login');
  const navigate = useNavigate();
  const user = useUser();

  const cards: Record<CardType, JSX.Element> = useMemo(
    () => ({
      login: (
        <LogInCard
          className="auth-card"
          description={
            <div className="card-description">
              <p>
                Don&apos;t have an account?{' '}
                <button onClick={() => setCard('signUp')} type="button">
                  Click here to sign up.
                </button>
              </p>
              <p>
                Forgot your password?{' '}
                <button onClick={() => setCard('forgotPassword')} type="button">
                  Click here to reset it.
                </button>
              </p>
            </div>
          }
        />
      ),
      signUp: (
        <SignUpCard
          className="auth-card"
          description={
            <div className="card-description">
              <p>
                Already have an account?{' '}
                <button onClick={() => setCard('login')} type="button">
                  Click here to log in.
                </button>
              </p>
            </div>
          }
        />
      ),
      forgotPassword: (
        <ResetPasswordCard
          className="auth-card"
          description={
            <div className="card-description">
              <p>
                Already have an account?{' '}
                <button onClick={() => setCard('login')} type="button">
                  Click here to log in.
                </button>
              </p>
              <p>Enter your email to receive a link to reset your password.</p>
            </div>
          }
        />
      )
    }),
    []
  );

  useEffect(() => {
    if (user.isAuthenticated()) {
      navigate('/', { replace: true });
    }
  }, []);

  useEffect(() => {
    switch (card) {
      case 'login':
        document.title = 'CHDR Inventory - Login';
        break;
      case 'signUp':
        document.title = 'CHDR Inventory - Sign Up';
        break;
      case 'forgotPassword':
        document.title = 'CHDR Inventory - Forgot Password';
        break;
      default:
        throw new Error(`Invalid card type ${card}`);
    }
  }, [card]);

  return (
    <div className="auth">
      <header>
        <h1>CHDR Inventory</h1>
        <p>Center for Humanities and Digital Research</p>
      </header>
      {cards[card]}
    </div>
  );
};

export default Auth;
