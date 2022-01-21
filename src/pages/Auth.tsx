import '../scss/auth.scss';
import React, { useState } from 'react';
import SignUpCard from '../components/cards/SignUpCard';
import LogInCard from '../components/cards/LogInCard';
import ForgotPasswordCard from '../components/cards/ForgotPasswordCard';

type CardType = 'login' | 'signUp' | 'forgotPassword';

const Auth = (): JSX.Element => {
  const [card, setCard] = useState<CardType>('signUp');

  const cards: Record<CardType, JSX.Element> = {
    login: (
      <LogInCard
        className="auth-card"
        description={
          // eslint-disable-next-line react/jsx-wrap-multilines
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
          // eslint-disable-next-line react/jsx-wrap-multilines
          <div className="card-description">
            Already have an account?{' '}
            <button onClick={() => setCard('login')} type="button">
              Click here to log in.
            </button>
          </div>
        }
      />
    ),
    forgotPassword: (
      <ForgotPasswordCard
        className="auth-card"
        description={
          // eslint-disable-next-line react/jsx-wrap-multilines
          <div className="card-description">
            <p>Enter your email to receive a link to reset your password.</p>
            <p>
              Already have an account?{' '}
              <button onClick={() => setCard('login')} type="button">
                Click here to log in.
              </button>
            </p>
          </div>
        }
      />
    )
  };

  return (
    <div className="auth">
      <header>
        <h1>CHDR</h1>
        <p>Center for Humanities and Digital Research</p>
      </header>
      {cards[card]}
    </div>
  );
};

export default Auth;
