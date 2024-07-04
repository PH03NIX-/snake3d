import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import GameOverTransition from './GameOverTransition';

// Define classes and functions outside of the SnakeGame component
class SnakeSegment {
  constructor(mesh) {
    this.mesh = mesh; // This is a THREE.Mesh object
    this.next = null; // Reference to the next segment
  }
}

/*function generateTrainingData() {
  const data = [];
  const samplesPerScenario = 500; // Reduce for simplicity in examples

  // Simulate different situations
  for (let i = 0; i < samplesPerScenario; i++) {
    // Scenario 1: Apple directly ahead, no obstacles
    data.push({
      input: {
        appleX: 0, // Directly ahead
        appleY: Math.random(), // Vary distance slightly
        closestWallDist: 1, // No wall close
        closestSnakeX: 2, // No other snake close
        closestSnakeY: 2,
        playerX: 2, // Player not close
        playerY: 2
      },
      output: [0, 0, 1] // Move forward
    });

    // Scenario 2: Apple to the right, need to turn
    data.push({
      input: {
        appleX: Math.random() * 0.5 + 0.5, // To the right
        appleY: Math.random() * 0.5, // Forward right
        closestWallDist: 1,
        closestSnakeX: 2,
        closestSnakeY: 2,
        playerX: 2,
        playerY: 2
      },
      output: [0, 1, 0] // Turn right
    });

    // Scenario 3: Wall close on left, apple ahead
    data.push({
      input: {
        appleX: 0,
        appleY: Math.random(),
        closestWallDist: 0.1, // Wall is very close on the left
        closestSnakeX: 2,
        closestSnakeY: 2,
        playerX: 2,
        playerY: 2
      },
      output: [0, 0, 1] // Continue forward, avoid wall
    });

    // Scenario 4: Player snake close on the right, apple left
    data.push({
      input: {
        appleX: -Math.random() * 0.5, // To the left
        appleY: Math.random() * 0.5, // Forward left
        closestWallDist: 1,
        closestSnakeX: 2,
        closestSnakeY: 2,
        playerX: Math.random() * 0.2 + 0.1, // Player very close on right
        playerY: Math.random() * 0.2
      },
      output: [1, 0, 0] // Turn left to avoid player
    });

    // Scenario 5: Multiple snakes around, apple ahead
    data.push({
      input: {
        appleX: 0,
        appleY: Math.random(),
        closestWallDist: 1,
        closestSnakeX: -0.5, // Another snake to the left
        closestSnakeY: Math.random() * 0.5 + 0.5,
        playerX: 0.5, // Player to the right
        playerY: Math.random() * 0.5 + 0.5
      },
      output: [0, 0, 1] // Move forward to apple, steer clear of snakes
    });

    // Additional scenarios can be added here for more complex situations
  }

  return data;
}*/


function createSky(skyAsset) {
  // Load the sky texture
  const textureLoader = new THREE.TextureLoader();
  //const skyTexture = textureLoader.load("sky.jpg");
  const skyTexture = textureLoader.load(skyAsset);

  // Make the texture repeat
  skyTexture.wrapS = skyTexture.wrapT = THREE.RepeatWrapping;
  skyTexture.repeat.set(10, 10); // Adjust these values to get the desired effect

  // Create a sphere geometry with normals flipped (so it's visible from the inside)
  const skyGeometry = new THREE.SphereGeometry(500, 32, 32); // Radius, widthSegments, heightSegments
  skyGeometry.scale(-1, 1, 1); // Invert the geometry on the x-axis so that faces point inward

  // Create a material using the texture
  const skyMaterial = new THREE.MeshBasicMaterial({ map: skyTexture });

  // Create the sky mesh
  const sky = new THREE.Mesh(skyGeometry, skyMaterial);

  // Add the sky to your scene
  return sky;
}

function createMeshForSegment(textureName = "snake-skin2.jpg") {
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(textureName);
  
  const geometry = new THREE.SphereGeometry(0.5, 32, 32);
  const material = new THREE.MeshStandardMaterial({ map: texture });
  const mesh = new THREE.Mesh(geometry, material);
  
  mesh.rotation.x = Math.PI / 2;
  
  return mesh;
}

function createNewApple(arenaLength, arenaWidth, model) {
  // Create a placeholder object that represents the apple
  const applePlaceholder = new THREE.Object3D();
  let modelFile, scale;
  switch (model) {
    case 1: // apple
      modelFile = "gala-apple3.gltf";
      scale = 0.2;
      break;
    case 2: // dice
      modelFile = "dice.gltf";
      scale = 20;
      break;
    case 3: // banana
      modelFile = "banana.gltf";
      scale = 20;
      break;
  }

  // Set position
  const xPosition = Math.random() * arenaLength - (arenaLength/2) - 1;
  const yPosition = 0.25;
  const zPosition = Math.random() * arenaWidth - (arenaWidth/2) - 1;

  //applePlaceholder.position.set(xPosition, yPosition, zPosition);

  // Instantiate the loader
  const loader = new GLTFLoader();

  // Load a glTF resource
  loader.load(
    // resource URL
    modelFile,
    // called when the resource is loaded
    function (gltf) {
      const appleModel = gltf.scene;

      // Set the scale and position of your model if needed
      //appleModel.scale.set(0.2, 0.2, 0.2);
      appleModel.scale.set(scale,scale,scale);
      appleModel.position.set(xPosition, yPosition, zPosition);

      // Add the model to the placeholder object
      applePlaceholder.add(appleModel);
    },
    // called while loading is progressing
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    // called when loading has errors
    function (error) {
      console.log("An error happened while loading the model", error);
    }
  );
  applePlaceholder.model = model;
  return applePlaceholder;
}


//////////////////  start of SnakeGame component ////////////////////
function SnakeGame({ onGameOver, updateScore, updateCurrentRoundApples, updateCurrentRoundBananas, gameSettings, score, bananaScore, currentRoundApples, currentRoundBananas, appleIcon, bananaIcon }) {
  const [currentScore, setCurrentScore] = useState(0);
  const [currentRoundBananaScore, setCurrentRoundBananaScore] = useState(0);
  const [invincibilityTimeLeft, setInvincibilityTimeLeft] = useState(0);
  const [magnetTimeLeft, setMagnetTimeLeft] = useState(0);
  const [appleMultiplier, setAppleMultiplier] = useState(1);
  const [speedMultiplier, setSpeedMultiplier] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const gameStartTime = useRef(Date.now()); // Store the starting time in a ref
  const snakeRef = useRef(null);
  const increaseScore = () => {
    setCurrentScore((prevScore) => {
      const newScore = prevScore + appleMultiplier;
      //updateScore(newScore); // Update the score in App component and localStorage
      updateCurrentRoundApples(newScore); // Update the score in App component and localStorage
      return newScore;
    });
  };
  const increaseBananaScore = () => {
    setCurrentRoundBananaScore((prevBananaScore) => {
      const newBananaScore = parseInt(prevBananaScore, 10) + 1;
      updateCurrentRoundBananas(newBananaScore); // Update the score in App component
      return newBananaScore;
    });
  };
  const collisionThreshold = 0.75;
  const walls = [];
  /*const increaseScore = () => {
    updateCurrentRoundApples(currentRoundApples + 1);
    // other logic
  };*/
  // Function to handle game over logic
  function gameOver() {
    // Placeholder function for when the snake collides with itself or a wall
    console.log("Game Over!");
    //alert("GAME OVER");
    setCurrentScore((prevScore) => {
      const newScore = prevScore;
      //updateScore(newScore); // Update the score in App component and localStorage

      console.log("about to game over, will set score: ", newScore);
      setIsGameOver(true);
      //onGameOver(newScore); // Pass the final score back to the parent
      return newScore;
    });
    gameSettings.isMainMenu = true;
    //console.log("about to game over, will set score: ", currentScore);

    //onGameOver(currentScore); // Pass the final score back to the parent
  }

  function randomReward() {
    const rewards = [
      { func: increaseAppleMultiplier, weight: 25 }, // 50% chance
      { func: increaseSpeedMultiplier, weight: 25 }, // 50% chance
      { func: MagnetMode, weight: 25 }, // 30% chance
      { func: invicibilityMode, weight: 25 }, // 20% chance
    ];
  
    // Calculate the total weight
    const totalWeight = rewards.reduce((sum, reward) => sum + reward.weight, 0);
    // Generate a random number between 0 and totalWeight
    let random = Math.random() * totalWeight;
    
    for (let reward of rewards) {
      random -= reward.weight;
      if (random <= 0) {
        reward.func(); 
        return; 
      }
    }
  }
  
  function increaseAppleMultiplier() {
    setAppleMultiplier((multiplier) => {
      return multiplier + 1;
    })
  }

  function increaseSpeedMultiplier() {
    setSpeedMultiplier((multiplier) => {
      console.log("currnt mult", multiplier)
      //let newMultiplier = multiplier + 0.20;
      //snake.speed = gameSettings.snakeSpeed + (newMultiplier*gameSettings.snakeSpeed)
      return Math.round((multiplier + 0.20) * 100) / 100;
    })
  }

  function MagnetMode() {
    gameSettings.isMagnet = true;
    setMagnetTimeLeft(10); // 10 second countdown
  
    // Start a countdown interval
    const countdownInterval = setInterval(() => {
      setMagnetTimeLeft((timeLeft) => {
        if (timeLeft <= 1) {
          clearInterval(countdownInterval); // Clear interval when countdown finishes
          gameSettings.isMagnet = false; // Turn off invincibility
          return 0;
        }
        return timeLeft - 1;
      });
    }, 1000);
  }

  function invicibilityMode() {
    gameSettings.isInvincible = true;
    setInvincibilityTimeLeft(10); // 10 second countdown
  
    // Start a countdown interval
    const countdownInterval = setInterval(() => {
      setInvincibilityTimeLeft((timeLeft) => {
        if (timeLeft <= 1) {
          clearInterval(countdownInterval); // Clear interval when countdown finishes
          gameSettings.isInvincible = false; // Turn off invincibility
          return 0;
        }
        return timeLeft - 1;
      });
    }, 1000);
  }
  

  const mountRef = useRef(null);

  //const snakeSpeed = 0.05;
  const scene = new THREE.Scene();

  const rotationAngle = Math.PI / 18; // 10 degrees in radians
  class Snake {
    directionVector = new THREE.Vector3(0, 0, -1); // Forward direction
    rotationAxis = new THREE.Vector3(0, 1, 0); // Upward axis for left/right rotation
    constructor(scene, textureName) {
      this.speed = gameSettings.snakeSpeed;
      this.head = new SnakeSegment(createMeshForSegment(textureName));
      this.tail = this.head; // Initially the head is also the tail
      this.direction = new THREE.Vector3(0, 0, -1); // Initial movement direction
      if(gameSettings.isMobile) this.grow();
      scene.add(this.head.mesh);
    }

    move(camera) {
      let current = this.tail;
      while (current !== this.head) {
        if (current.next) {
          current.mesh.position.copy(current.next.mesh.position);
        }
        current = current.next;
      }
      // Update the head's position last
      this.head.mesh.position.add(
        //
        this.directionVector.clone().multiplyScalar(this.speed*(1+speedMultiplier))
        //this.directionVector.clone().multiplyScalar(0.15)
      );
      console.log("current speed", this.speed*(1+speedMultiplier))

      // Update the camera to be in a first-person view
      const headPosition = this.head.mesh.position;
      const directionVector = this.directionVector;

      // Calculate the offset position in front of the snake
      const offset = directionVector.clone().multiplyScalar(-0.005);
      if(!gameSettings.isGameOver) {
        camera.position.copy(headPosition).add(offset);
        camera.position.y += 0.5;
        //camera.position.z -= 0.5;
  
        // Adjust the camera's lookAt direction to match the snake's forward direction
        const lookAtPosition = headPosition.clone().add(directionVector);
        camera.lookAt(lookAtPosition);
      }
    }

    rotateLeft() {
      const quaternion = new THREE.Quaternion();
      quaternion.setFromAxisAngle(this.rotationAxis, rotationAngle);
      this.directionVector.applyQuaternion(quaternion);
    }

    rotateRight() {
      const quaternion = new THREE.Quaternion();
      quaternion.setFromAxisAngle(this.rotationAxis, -rotationAngle);
      this.directionVector.applyQuaternion(quaternion);
    }

    growSingle() {
      // Create a new segment that's positioned at the tail's position
      const newSegmentMesh = this.head.mesh.clone();//createMeshForSegment();
      const newSegment = new SnakeSegment(newSegmentMesh);

      // If there's only one segment, place the new one behind the head
      if (this.tail === this.head) {
        const oppositeDirection = new THREE.Vector3()
          .copy(this.directionVector)
          .negate();
        newSegmentMesh.position
          .copy(this.head.mesh.position)
          .add(oppositeDirection);
      } else {
        // If there's more than one segment, place the new one behind the tail
        newSegmentMesh.position.copy(this.tail.mesh.position);
      }

      // Update the linkage
      let placeholder = this.tail;
      this.tail = newSegment;
      this.tail.next = placeholder;

      scene.add(newSegmentMesh); // Add the new segment to the scene
    }

    grow() {      
      for( let i = 0; i < gameSettings.growFactor; i++) {
        this.growSingle();
      }
    }

    getLength() {
      let l = 0;
      let currentSegment = this.tail;
      while(currentSegment !== null) {
        currentSegment = currentSegment.next;
        l++
      }
      return l;
    }

  }  

  function createAISnakes(comCount) {
    // Create AI snakes based on comCount
    const aiSnakes = [];
    for (let i = 0; i < comCount; i++) {
      const aiSnake = new Snake(scene, "snake-skin-badie.jpg"); // Assuming Snake is your snake class
      aiSnake.isAI = true; // Mark it as an AI snake
      // Set the initial position of the AI snake      
      aiSnake.head.mesh.position.set(
        (Math.random() * gameSettings.arenaLength) - (gameSettings.arenaLength / 2),
        0.25, // Assuming this is the height you want the snake at
        (Math.random() * gameSettings.arenaWidth) - (gameSettings.arenaWidth / 2)
      );
      aiSnake.grow();
      aiSnakes.push(aiSnake);
    }
    return aiSnakes;
  }
  
  function getClosestApple(snakePosition, apples) {
    let closestApple = null;
    let minDistance = Infinity;
  
    apples.forEach(apple => {
      const applePosition = apple.position;//apple.children[0].position; // assuming the actual apple model is the first child
      const distance = snakePosition.distanceTo(applePosition);
  
      if (distance < minDistance) {
        minDistance = distance;
        closestApple = apple;
      }
    });
  
    return closestApple;
  }

  function calculateInterceptionDirection(aiSnakePosition, playerSnakePosition, applePosition) {
    // The interception vector is the direction from the AI snake to a point ahead of the player snake.
    // For simplicity, we'll consider the midpoint between the player snake and the apple as that point.
    const midPoint = new THREE.Vector3().addVectors(playerSnakePosition, applePosition).multiplyScalar(0.5);
    return new THREE.Vector3().subVectors(midPoint, aiSnakePosition).normalize();
  }

  function getAvoidanceVector(snakePosition, walls, gameSettings) {
    let avoidanceVector = new THREE.Vector3();
  
    walls.forEach(wall => {
      const directionToWall = new THREE.Vector3().subVectors(wall.position, snakePosition);
      const distanceToWall = directionToWall.length();
  
      // If the snake is too close to a wall, calculate a direction vector that points away from the wall.
      if (distanceToWall < 1 /*gameSettings.wallAvoidanceDistance*/) {
        avoidanceVector.sub(directionToWall.normalize());
      }
    });
  
    return avoidanceVector;
  }

  function getAvoidanceVectorAgainstSnakes(aiSnakePosition, aiSnakes, playerSnake) {
    let avoidanceVector = new THREE.Vector3();
  
    // Check against other AI snakes
    aiSnakes.forEach(otherAISnake => {
      if (otherAISnake.head.mesh.position !== aiSnakePosition) { // Exclude self
        const directionToSnake = new THREE.Vector3().subVectors(otherAISnake.head.mesh.position, aiSnakePosition);
        const distanceToSnake = directionToSnake.length();
  
        if (distanceToSnake < gameSettings.snakeAvoidanceDistance) {
          avoidanceVector.sub(directionToSnake.normalize());
        }
      }
    });
  
    // Check against the player snake
    const directionToPlayerSnake = new THREE.Vector3().subVectors(playerSnake.head.mesh.position, aiSnakePosition);
    const distanceToPlayerSnake = directionToPlayerSnake.length();
    if (distanceToPlayerSnake < gameSettings.snakeAvoidanceDistance) {
      avoidanceVector.sub(directionToPlayerSnake.normalize());
    }
  
    return avoidanceVector;
  }
  

  function updateAISnakes(aiSnakes, apples, scene, camera, gameSettings, playerSnake) {
    aiSnakes.forEach(aiSnake => {
      // Prioritize closest apple
    const closestApple = getClosestApple(aiSnake.head.mesh.position, apples);
    if (!closestApple) return;  // Ensure there's an apple to target

    const appleDirection = closestApple.position.clone().sub(aiSnake.head.mesh.position).normalize();

    // Competitive Behavior: If the player is close to the apple, try to cut them off
    if (playerSnake.head.mesh.position.distanceTo(closestApple.position) < gameSettings.competitionThreshold) {
      const interceptionDirection = calculateInterceptionDirection(aiSnake.head.mesh.position, playerSnake.head.mesh.position, closestApple.position);
      if (interceptionDirection) {
        appleDirection.lerp(interceptionDirection, 0.5); // Blend the direction to still consider the apple
      }
    }

    // Basic Collision Avoidance: Avoid walls and snakes
    const avoidanceVector = getAvoidanceVector(aiSnake.head.mesh.position, walls, gameSettings).add(
      getAvoidanceVectorAgainstSnakes(aiSnake.head.mesh.position, aiSnakes, playerSnake)
    );

    // Combine seeking and avoidance behaviors
    const movementDirection = new THREE.Vector3().addVectors(appleDirection, avoidanceVector).normalize();

    // Apply the movement direction to AI snake's current direction, ensure it's not zero
    if (!movementDirection.lengthSq()) {
      console.error("Zero length movement direction");
      movementDirection.set(0, 0, -1); // Default direction if zero
    }

    aiSnake.directionVector.lerp(movementDirection, 0.1).normalize();

    // Move AI snake forward based on the direction
    aiSnake.move(camera); // Assume move function handles position update based on directionVector and speed
        
      apples.forEach((apple, index) => {
        if (
          apple.children[0] &&
          aiSnake.head.mesh.position.distanceTo(apple.children[0].position) <
            0.75
        ) {
          aiSnake.grow();
          // Remove apple from scene and apples array
          scene.remove(apple);
          apples.splice(index, 1);
          // Add a new apple to replace the eaten one
          
          const newApple = createNewApple(gameSettings.arenaLength, gameSettings.arenaWidth, 1);
          scene.add(newApple);
          apples.push(newApple);
        }
      });
    });
  }
  
  

  

  //////////////////////// on mount ////////////////
  useEffect(() => {
    gameSettings.isGameOver = false;
    setCurrentRoundBananaScore(0);
    const savedScore = localStorage.getItem("score");
    /*if (savedScore) {
      setCurrentScore(parseInt(savedScore, 10)); // Retrieve and parse the saved score
    }    */
      setCurrentScore(0); // Retrieve and parse the saved score

    function gameOverExplode() {
      gameSettings.isGameOver = true;
        
        // Add randomness to each segment's direction
        let currentSegment = snake.tail;
        while (currentSegment !== null) {
          const explosionForce = new THREE.Vector3(
            (Math.random() - 0.5) * explosionStrength,
            (Math.random() - 0.5) * explosionStrength,
            (Math.random() - 0.5) * explosionStrength
          );
          //console.log("explosion", explosionForce)
      
          // This assumes you have a velocity property on your segments,
          // you might need to add this
          currentSegment.velocity = explosionForce;
      
          currentSegment = currentSegment.next;
        }
        //console.log("snake",snake)
      
        // Wait a few seconds before proceeding with the rest of the gameOver logic
        setTimeout(() => {
          // Your existing gameOver logic here
          gameOver();
          // ... other cleanup and state resetting logic
        }, explosionDuration);
      
        // Start the explosion animation loop
        startExplosionAnimation();
      }
      
      const explosionStrength = 0.5; // Adjust the strength of the explosion as needed
      const explosionDuration = 1000; // Duration of the explosion animation in milliseconds

      function startExplosionAnimation() {
        const explosionStartTime = Date.now();
        
        // Record the camera's starting position and the snake's head position
        const cameraStartPosition = camera.position.clone();
        const cameraStartLookAt = snake.head.mesh.position.clone();
      
        // Calculate the direction vector for the camera to move backwards
        const cameraBackwardDirection = new THREE.Vector3()
          .subVectors(camera.position, cameraStartLookAt)
          .normalize();
        
        const cameraUpwardMovement = new THREE.Vector3(0, 1, 0); // Move the camera upwards
      
        function animateExplosion() {
          const now = Date.now();
          const elapsedTime = now - explosionStartTime;
          
          if (elapsedTime > explosionDuration) {
            // Stop the animation after the duration has passed
            return;
          }
      
          requestAnimationFrame(animateExplosion);
          
          // Animate each segment's position based on its velocity
          let currentSegment = snake.head;
          while (currentSegment !== null) {
            // Update each segment's position based on its velocity
            if (currentSegment.velocity) {
              currentSegment.mesh.position.add(currentSegment.velocity);
            }
            currentSegment = currentSegment.next;
          }
          
          // Update the camera position to move it upward and backward
          const explosionProgress = elapsedTime / explosionDuration;
          camera.position.lerpVectors(
            cameraStartPosition,
            new THREE.Vector3()
              .addVectors(cameraStartPosition, cameraBackwardDirection.multiplyScalar(explosionProgress * cameraBackwardDistance))
              .add(cameraUpwardMovement.multiplyScalar(explosionProgress * cameraUpwardDistance)),
            explosionProgress
          );
      
          // Ensure the camera is still looking at the initial explosion point
          camera.lookAt(cameraStartLookAt);
      
          // Render the scene again here if needed
        }
      
        animateExplosion();
      }
      
      const cameraBackwardDistance = 5; // How far back the camera should move
      const cameraUpwardDistance = 5; // How far up the camera should move
      

    // Basic Scene Setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 10); // Elevated and behind the snake
    camera.lookAt(0, 0, 0);

    /// add second camera (mini-map)
    const miniMapSize = { width: 150, height: 150 }; // Size of the mini-map in pixels
    const miniMapCamera = new THREE.OrthographicCamera(
      -10,
      20,
      20,
      -10,
      1,
      1000
    );
    miniMapCamera.up = new THREE.Vector3(0, 0, -1);
    miniMapCamera.position.set(0, 100, 0); // Positioned above the center of the floor
    miniMapCamera.lookAt(scene.position);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(/*0x404040*/ 0xffffff); // Soft white light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(0, 10, 5);
    scene.add(directionalLight);

    /*const spotlight = new THREE.SpotLight(0xffffff);
        spotlight.position.set(0, 5, 0);
        spotlight.angle = Math.PI / 4;
        spotlight.penumbra = 0.05;
        spotlight.decay = 2;
        spotlight.distance = 50;
    
        scene.add(spotlight);*/

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Initialize the snake and apples in the useEffect
    const snake = new Snake(scene, "snake-skin2.jpg"); // Pass the scene object to the Snake constructor
    snakeRef.current = snake;
    const apples = []; // Array to hold the apple objects
    const dice = []; // Array to hold the dice objects

    scene.add(createSky(gameSettings.arenaAssets[0]));

    let newApple;
    for(let i = 0; i < gameSettings.startingApples; i++) {
      newApple = createNewApple(gameSettings.arenaLength, gameSettings.arenaWidth, 1);
      scene.add(newApple);
      apples.push(newApple);
    }
    
    const aiSnakes = createAISnakes(gameSettings.comCount);
    /*let newDice = createNewApple(gameSettings.arenaLength, gameSettings.arenaWidth, 2);
    scene.add(newDice);
    dice.push(newDice);*/

    // ... existing useEffect logic
    // Include the 'snake' and 'apples' variables in your render loop or collision checks
    // Floor setup
    const floorGeometry = new THREE.PlaneGeometry(gameSettings.arenaLength, gameSettings.arenaWidth); // This can be adjusted to the desired size
    //const floorTexture = new THREE.TextureLoader().load("grass.jpg");
    const floorTexture = new THREE.TextureLoader().load(gameSettings.arenaAssets[2]);
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(10, 10);

    const floorMaterial = new THREE.MeshStandardMaterial({
      map: floorTexture,
      //color: 0x808080,
      side: THREE.DoubleSide,
    });
    const floorMinimapMaterial = new THREE.MeshBasicMaterial({
      color: "rgba(0,0,0,0.5)",
      transparent: true,
      opacity: 0.5,
    });

    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; // Rotate the plane to lie flat
    //floor.receiveShadow = true; // Allows the floor to receive shadows
    scene.add(floor);

    /*const wallHeight = 0.5;
    const wallThickness = 0.5;
    const wallLength = 40;*/ // Assuming this is the length of the floor

    const fbWallGeometry = new THREE.BoxGeometry(
      gameSettings.arenaLength,
      gameSettings.wallHeight,
      0.5 // thickness
    );
    const lrWallGeometry = new THREE.BoxGeometry(
      gameSettings.arenaWidth,
      gameSettings.wallHeight,
      0.5 // thickness
    );

    // Wall material can be the same as the floor or different
    //const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
    // Load the rockwall texture
    const textureLoader = new THREE.TextureLoader();
    //const rockWallTexture = textureLoader.load("rockwall.jpg");
    const rockWallTexture = textureLoader.load(gameSettings.arenaAssets[1]); // Replace with the correct path to your texture file
    rockWallTexture.wrapS = THREE.RepeatWrapping;
    rockWallTexture.wrapT = THREE.RepeatWrapping;
    rockWallTexture.repeat.set(30, 1); // Adjust the numbers to get the desired repetition effect

    // Create the material with the texture
    const wallMaterial = new THREE.MeshStandardMaterial({
      map: rockWallTexture,
    });

    // Create and position the walls
    //const walls = [];

    // Wall - Front
    const frontWall = new THREE.Mesh(fbWallGeometry, wallMaterial);
    frontWall.position.set(0, gameSettings.wallHeight / 2, -gameSettings.arenaWidth / 2);
    scene.add(frontWall);
    walls.push(frontWall);

    // Wall - Back
    const backWall = new THREE.Mesh(fbWallGeometry, wallMaterial);
    backWall.position.set(0, gameSettings.wallHeight / 2, gameSettings.arenaWidth / 2);
    scene.add(backWall);
    walls.push(backWall);

    // Wall - Left
    const leftWall = new THREE.Mesh(lrWallGeometry, wallMaterial);
    leftWall.rotation.y = Math.PI / 2; // Rotate the wall to be perpendicular
    leftWall.position.set(-gameSettings.arenaLength / 2, gameSettings.wallHeight / 2, 0);
    scene.add(leftWall);
    walls.push(leftWall);

    // Wall - Right
    const rightWall = new THREE.Mesh(lrWallGeometry, wallMaterial);
    rightWall.rotation.y = Math.PI / 2;
    rightWall.position.set(gameSettings.arenaLength / 2, gameSettings.wallHeight / 2, 0);
    scene.add(rightWall);
    walls.push(rightWall);

    ////////// Handle keyboard buttons
    const handleKeyDown = (event) => {
      switch (event.keyCode) {
        case 37: // left arrow key
          snake.rotateLeft();
          break;
        case 39: // right arrow key
          snake.rotateRight();
          break;
        case 32: // spacebar key
          snake.grow(); // Grow the snake without direction check
          break;
        case 13: // enter key
          gameOverExplode(); // initiate a game over (testing)
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    /////////// handle mobile controlls
    function setupTouchControls() {
      const element = renderer.domElement; // Assuming 'renderer' is your THREE.WebGLRenderer instance

      let isTouching = false;
      let touchStartX = 0;
      let touchCurrentX = 0;

      element.addEventListener(
        "touchstart",
        (event) => {
          //if(event.touches[0].clientY < 50) gameOver();
          isTouching = true;
          touchStartX = event.touches[0].clientX;
          // Prevent the browser from performing the default actions
          event.preventDefault();
        },
        { passive: false }
      );

      element.addEventListener(
        "touchmove",
        (event) => {
          if (isTouching) {
            touchCurrentX = event.touches[0].clientX;
          }
          // Prevent the browser from performing the default actions
          event.preventDefault();
        },
        { passive: false }
      );

      element.addEventListener("touchend", () => {
        isTouching = false;
      });

      // Function to update snake direction based on touch
      function updateSnakeDirectionBasedOnTouch() {
        if (!isTouching) return;

        const widthHalf = window.innerWidth / 2;
        const touchDelta = touchCurrentX - touchStartX;
        const sensitivity = 0.08; // Adjust this value based on testing

        // Calculate turn based on how far from center the touch is
        let turnAmount = -1 * (touchDelta / widthHalf) * sensitivity;
        turnAmount = Math.max(-1, Math.min(1, turnAmount)); // Clamp the value between -1 and 1

        if (turnAmount !== 0) {
          snake.directionVector.applyAxisAngle(
            new THREE.Vector3(0, 1, 0),
            turnAmount
          );
        }
      }

      return updateSnakeDirectionBasedOnTouch;
    }

    const updateSnakeDirectionBasedOnTouch = setupTouchControls();

    function checkCollision() {
      // Get the snake head position
      const snakeHeadPos = snake.head.mesh.position;

      // Check collision with walls
      const wallPosOriginOffsetX = gameSettings.arenaLength / 2 - 0.5;
      const wallPosOriginOffsetZ = gameSettings.arenaWidth / 2 - 0.5;
      walls.forEach((wall) => {
        if (
          Math.abs(snakeHeadPos.x) >= wallPosOriginOffsetX ||
          Math.abs(snakeHeadPos.z) >= wallPosOriginOffsetZ
        ) {
          // walls are half their length away from center on x and z axis
          gameOverExplode();
        }
      });

      // Check self-collision
        let snakeLength = snake.getLength();
        let currentSegment = snake.tail; // Start checking from the segment after the head
        for(let i = 0; currentSegment !== null; i++) {
          if( snakeLength > 20 && i < snakeLength-20 ) {
            // Calculate the distance between the head and the current segment
            const distance = snakeHeadPos.distanceTo(currentSegment.mesh.position);
            // Define a threshold for when a collision occurs
            if (distance < 0.5) { // segmentSize should be the size of your segments
              gameOverExplode();
              break; // Exit the loop as the game is over
            }
          }
          currentSegment = currentSegment.next; // Move to the next segment
        }

    }

    

    //////////////////////////////// ANIMATE LOOP /////////////////////////////////////
    const animate = () => {
      if(!gameSettings.isMainMenu) {
      requestAnimationFrame(animate); // Loop the animation

      renderer.setScissorTest(false); // Disable scissor test for full canvas rendering
      renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);

console.log("gamesettings", gameSettings);
      // Update snake direction based on touch
      updateSnakeDirectionBasedOnTouch();
      // Here you would also include any updates to the scene, like moving the snake
      //snake.head.mesh.position.add(snake.directionVector.clone().multiplyScalar(snakeSpeed));
      snake.move(camera);
      if(!gameSettings.isInvincible) {
        checkCollision();
      }
      // Check for collision with apples
      apples.forEach((apple, index) => {
        if (
          apple.children[0] &&
          snake.head.mesh.position.distanceTo(apple.children[0].position) <
            collisionThreshold
        ) {
          snake.grow();
          // Check the model type to update the correct score
          if (apple.model === 3) { // If it's a banana
            increaseBananaScore();
          } else if (apple.model === 1) { // If it's an apple
            increaseScore();
          }
          // Remove apple from scene and apples array
          scene.remove(apple);
          apples.splice(index, 1);
          // Add a new apple to replace the eaten one
          let newAppleModel = (Math.random() < gameSettings.bananaRate ? 3 : 1);
          const newApple = createNewApple(gameSettings.arenaLength, gameSettings.arenaWidth, newAppleModel);
          scene.add(newApple);
          apples.push(newApple);
          // randomly also generate a reward dice
          if(Math.random() < gameSettings.rewardRate) { 
            let newDice = createNewApple(gameSettings.arenaLength, gameSettings.arenaWidth, 2);
            scene.add(newDice);
            dice.push(newDice);
          }
        }
        else {
          if(apple.children[0]) apple.children[0].scale.set(0.2,0.2,0.2); // smaller for fp
          // else if magnetMode is on, move apples toward head
          if(gameSettings.isMagnet) {
            if (apple.children[0]) {
              // Calculate the direction from the apple to the snake head
              const direction = new THREE.Vector3()
                .subVectors(snake.head.mesh.position, apple.children[0].position)
                .normalize();
      
              // Move the apple towards the snake head by a small step size
              const stepSize = 0.03; // Adjust step size to control the speed of the movement
              apple.children[0].position.add(direction.multiplyScalar(stepSize));
            }
          }
        }
      });
      // Check for collision with dice
      dice.forEach((die, index) => {
        if (
          die.children[0] &&
          snake.head.mesh.position.distanceTo(die.children[0].position) <
            collisionThreshold
        ) {
          // Remove die from scene and dice array
          scene.remove(die);
          dice.splice(index, 1);
          randomReward();
        }
      });

      // Render the main scene
      floor.material = floorMaterial;
      renderer.render(scene, camera);

      // Now prepare and render the minimap
      if(gameSettings.isTopDownCam) {
        floor.material = floorMinimapMaterial;
        apples.forEach((apple, index) => {
          if(apple.children[0]) apple.children[0].scale.set(0.5,0.5,0.5); // bigger for minimap
        })
        miniMapCamera.position.x = snake.head.mesh.position.x;
        miniMapCamera.position.z = snake.head.mesh.position.z;
        miniMapCamera.lookAt(snake.head.mesh.position);
        renderer.clearDepth(); // Clear the depth buffer
        renderer.setScissorTest(true); // Enable scissor test for rendering in a smaller area
        renderer.setScissor(
          0,
          window.innerHeight - miniMapSize.height,
          miniMapSize.width,
          miniMapSize.height
        );
        renderer.setViewport(
          0,
          window.innerHeight - miniMapSize.height,
          miniMapSize.width,
          miniMapSize.height
        );
        renderer.render(scene, miniMapCamera);
        renderer.setScissorTest(false); // Optionally disable scissor test after rendering the minimap
      }
      updateAISnakes(aiSnakes, apples, scene, camera, gameSettings, snake);
    }
    };

    // Start the animation loop
    animate();

    // Cleanup function to stop the animation when the component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("keydown", handleKeyDown);
      //mountRef.current.removeChild(renderer.domElement);
      if (mountRef.current && renderer.domElement) {
        // Check that both exist
        mountRef.current.removeChild(renderer.domElement);
      }
      cancelAnimationFrame(animate);
      // cleanup - pc version remounts causing two
      scene.remove(snake.head.mesh);
      snake.speed = 0;
      
      snake.head.mesh.position.set(0,0,0);
      //scene.remove(snake.head.mesh);
      let currentSegment2 = snake.tail;
        while (currentSegment2 !== null) {
          currentSegment2.mesh.position.set(0,0,0);
          scene.remove(currentSegment2.mesh);
          currentSegment2 = currentSegment2.next
        }
    };
  }, []); // No dependencies, this effect runs once on mount  

  // this useEffect runs whenever snakespeed changes, updating the snake speed.
  useEffect(() => {
    // Ensure snake instance exists and gameSettings has a snakeSpeed property
    if (snakeRef.current && gameSettings.snakeSpeed) {
      // Adjust the speed based on the multiplier
      snakeRef.current.speed = gameSettings.snakeSpeed * (1 + speedMultiplier);
    }
  }, [speedMultiplier]); // Only re-run the effect if speedMultiplier changes

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
  

  const multiplierDisplay = appleMultiplier > 1 ? (
    <div
      style={{
        position: "absolute",
        bottom: gameSettings.isInvincible ? (gameSettings.isMagnet ? (speedMultiplier > 0 ? "175px" : "120px") : (speedMultiplier > 0 ? "120px" : "65px")) : (gameSettings.isMagnet ? "65px" : "10px"), // Stack above the invincibility display if it exists
        right: "10px", // Positioned 10px from the right
        color: "white",
        fontSize: "24px",
        backgroundColor: "black",
        padding: "10px",
        borderRadius: "5px",
        opacity: 0.5
      }}
    >
      Apple Multiplier: x{appleMultiplier}
    </div>
  ) : null;

  const speedMultiplierDisplay = speedMultiplier > 0 ? (
    <div
      style={{
        position: "absolute",
        bottom: gameSettings.isInvincible ? (gameSettings.isMagnet ? "120px" : "65px") : (gameSettings.isMagnet ? "65px" : "10px"), // Stack above the invincibility display if it exists
        right: "10px", // Positioned 10px from the right
        color: "white",
        fontSize: "24px",
        backgroundColor: "black",
        padding: "10px",
        borderRadius: "5px",
        opacity: 0.5
      }}
    >
      Speed Multiplier: {speedMultiplier*100}%
    </div>
  ) : null;

  const magnetDisplay = gameSettings.isMagnet ? (
    <div
      style={{
        position: "absolute",
        bottom: gameSettings.isInvincible ? "65px" : "10px", // Positioned 10px from the bottom
        right: "10px", // Positioned 10px from the right
        color: "white",
        fontSize: "24px",
        backgroundColor: "black",
        padding: "10px",
        borderRadius: "5px",
        opacity: invincibilityTimeLeft % 2 ? 0.75 : 0.25, // Flash effect
      }}
    >
      Magnet: {magnetTimeLeft}
    </div>
  ) : null;

  const invincibilityDisplay = gameSettings.isInvincible ? (
    <div
      style={{
        position: "absolute",
        bottom: "10px", // Positioned 10px from the bottom
        right: "10px", // Positioned 10px from the right
        color: "white",
        fontSize: "24px",
        backgroundColor: "black",
        padding: "10px",
        borderRadius: "5px",
        opacity: invincibilityTimeLeft % 2 ? 0.75 : 0.25, // Flash effect
      }}
    >
      Invincibility: {invincibilityTimeLeft}
    </div>
  ) : null;
  

  //return <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />;
  return (
    <div
      ref={mountRef}
      style={{ width: "100vw", height: "100vh", position: "relative" }}
    >
    {isGameOver && (
      <GameOverTransition
        totalApples={score}
        roundApples={currentRoundApples}
        totalBananas={bananaScore}
        roundBananas={currentRoundBananas}
        onTransitionEnd={() => {
          setIsGameOver(false); // This will hide the transition screen
          onGameOver(currentRoundApples, currentRoundBananas, "menu"); // This will reset the game or whatever you want to do at the end
        }}
        onTransitionEndBonus={() => {
          setIsGameOver(false); // This will hide the transition screen
          onGameOver(currentRoundApples, currentRoundBananas, "miniGame"); // This will reset the game or whatever you want to do at the end
        }}
      />
    )}
      {scoreDisplay}
      {speedMultiplierDisplay}
      {multiplierDisplay}
      {magnetDisplay}
      {invincibilityDisplay}
    </div>
  );
};

export default SnakeGame;
