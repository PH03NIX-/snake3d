import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// Define classes and functions outside of the SnakeGame component
class SnakeSegment {
  constructor(mesh) {
    this.mesh = mesh; // This is a THREE.Mesh object
    this.next = null; // Reference to the next segment
  }
}

function createSky() {
  // Load the sky texture
  const textureLoader = new THREE.TextureLoader();
  const skyTexture = textureLoader.load("sky.jpg");

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

function createMeshForSegment() {
  // load the texture
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load("snake-skin2.jpg");

  const geometry = new THREE.SphereGeometry(0.5, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    /*color: 0x00ff00*/ map: texture,
  });
  const mesh = new THREE.Mesh(geometry, material);

  // Rotate the cylinder to lay flat on the XZ plane
  mesh.rotation.x = Math.PI / 2;
  // By default, the cylinder's flat top faces the positive Y-axis.
  // After rotating on the X-axis, it will face the positive Z-axis,
  // which should be the initial direction of the snake.

  return mesh;
}

function createNewApple() {
  // Create a placeholder object that represents the apple
  const applePlaceholder = new THREE.Object3D();

  // Set position
  const xPosition = Math.random() * 10 - 5;
  const yPosition = 0.25;
  const zPosition = Math.random() * 10 - 5;

  //applePlaceholder.position.set(xPosition, yPosition, zPosition);

  // Instantiate the loader
  const loader = new GLTFLoader();

  // Load a glTF resource
  loader.load(
    // resource URL
    "gala-apple3.gltf",
    // called when the resource is loaded
    function (gltf) {
      const appleModel = gltf.scene;

      // Set the scale and position of your model if needed
      appleModel.scale.set(0.2, 0.2, 0.2);
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

  return applePlaceholder;
}


//////////////////  start of SnakeGame component ////////////////////
const SnakeGame = ({ onGameOver, updateScore, score }) => {
    const gameSettings = {
      arenaLength: 40
      , arenaWidth: 40
      , wallHeight: 0.5
      , snakeSpeed: 5
      , startingApples: 3
      , isInvincible: false
      , isTopDownCam: true
      , isGameOver: false
      , isMainMenu: false
    }
  const [currentScore, setCurrentScore] = useState(0);
  const increaseScore = () => {
    setCurrentScore((prevScore) => {
      const newScore = prevScore + 1;
      updateScore(newScore); // Update the score in App component and localStorage
      return newScore;
    });
  };
  // Function to handle game over logic
  function gameOver() {
    // Placeholder function for when the snake collides with itself or a wall
    console.log("Game Over!");
    //alert("GAME OVER");
    setCurrentScore((prevScore) => {
      const newScore = prevScore;
      updateScore(newScore); // Update the score in App component and localStorage

      console.log("about to game over, will set score: ", newScore);

      onGameOver(newScore); // Pass the final score back to the parent
      return newScore;
    });
    gameSettings.isMainMenu = true;
    //console.log("about to game over, will set score: ", currentScore);

    //onGameOver(currentScore); // Pass the final score back to the parent
  }
  const mountRef = useRef(null);

  const snakeSpeed = 0.05;
  const scene = new THREE.Scene();

  const rotationAngle = Math.PI / 18; // 10 degrees in radians
  class Snake {
    directionVector = new THREE.Vector3(0, 0, -1); // Forward direction
    rotationAxis = new THREE.Vector3(0, 1, 0); // Upward axis for left/right rotation
    constructor(scene) {
      this.speed = 0.05;
      this.head = new SnakeSegment(createMeshForSegment());
      this.tail = this.head; // Initially the head is also the tail
      this.direction = new THREE.Vector3(0, 0, -1); // Initial movement direction
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
        this.directionVector.clone().multiplyScalar(this.speed)
      );

      // Update the camera to be in a first-person view
      const headPosition = this.head.mesh.position;
      //headPosition.add(this.directionVector.clone().multiplyScalar(snakeSpeed));
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

    grow() {
      /*const newSegment = new SnakeSegment(createMeshForSegment());
        const newPosition = this.head.mesh.position.clone().sub(this.directionVector.clone().multiplyScalar(snakeSpeed));
        newSegment.mesh.position.copy(newPosition);
        this.tail.next = newSegment; // Link the new segment to the current tail
        this.tail = newSegment; // Update the tail reference to the new segment
        scene.add(newSegment.mesh); // Add new segment to the scene
        console.log(this);*/
      // Create a new segment that's positioned at the tail's position
      const newSegmentMesh = createMeshForSegment();
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
      //this.tail.next = newSegment;
      let placeholder = this.tail;
      this.tail = newSegment;
      this.tail.next = placeholder;

      scene.add(newSegmentMesh); // Add the new segment to the scene
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

  

  //////////////////////// on mount ////////////////
  useEffect(() => {
    gameSettings.isGameOver = false;
    const savedScore = localStorage.getItem("score");
    if (savedScore) {
      setCurrentScore(parseInt(savedScore, 10)); // Retrieve and parse the saved score
    }

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
      
      
      function startExplosionAnimation() {
        const explosionStartTime = Date.now();
        
        function animateExplosion() {
          const now = Date.now();
          const elapsedTime = now - explosionStartTime;
          
          if (elapsedTime > explosionDuration) {
            // Stop the animation after the duration has passed
            return;
          }
      
          requestAnimationFrame(animateExplosion);
          
          let currentSegment = snake.head;
          while (currentSegment !== null) {
            // Update each segment's position based on its velocity
            if (currentSegment.velocity) {
              currentSegment.mesh.position.add(currentSegment.velocity);
            }
            currentSegment = currentSegment.next;
          }
      
          // Render the scene again here if needed
        }
      
        animateExplosion();
      }
      

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
    const miniMapSize = { width: 200, height: 200 }; // Size of the mini-map in pixels
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
    const snake = new Snake(scene); // Pass the scene object to the Snake constructor
    const apples = []; // Array to hold the apple objects
    /*apples.push(createNewApple(scene)); // Add an initial apple to the scene
        apples.push(createNewApple(scene)); // Add an initial apple to the scene
        apples.push(createNewApple(scene)); // Add an initial apple to the scene
        apples.push(createNewApple(scene)); // Add an initial apple to the scene
        apples.push(createNewApple(scene)); // Add an initial apple to the scene*/

    scene.add(createSky());

    let newApple = createNewApple();
    scene.add(newApple);
    apples.push(newApple);
    /*newApple = createNewApple();
    scene.add(newApple);
    apples.push(newApple);
    newApple = createNewApple();
    scene.add(newApple);
    apples.push(newApple);*/

    // ... existing useEffect logic
    // Include the 'snake' and 'apples' variables in your render loop or collision checks
    // Floor setup
    const floorGeometry = new THREE.PlaneGeometry(40, 40); // This can be adjusted to the desired size
    const floorTexture = new THREE.TextureLoader().load("grass.jpg");
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

    const wallHeight = 0.5;
    const wallThickness = 0.5;
    const wallLength = 40; // Assuming this is the length of the floor

    const wallGeometry = new THREE.BoxGeometry(
      wallLength,
      wallHeight,
      wallThickness
    );

    // Wall material can be the same as the floor or different
    //const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
    // Load the rockwall texture
    const textureLoader = new THREE.TextureLoader();
    const rockWallTexture = textureLoader.load("rockwall.jpg"); // Replace with the correct path to your texture file
    rockWallTexture.wrapS = THREE.RepeatWrapping;
    rockWallTexture.wrapT = THREE.RepeatWrapping;
    rockWallTexture.repeat.set(30, 1); // Adjust the numbers to get the desired repetition effect

    // Create the material with the texture
    const wallMaterial = new THREE.MeshStandardMaterial({
      map: rockWallTexture,
    });

    // Create and position the walls
    const walls = [];

    // Wall - Front
    const frontWall = new THREE.Mesh(wallGeometry, wallMaterial);
    frontWall.position.set(0, wallHeight / 2, -wallLength / 2);
    scene.add(frontWall);
    walls.push(frontWall);

    // Wall - Back
    const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
    backWall.position.set(0, wallHeight / 2, wallLength / 2);
    scene.add(backWall);
    walls.push(backWall);

    // Wall - Left
    const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    leftWall.rotation.y = Math.PI / 2; // Rotate the wall to be perpendicular
    leftWall.position.set(-wallLength / 2, wallHeight / 2, 0);
    scene.add(leftWall);
    walls.push(leftWall);

    // Wall - Right
    const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
    rightWall.rotation.y = Math.PI / 2;
    rightWall.position.set(wallLength / 2, wallHeight / 2, 0);
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
          snake.grow(); snake.grow();snake.grow();snake.grow();snake.grow();snake.grow();snake.grow(); // Grow the snake without direction check
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
      const wallPosOriginOffset = wallLength / 2 - 0.5;
      walls.forEach((wall) => {
        if (
          Math.abs(snakeHeadPos.x) >= wallPosOriginOffset ||
          Math.abs(snakeHeadPos.z) >= wallPosOriginOffset
        ) {
          // walls are half their length away from center on x and z axis
          snakeHeadPos.x = 0;
          snakeHeadPos.z = 0;
          gameOverExplode();
        }
      });

      // Check self-collision
        let snakeLength = snake.getLength();
        console.log("sl", snakeLength)
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

      // Check self-collision
      //console.log("snake: ", snake);
      /*snake.bodySegments.forEach(segment => {
          if (segment !== snake.head && snakeHeadPos.equals(segment.mesh.position)) {
            gameOver();
          }
        });*/
    }

    // Animation loop
    /*snake.grow();
        snake.grow();
        snake.grow();*/

    const collisionThreshold = 0.75;
    const growFactor = 35;
    //////////////////////////////// ANIMATE LOOP /////////////////////////////////////
    const animate = () => {
      if(!gameSettings.isMainMenu) {
      requestAnimationFrame(animate); // Loop the animation

      renderer.setScissorTest(false); // Disable scissor test for full canvas rendering
      renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);

      // Update snake direction based on touch
      updateSnakeDirectionBasedOnTouch();
      // Here you would also include any updates to the scene, like moving the snake
      //snake.head.mesh.position.add(snake.directionVector.clone().multiplyScalar(snakeSpeed));
      snake.move(camera);
      checkCollision();
      // Check for collision with apples
      apples.forEach((apple, index) => {
        //console.log("apple distance: ", snake.head.mesh.position.distanceTo(apple.children[0].position));
        //console.log(snake.head.mesh.position, apple.children[0].position);
        if (
          apple.children[0] &&
          snake.head.mesh.position.distanceTo(apple.children[0].position) <
            collisionThreshold
        ) {
          for (let i = 0; i < growFactor; i++) {
            snake.grow();
          }
          // Remove apple from scene and apples array
          scene.remove(apple);
          apples.splice(index, 1);
          // Add a new apple to replace the eaten one
          const newApple = createNewApple();
          scene.add(newApple);
          apples.push(newApple);
          increaseScore();
        }
      });

      // Render the main scene
      floor.material = floorMaterial;
      renderer.render(scene, camera);

      // Now prepare and render the minimap
      floor.material = floorMinimapMaterial;
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

  const scoreDisplay = (
    <div
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        color: "black",
      }}
    >
      {currentScore} apples
    </div>
  );

  //return <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />;
  return (
    <div
      ref={mountRef}
      style={{ width: "100vw", height: "100vh", position: "relative" }}
    >
      {scoreDisplay}
      {/* ...rest of your code */}
    </div>
  );
};

export default SnakeGame;
