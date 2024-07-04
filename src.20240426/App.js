import React, { useState, useEffect } from 'react';
import MainMenu from './components/MainMenu';
import SnakeGame from './components/SnakeGame';

function App() {
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [score, setScore] = useState(0);  
  const [currentRoundApples, setCurrentRoundApples] = useState(0);
  const [gameSettings, setGameSettings] = useState({
    arenaLength: 40,
    arenaWidth: 20,
    wallHeight: 0.5,
    snakeSpeed: 0.05,
    growFactor: 35,
    startingApples: 3,
    rewardRate: 0.5,
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
      setScore(parseInt(savedScore, 10));  // Retrieve and parse the saved score
    }
    setCurrentScreen('menu');
    //localStorage.setItem('score', 300);
  }, []);

  const handleStartGame = (newGameSettings) => {
    setGameSettings(newGameSettings); // Update the game settings in the state
    setCurrentScreen('game');
  };

  /*const handleGameOver = (finalScore) => {
    setScore(finalScore);
    localStorage.setItem('score', finalScore);  // Save the score in localStorage
    console.log("game over, setting finalscore: ", finalScore);
    setCurrentScreen('menu');
  };*/

  const handleGameOver = (roundScore) => {
    const newScore = score + roundScore;
    setScore(newScore);  // Update the total apples
    localStorage.setItem('score', newScore);  // Save the score in localStorage
    setCurrentRoundApples(0);  // Reset the current round apples to 0
    setCurrentScreen('menu');
    // Transition to the game over screen here, then set current screen to 'menu'
  };

  const updateCurrentRoundApples = (newScore) => {
    setCurrentRoundApples(newScore);
  };

  const updateScore = (newScore) => {
    setScore(newScore);
    localStorage.setItem('score', newScore); // Save the score in localStorage
    console.log("updating score, setting score: ", newScore);
  };

  return (
    <div>
      {currentScreen === 'menu' ? (
        <MainMenu onStartGame={handleStartGame} score={score} />
      ) : (
        <SnakeGame onGameOver={handleGameOver} updateScore={updateScore} gameSettings={gameSettings} score={score} currentRoundApples={currentRoundApples} updateCurrentRoundApples={updateCurrentRoundApples} />
      )}
    </div>
  );
}

export default App;
