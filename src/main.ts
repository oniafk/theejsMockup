import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Create scene
const scene = new THREE.Scene();
// Set cyan background (RGB: 0, 255, 255)
scene.background = new THREE.Color(0x00ffff);

// Create camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 3;
camera.position.y = 1;

// Create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Add grid helper
const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);

// Create icosahedron (sphere-like) with normal material
const geometry = new THREE.IcosahedronGeometry(1, 3); // Radius 1, detail level 3 for smoother appearance
const material = new THREE.MeshNormalMaterial();
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// Create points on the sphere surface with different positions for better distribution
const labelPositions = [
  new THREE.Vector3(1, 0, 0), // Position for YouTube (right)
  new THREE.Vector3(0, 1, 0), // Position for GitHub (top)
  new THREE.Vector3(0, 0, 1), // Position for Upwork (front)
];

// Normalize vectors to place them on sphere surface and move slightly outward
labelPositions.forEach((position) => {
  position.normalize().multiplyScalar(1.02); // Slightly outside sphere surface
});

// Label HTML elements
const labelElements = document.querySelectorAll(".label");

// Add orbit controls for mouse interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Update label positions and visibility
function updateLabels() {
  // Convert 3D positions to screen coordinates
  labelPositions.forEach((position, index) => {
    const labelElement = labelElements[index];
    if (!labelElement) return;

    // Get world position (accounting for sphere's transformation)
    const worldPosition = position.clone();
    sphere.localToWorld(worldPosition);

    // Project 3D position to 2D screen coordinates
    const screenPosition = worldPosition.clone().project(camera);

    // Convert to pixel coordinates
    const x = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-(screenPosition.y * 0.5) + 0.5) * window.innerHeight;

    // Update label position
    (
      labelElement as HTMLElement
    ).style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;

    // Calculate dot product to determine if point faces camera
    const cameraDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(
      camera.quaternion
    );
    const normalizedPosition = worldPosition
      .clone()
      .sub(sphere.position)
      .normalize();
    const dotProduct = normalizedPosition.dot(cameraDirection);

    // Show label only when facing camera (dot product < 0 means facing away)
    if (dotProduct > 0) {
      (labelElement as HTMLElement).style.opacity = "1";
      (labelElement as HTMLElement).style.pointerEvents = "auto";
    } else {
      (labelElement as HTMLElement).style.opacity = "0";
      (labelElement as HTMLElement).style.pointerEvents = "none";
    }
  });
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Update label positions
  updateLabels();

  // Update controls (needed for damping)
  controls.update();

  // Render
  renderer.render(scene, camera);
}

animate();
