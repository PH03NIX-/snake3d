import React, { useState } from 'react';
import appleIcon from './appleIcon.png';
import bananaIcon from './bananaIcon.png';

function MiniGame({ onGameOver, score, bananaScore, currentRoundApples, currentRoundBananas, updateCurrentRoundApples, updateCurrentRoundBananas }) {
  const [trees, setTrees] = useState([
    { id: 1, isAvailable: true },
    { id: 2, isAvailable: true },
    { id: 3, isAvailable: true },
    { id: 4, isAvailable: true },
    { id: 5, isAvailable: true },
    { id: 6, isAvailable: true }
  ]);
  const [treesSelected, setTreesSelected] = useState(0);
  const [rewards, setRewards] = useState([]);

  const updateTotals = () => {
    let apples = 0;
    let bananas = 0;
    for( let r of rewards) {
        if(r.type === 'apple') {
            apples += r.quantity;
        }
        else {
            bananas += r.quantity;
        }
        updateCurrentRoundApples(apples);
        updateCurrentRoundBananas(bananas);
    }
  }  

  const handleTreeTap = (treeId) => {
    // Find the tree to check if it is still available
    const targetTree = trees.find(tree => tree.id === treeId);
  
    // If the tree is not available, return early to avoid further processing
    if (!targetTree.isAvailable || treesSelected >= 3) {
      return;
    }
  
    const newRewards = getRewards();
    setRewards([...rewards, { ...newRewards, treeId }]);
    setTrees(trees.map(tree => tree.id === treeId ? { ...tree, isAvailable: false } : tree));
    setTreesSelected(treesSelected + 1);
    updateTotals();
  };
  

  const getRewards = () => {
    const rewardOptions = [
      { type: 'apple', quantity: 3 },
      { type: 'apple', quantity: 5 },
      { type: 'apple', quantity: 10 },
      { type: 'apple', quantity: 20 },
      { type: 'apple', quantity: 30 },
      { type: 'banana', quantity: 1 },
      { type: 'banana', quantity: 3 },
      { type: 'banana', quantity: 5 }
    ];
    const randomIndex = Math.floor(Math.random() * rewardOptions.length);
    return rewardOptions[randomIndex];
  };

  const scoreDisplay = (
    <div>
      <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', alignItems: 'center' }}>
        <img src={appleIcon} alt="Apple Icon" style={{ width: '24px', height: '24px', marginRight: '4px' }} />
        <b>{score}</b>
        {currentRoundApples > 0 && (
          <b style={{ marginLeft: '4px', color: 'green' }}>+{currentRoundApples}</b>
        )}
      </div>
      <div style={{ position: 'absolute', top: '40px', right: '10px', display: 'flex', alignItems: 'center' }}>
        <img src={bananaIcon} alt="Banana Icon" style={{ width: '24px', height: '24px', marginRight: '4px' }} />
        <b>{bananaScore}</b>
        {currentRoundBananas > 0 && (
          <b style={{ marginLeft: '4px', color: 'green' }}>+{currentRoundBananas}</b>
        )}
      </div>
    </div>
  );

  return (
    <div style={{
      position: 'relative',
      height: '100vh',
      backgroundImage: 'url(cartoonTreeBackground.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
        {scoreDisplay}
      <div style={{ textAlign: 'center', padding: '20px', fontSize: '27px' }}>Pick {3-treesSelected} tree{3-treesSelected === 1 ? "" : "s"}</div>
      {treesSelected === 3 && (
        <div style={{ position: 'absolute', top: '60px', left: '50%', transform: 'translateX(-50%)' }}>
            <button onClick={onGameOver(currentRoundApples, currentRoundBananas, "menu")} >
            Return to Menu
            </button>
            <button onClick={() => {setTreesSelected(treesSelected - 1)}} >
            Watch Ad For Another Tree
            </button>
        </div>
      )}
      <div style={{ position: 'absolute', bottom: '20px', width: '100%', display: 'flex', justifyContent: 'space-around' }}>
        {trees.map(tree => (
          <div key={tree.id}>
            <img
              src={tree.isAvailable ? 'cartoonTreeHide.png' : 'cartoonTreeShow.png'}
              alt="Tree"
              onClick={() => handleTreeTap(tree.id)}
              style={{ cursor: tree.isAvailable ? 'pointer' : 'not-allowed', width: '100px' }}
            />
            {rewards.filter(reward => reward.treeId === tree.id).map((reward, index) => (
              <div key={index} style={{ position: 'absolute', bottom: '0px', width: '100px', textAlign: 'center' }}>
                <img src={reward.type === 'apple' ? appleIcon : bananaIcon} alt="Reward" style={{ width: '50px' }} />
                <span>{reward.quantity}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MiniGame;
