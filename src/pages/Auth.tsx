import '../scss/auth.scss';
import React, { useState } from 'react';
import SignUpCard from '../components/cards/SignUpCard';
import LogInCard from '../components/cards/LogInCard';

type CardType = 'login' | 'signUp';

const Auth = (): JSX.Element => {
  const [card, setCard] = useState<CardType>('login');

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
            <p>
              Already have an account?{' '}
              <button onClick={() => setCard('login')} type="button">
                Click here to log in.
              </button>
            </p>
            <p>
              Your NID and password should be the same combination you use to sign into{' '}
              <a href="https://my.ucf.edu/" target="_blank" rel="noreferrer">
                myUCF
              </a>
              .
            </p>
          </div>
        }
      />
    )
  };

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
