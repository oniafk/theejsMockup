import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x00ffff);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 3;
camera.position.y = 1;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);

const geometry = new THREE.IcosahedronGeometry(1, 3);
const material = new THREE.MeshNormalMaterial();
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

const labelPositions = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 0, 1),
];

labelPositions.forEach((position) => {
  position.normalize().multiplyScalar(1.02);
});

const labelElements = document.querySelectorAll(".label");

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function updateLabels() {
  labelPositions.forEach((position, index) => {
    const labelElement = labelElements[index];
    if (!labelElement) return;

    const worldPosition = position.clone();
    sphere.localToWorld(worldPosition);

    const screenPosition = worldPosition.clone().project(camera);

    const x = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-(screenPosition.y * 0.5) + 0.5) * window.innerHeight;

    (
      labelElement as HTMLElement
    ).style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;

    const cameraDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(
      camera.quaternion
    );
    const normalizedPosition = worldPosition
      .clone()
      .sub(sphere.position)
      .normalize();
    const dotProduct = normalizedPosition.dot(cameraDirection);

    if (dotProduct > 0) {
      (labelElement as HTMLElement).style.opacity = "1";
      (labelElement as HTMLElement).style.pointerEvents = "auto";
    } else {
      (labelElement as HTMLElement).style.opacity = "0";
      (labelElement as HTMLElement).style.pointerEvents = "none";
    }
  });
}

function animate() {
  requestAnimationFrame(animate);

  updateLabels();

  controls.update();

  renderer.render(scene, camera);
}

animate();
