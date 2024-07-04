import React, { useState, useEffect } from 'react';
import MainMenu from './components/MainMenu';
import SnakeGame from './components/SnakeGame'; 
import MiniGame from './components/miniGame'
import appleIcon from './appleIcon.png'; 
import bananaIcon from './bananaIcon.png'; 

function App() {
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [score, setScore] = useState(0);
  const [currentRoundApples, setCurrentRoundApples] = useState(0);
  const [bananaScore, setBananaScore] = useState(0);
  const [currentRoundBananas, setCurrentRoundBananas] = useState(0);

  const [gameSettings, setGameSettings] = useState({
    isMobile: false,
    arenaLength: 40,
    arenaWidth: 20,
    wallHeight: 0.5,
    snakeSpeed: 0.05,
    growFactor: 35,
    startingApples: 3,
    rewardRate: 0.5,
    bananaRate: 0.1,
    comCount: 0,
    isMagnet: false,
    isInvincible: false,
    isTopDownCam: false,
    isGameOver: false,
    isMainMenu: false,
    arenaAssets: ["sky.jpg", "rockwall.jpg", "grass.jpg"],
  });

  useEffect(() => {
    const savedScore = localStorage.getItem('score');
    if (savedScore) {
      setScore(parseInt(savedScore, 10));
    }
    const savedBananaScore = localStorage.getItem('bananaScore');
    if (savedBananaScore) {
      setCurrentRoundApples(parseInt(savedBananaScore, 10));
    }
    //setBananaScore(1);
    setCurrentScreen('menu');
  }, []);

  const handleStartGame = (newGameSettings) => {
    setGameSettings(newGameSettings);
    setCurrentScreen('game');
  };

  const handleGameOver = (roundScore, roundBananas, currentScreen) => {
    const newScore = score + roundScore;
    const newBananaScore = bananaScore + roundBananas;
    setScore(newScore);
    setBananaScore(newBananaScore);
    localStorage.setItem('score', newScore);
    localStorage.setItem('bananaScore', newBananaScore);
    setCurrentRoundApples(0);
    setCurrentRoundBananas(0);
    setCurrentScreen(currentScreen);
  };

  const updateCurrentRoundApples = (newScore) => {
    setCurrentRoundApples(newScore);
  };

  const updateCurrentRoundBananas = (newBananaScore) => {
    setCurrentRoundBananas(newBananaScore);
    //setBananaScore(prevBananaScore => prevBananaScore + newBananaScore);
  };

  return (
    <div>
      {(() => {
        switch (currentScreen) {
          case 'menu':
            return (
              <MainMenu
                onStartGame={handleStartGame}
                score={score}
                bananaScore={bananaScore}
                appleIcon={appleIcon}
                bananaIcon={bananaIcon}
              />
            );
          case 'miniGame':
            return (
              <MiniGame                
                onGameOver={handleGameOver}
                score={score}
                bananaScore={bananaScore}
                currentRoundApples={currentRoundApples}
                currentRoundBananas={currentRoundBananas}
                updateCurrentRoundApples={updateCurrentRoundApples}
                updateCurrentRoundBananas={updateCurrentRoundBananas}
              />
            );
          // Add more cases as needed for other screens
          default:
            return (
              <SnakeGame
                onGameOver={handleGameOver}
                gameSettings={gameSettings}
                score={score}
                bananaScore={bananaScore}
                currentRoundApples={currentRoundApples}
                currentRoundBananas={currentRoundBananas}
                updateCurrentRoundApples={updateCurrentRoundApples}
                updateCurrentRoundBananas={updateCurrentRoundBananas}
                appleIcon={appleIcon}
                bananaIcon={bananaIcon}
              />
            );
        }
      })()}
    </div>
  );
  
}

export default App;
