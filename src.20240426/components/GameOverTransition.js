import React, { useState, useEffect } from 'react';

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
