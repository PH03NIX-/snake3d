/*import React, { useState, useEffect } from 'react';

const GameOverTransition = ({ totalApples, roundApples, onTransitionEnd }) => {
  const [roundApplesDisplay, setRoundApplesDisplay] = useState(roundApples);
  const [totalApplesDisplay, setTotalApplesDisplay] = useState(totalApples);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (roundApplesDisplay > 0) {
        setRoundApplesDisplay(roundApplesDisplay - 1);
        setTotalApplesDisplay(totalApplesDisplay + 1);
      }
    }, 200); // Speed of the counter

    if (roundApplesDisplay === 0) {
      clearInterval(intervalId);
      // Wait a little bit before calling onTransitionEnd to let the user see the final score
      setTimeout(onTransitionEnd, 2000); // Wait time before ending the transition
    }

    return () => clearInterval(intervalId);
  }, [roundApplesDisplay, totalApplesDisplay, onTransitionEnd]);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'black',
      color: 'white',
      zIndex: 1000, // Make sure this is above all other content
    }}>
      <div>Game Over!</div>
      <div>Total Apples: {totalApplesDisplay}</div>
      <div>Round Apples: {roundApplesDisplay}</div>
    </div>
  );
};

export default GameOverTransition;
*/
import React, { useState, useEffect } from 'react';

function GameOverTransition({ totalApples, roundApples, totalBananas, roundBananas, onTransitionEnd, onTransitionEndBonus }) {
  const [currentApples, setCurrentApples] = useState(roundApples);
  const [currentBananas, setCurrentBananas] = useState(roundBananas);
  const [finalApples, setFinalApples] = useState(totalApples);
  const [finalBananas, setFinalBananas] = useState(totalBananas);
  const [transitionDone, setTransitionDone] = useState(false);

  useEffect(() => {
    if (currentApples > 0 || currentBananas > 0) {
      const interval = setInterval(() => {
        if (currentApples > 0) {
          setCurrentApples(current => current - 1);
          setFinalApples(apples => apples + 1);
          totalApples++;
          roundApples--;
        }
        if (currentBananas > 0) {
          setCurrentBananas(bananas => bananas - 1);
          setFinalBananas(bananas => bananas + 1);
        }
      }, 100);
      return () => clearInterval(interval);
    } else {
      setTransitionDone(true);
    }
  }, [currentApples, currentBananas]);

  return (
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
      <h1>Game Over</h1>
      <p>Apples: {finalApples}</p>
      {currentApples > 0 && <p>+{currentApples}</p>}
      <p>Bananas: {finalBananas}</p>
      {currentBananas > 0 && <p>+{currentBananas}</p>}
      <button onClick={onTransitionEnd} disabled={!transitionDone}>Skip to Menu</button>
      <button onClick={onTransitionEndBonus} disabled={!transitionDone}>Watch Ads for Bonus</button>
    </div>
  );
}

export default GameOverTransition;
