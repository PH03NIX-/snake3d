import React, {useState} from 'react';
import { AdMob } from '@capacitor-community/admob';

function MainMenu({ onStartGame, score, bananaScore, appleIcon, bananaIcon }) {
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
  
  function setGameSetting(key, value) {
    setGameSettings((prevSettings) => ({
      ...prevSettings,
      [key]: value,
    }));
  }
  
  
  const watchAdToPlay = async () => {
    if(gameSettings.isMobile) {
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
        onStartGame(gameSettings);
      } catch (error) {
        console.error('AdMob error:', error);
        // Handle the error
      }
    }
    else {
      onStartGame(gameSettings);
    }
  };

  function handleSubmit(event) {
    event.preventDefault();
    onStartGame(gameSettings);
  }
  

  return (
    <div style={{ textAlign: 'center', marginTop: '20%' }}>
      <h1>Snake 3D</h1>
      <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', alignItems: 'center' }}>
        <img src={appleIcon} alt="Apple Icon" style={{ width: '24px', height: '24px', marginRight: '4px' }} />
        <b>{score}</b>
      </div>
      <div style={{ position: 'absolute', top: '40px', right: '10px', display: 'flex', alignItems: 'center' }}>
        <img src={bananaIcon} alt="Banana Icon" style={{ width: '24px', height: '24px', marginRight: '4px' }} />
        <b>{bananaScore}</b>
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
          banana rate:
          <input
            type="number"
            value={gameSettings.bananaRate}
            onChange={(e) => setGameSetting('bananaRate', e.target.value)}
          />
        </label>
        <label>
          com count:
          <input
            type="number"
            value={gameSettings.comCount}
            onChange={(e) => setGameSetting('comCount', e.target.value)}
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
        <label>
          Arena:
          <select onChange={(e) => setGameSetting('arenaAssets', e.target.value.split(","))}>
             <option value={["sky.jpg", "rockwall.jpg", "grass.jpg"]}>Grassland</option>
             <option value={["space-sky3.jpg", "glass-wall.jpg", "metal-floor.jpg"]}>Space Station</option>
             <option value={["underwater-sky.jpg", "coral-wall.jpg", "underwater-sand.jpg"]}>Underwater</option>
             <option value={["lava-sky.webp", "volcano-wall.jpg", "lava-floor.webp"]}>Volcano</option>
             <option value={["candyland-sky.webp", "candyland-wall.jpg", "candyland-floor2.jpg"]}>Candyland</option>
            </select>
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
