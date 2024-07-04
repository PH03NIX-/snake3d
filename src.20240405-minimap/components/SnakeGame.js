import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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
    const skyTexture = textureLoader.load('sky.jpg');
    
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
  /*const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;*/
    // Define cylinder geometry with flat sides along the XZ plane
    /*const radiusTop = 0.25; // radius of the cylinder at the top
    const radiusBottom = 0.25; // radius of the cylinder at the bottom
    const height = 0.5; // height of the cylinder
    const radialSegments = 8; // number of segmented faces around the circumference of the cylinder
*/
    // load the texture
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('snake-skin2.jpg'); 
    /*texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(0.5, 0.5);*/

    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshStandardMaterial({ /*color: 0x00ff00*/ map: texture });
    const mesh = new THREE.Mesh(geometry, material);

    // Rotate the cylinder to lay flat on the XZ plane
    mesh.rotation.x = Math.PI / 2;
    // By default, the cylinder's flat top faces the positive Y-axis.
    // After rotating on the X-axis, it will face the positive Z-axis,
    // which should be the initial direction of the snake.

    return mesh;
}

function createNewApple() {
  // Replace with your logic to position apples randomly within the play area
  /*const appleGeometry = new THREE.SphereGeometry(0.25, 16, 16);
  const appleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const apple = new THREE.Mesh(appleGeometry, appleMaterial);
  apple.position.set(
    Math.random() * 10 - 5,
    0.25,
    Math.random() * 10 - 5
  );
  return apple;*/
  // Create a placeholder object that represents the apple
  const applePlaceholder = new THREE.Object3D();

  // Instantiate the loader
  const loader = new GLTFLoader();
  
  // Load a glTF resource
  loader.load(
    // resource URL (update this to the path to your apple model)
    'gala-apple3.gltf',
    // called when the resource is loaded
    function (gltf) {
      const appleModel = gltf.scene;
      
      // Set the scale and position of your model if needed
      appleModel.scale.set(0.2, 0.2, 0.2);
      appleModel.position.set(
        Math.random() * 10 - 5,
        0.25,
        Math.random() * 10 - 5
      );
      
      // Add the model to the placeholder object
      applePlaceholder.add(appleModel);

      // Also add the model to the scene if necessary
      // Note: You might need to handle this differently depending on your app's logic
      //scene.add(appleModel);
    },
    // called while loading is progressing
    function (xhr) {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    // called when loading has errors
    function (error) {
      console.log('An error happened while loading the model', error);
    }
  );
  
  return applePlaceholder;
}

// Sample collision threshold
const collisionThreshold = 0.5;

// Define boundaries for the play area
const wallLeft = -5;
const wallRight = 5;
const wallFront = -5;
const wallBack = 5;

// Function to handle game over logic
function gameOver() {
  // Placeholder function for when the snake collides with itself or a wall
  console.log('Game Over!');
}

const SnakeGame = () => {
    const mountRef = useRef(null);
    
    const snakeSpeed = 0.05;
    const scene = new THREE.Scene();
    
    const rotationAngle = Math.PI / 18; // 10 degrees in radians
    class Snake {
        directionVector = new THREE.Vector3(0, 0, -1); // Forward direction
        rotationAxis = new THREE.Vector3(0, 1, 0); // Upward axis for left/right rotation
        constructor(scene) {
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
        this.head.mesh.position.add(this.directionVector.clone().multiplyScalar(snakeSpeed));
        
        // Update the camera to be in a first-person view
        const headPosition = this.head.mesh.position;
        //headPosition.add(this.directionVector.clone().multiplyScalar(snakeSpeed));
        const directionVector = this.directionVector;

        // Calculate the offset position in front of the snake
        const offset = directionVector.clone().multiplyScalar(-0.005);
        camera.position.copy(headPosition).add(offset);
        camera.position.y += 0.5;
        //camera.position.z -= 0.5;

        // Adjust the camera's lookAt direction to match the snake's forward direction
        const lookAtPosition = headPosition.clone().add(directionVector);
        camera.lookAt(lookAtPosition);
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
      const oppositeDirection = new THREE.Vector3().copy(this.directionVector).negate();
      newSegmentMesh.position.copy(this.head.mesh.position).add(oppositeDirection);
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
}

    useEffect(() => {
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
            -10, 10, 10, -10, 1, 1000
        );
        miniMapCamera.up = new THREE.Vector3(0, 0, -1);
        miniMapCamera.position.set(0, 100, 0); // Positioned above the center of the floor
        miniMapCamera.lookAt(scene.position);


        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(/*0x404040*/0xffffff); // Soft white light
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

        window.addEventListener('resize', handleResize);


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
        newApple = createNewApple();
        scene.add(newApple);
        apples.push(newApple);
        newApple = createNewApple();
        scene.add(newApple);
        apples.push(newApple);

        // ... existing useEffect logic
        // Include the 'snake' and 'apples' variables in your render loop or collision checks
        // Floor setup
        const floorGeometry = new THREE.PlaneGeometry(40, 40); // This can be adjusted to the desired size
        const floorTexture = new THREE.TextureLoader().load('grass.jpg');
        floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(10,10);

        const floorMaterial = new THREE.MeshStandardMaterial({
            map: floorTexture,
            //color: 0x808080,
            side: THREE.DoubleSide
        });        
        const floorMinimapMaterial = new THREE.MeshBasicMaterial({
            color: 'rgba(0,0,0,0.5)', 
            transparent: true,
            opacity: 0.5,
        });

        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2; // Rotate the plane to lie flat
        //floor.receiveShadow = true; // Allows the floor to receive shadows
        scene.add(floor);

    // Handle arrow key presses to update snake direction
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
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        /// mobile controlls
        function setupTouchControls() {
            const element = renderer.domElement; // Assuming 'renderer' is your THREE.WebGLRenderer instance
        
            let isTouching = false;
            let touchStartX = 0;
            let touchCurrentX = 0;
        
            element.addEventListener('touchstart', (event) => {
                isTouching = true;
                touchStartX = event.touches[0].clientX;
                // Prevent the browser from performing the default actions
                event.preventDefault();
            }, { passive: false });
        
            element.addEventListener('touchmove', (event) => {
                if (isTouching) {
                    touchCurrentX = event.touches[0].clientX;
                }
                // Prevent the browser from performing the default actions
                event.preventDefault();
            }, { passive: false });
        
            element.addEventListener('touchend', () => {
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
                    snake.directionVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), turnAmount);
                }
            }
        
            return updateSnakeDirectionBasedOnTouch;
        }
        
        const updateSnakeDirectionBasedOnTouch = setupTouchControls();

        // Animation loop 
        /*snake.grow();
        snake.grow();
        snake.grow();*/
        const growFactor = 10;
        const animate = () => {
            requestAnimationFrame(animate); // Loop the animation

            renderer.setScissorTest(false); // Disable scissor test for full canvas rendering
            renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
                        
            // Update snake direction based on touch
            updateSnakeDirectionBasedOnTouch();
            // Here you would also include any updates to the scene, like moving the snake
            //snake.head.mesh.position.add(snake.directionVector.clone().multiplyScalar(snakeSpeed));
            snake.move(camera);
            // Check for collision with apples
            apples.forEach((apple, index) => {
                if (snake.head.mesh.position.distanceTo(apple.position) < collisionThreshold) {
                    for(let i = 0; i < growFactor; i++) {
                        snake.grow();
                    }
                    // Remove apple from scene and apples array
                    scene.remove(apple);
                    apples.splice(index, 1);
                    // Add a new apple to replace the eaten one
                    const newApple = createNewApple();
                    scene.add(newApple);
                    apples.push(newApple);
                }
            });

            // Render the main scene
            floor.material = floorMaterial;
            renderer.render(scene, camera);

            // Now prepare and render the minimap
            floor.material = floorMinimapMaterial;
            renderer.clearDepth(); // Clear the depth buffer
            renderer.setScissorTest(true); // Enable scissor test for rendering in a smaller area
            renderer.setScissor(0, window.innerHeight - miniMapSize.height, miniMapSize.width, miniMapSize.height);
            renderer.setViewport(0, window.innerHeight - miniMapSize.height, miniMapSize.width, miniMapSize.height);
            renderer.render(scene, miniMapCamera);
            renderer.setScissorTest(false); // Optionally disable scissor test after rendering the minimap
        };

        // Start the animation loop
        animate();

        // Cleanup function to stop the animation when the component unmounts
        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('keydown', handleKeyDown);
            mountRef.current.removeChild(renderer.domElement);
            cancelAnimationFrame(animate);
        };
    }, []); // No dependencies, this effect runs once on mount

    return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default SnakeGame;
