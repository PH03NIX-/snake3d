import React, {useState} from 'react';
import { AdMob } from '@capacitor-community/admob';

function MainMenu({ onStartGame, score }) {
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
  });
  
  function setGameSetting(key, value) {
    setGameSettings((prevSettings) => ({
      ...prevSettings,
      [key]: value,
    }));
  }

  function setGameSetting(key, value) {
    setGameSettings((prevSettings) => ({
      ...prevSettings,
      [key]: value,
    }));
  }
  
  
  const watchAdToPlay = async () => {
    // Configure ad options
    const options = {
        adId: 'ca-app-pub-3940256099942544/1033173712',  // sample
      //adId: 'ca-app-pub-4245111389577363~1240556966ca-app-pub-4245111308957363/2498314360',
      
    };

    try {
      await AdMob.prepareRewardVideoAd(options);
      await AdMob.showRewardVideoAd();
      console.log("Watched ad sucessfully");
      // Ad was closed by the user, continue to the game
      onStartGame();
    } catch (error) {
      console.error('AdMob error:', error);
      // Handle the error
    }
  };

  function handleSubmit(event) {
    event.preventDefault();
    // Validate and sanitize form inputs as necessary
    // ...
  
    // Pass game settings to SnakeGame component and start game
    onStartGame(gameSettings);
  }
  

  return (
    <div style={{ textAlign: 'center', marginTop: '20%' }}>
      <h1>Snake 3D</h1>
      <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
        {score} apples
      </div>
      <form onSubmit={handleSubmit}>
        <label>
          Arena Length:
          <input
            type="number"
            value={gameSettings.arenaLength}
            onChange={(e) => setGameSetting('arenaLength', e.target.value)}
          />
        </label>
        <label>
          Arena Width:
          <input
            type="number"
            value={gameSettings.arenaWidth}
            onChange={(e) => setGameSetting('arenaWidth', e.target.value)}
          />
        </label>
        <label>
          snake speed:
          <input
            type="number"
            value={gameSettings.snakeSpeed}
            onChange={(e) => setGameSetting('snakeSpeed', e.target.value)}
          />
        </label>
        <label>
          starting apples:
          <input
            type="number"
            value={gameSettings.startingApples}
            onChange={(e) => setGameSetting('startingApples', e.target.value)}
          />
        </label>
        <label>
          grow factor:
          <input
            type="number"
            value={gameSettings.growFactor}
            onChange={(e) => setGameSetting('growFactor', e.target.value)}
          />
        </label>
        <label>
          reward rate:
          <input
            type="number"
            value={gameSettings.rewardRate}
            onChange={(e) => setGameSetting('rewardRate', e.target.value)}
          />
        </label>
        <label>
          Is Invincible:
          <input
            type="checkbox"
            value={gameSettings.isInvincible}
            onChange={(e) => setGameSetting('isInvincible', e.target.value)}
          />
        </label>
        <label>
          has top down cam:
          <input
            type="checkbox"
            value={gameSettings.isTopDownCam}
            onChange={(e) => setGameSetting('isTopDownCam', e.target.value)}
          />
        </label>
        <label>
          magnetMode:
          <input
            type="checkbox"
            value={gameSettings.isMagnet}
            onChange={(e) => setGameSetting('isMagnet', e.target.value)}
          />
        </label>
        
      <button onClick={handleSubmit} style={{ fontSize: '24px', padding: '10px 20px' }}>Play</button>
      <button onClick={watchAdToPlay} style={{ fontSize: '24px', padding: '10px 20px' }}>
        Watch Ad to Play
      </button>
      </form>

    </div>
  );
}

export default MainMenu;
