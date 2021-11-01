import React, { useState } from 'react';
import '../style/App.scss';

const App = () => {
  const [randomNumber, setRandomNumber] = useState(
    Math.floor(Math.random() * 100)
  );

  const getRandomNumber = () => {
    fetch('/csi/random')
      .then(resp => resp.json())
      .then(resp => setRandomNumber(resp.number))
      .catch(error => {
        // eslint-disable-next-line no-console
        console.warn(error);
      });
  };

  return (
    <div className="app">
      <h1>Random Number: {randomNumber}</h1>
      <p>Click the button generate a new random number</p>
      <button className="generate-btn" onClick={getRandomNumber} type="button">
        Generate
      </button>
    </div>
  );
};

export default App;
