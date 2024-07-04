import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

// Define classes and functions outside of the SnakeGame component
class SnakeSegment {
  constructor(mesh) {
    this.mesh = mesh; // This is a THREE.Mesh object
    this.next = null; // Reference to the next segment
  }
}

class Snake {
  constructor(scene) {
    this.head = new SnakeSegment(createMeshForSegment());
    this.tail = this.head; // Initially the head is also the tail
    this.direction = new THREE.Vector3(0, 0, -1); // Initial movement direction
    scene.add(this.head.mesh);
  }

  move() {
    // Move each segment to the position of the next one
    let segment = this.head;
    while (segment.next) {
      segment.mesh.position.copy(segment.next.mesh.position);
      segment = segment.next;
    }
    // Move the head in the current direction
    this.head.mesh.position.add(this.direction);
  }

  grow() {
    const newSegment = new SnakeSegment(createMeshForSegment());
    this.tail.next = newSegment;
    this.tail = newSegment;
    // Position it initially at the tail's previous position
    newSegment.mesh.position.copy(this.tail.mesh.position);
  }
}

function createMeshForSegment() {
  const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

function createNewApple() {
  // Replace with your logic to position apples randomly within the play area
  const appleGeometry = new THREE.SphereGeometry(0.25, 16, 16);
  const appleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const apple = new THREE.Mesh(appleGeometry, appleMaterial);
  apple.position.set(
    Math.random() * 10 - 5,
    0.25,
    Math.random() * 10 - 5
  );
  return apple;
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

    useEffect(() => {
    // Basic Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 5, 10); // Elevated and behind the snake
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.physicallyCorrectLights = true;
    renderer.gammaFactor = 2.2;
    renderer.gammaOutput = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    mountRef.current.appendChild(renderer.domElement);
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(0, 10, 5);
    scene.add(directionalLight);

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
    apples.push(createNewApple(scene)); // Add an initial apple to the scene

    // ... existing useEffect logic
    // Include the 'snake' and 'apples' variables in your render loop or collision checks


    window.addEventListener('resize', handleResize);

  }, []); // No dependencies, this effect runs once on mount

  return <div ref={mountRef} />;
};

export default SnakeGame;
