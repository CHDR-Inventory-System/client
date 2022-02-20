import '../scss/auth.scss';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignUpCard from '../components/cards/SignUpCard';
import LogInCard from '../components/cards/LogInCard';
import useLoader from '../hooks/loading';
import useUser from '../hooks/user';

type CardType = 'login' | 'signUp';

const Auth = (): JSX.Element | null => {
  const [card, setCard] = useState<CardType>('login');
  const user = useUser();
  const loader = useLoader(true);
  const navigate = useNavigate();

  const cards: Record<CardType, JSX.Element> = {
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
    )
  };

  useEffect(() => {
    if (user.state.token && user.state.verified) {
      navigate('/');
    } else {
      loader.stopLoading();
    }
  }, []);

  if (loader.isLoading) {
    return null;
  }

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
