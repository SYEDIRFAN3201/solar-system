const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 60;

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("solarCanvas") });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const planetsData = [
  { name: "Mercury", size: 1, distance: 8, color: 0xaaaaaa, speed: 0.01 },
  { name: "Venus", size: 1.5, distance: 12, color: 0xffcc99, speed: 0.008 },
  { name: "Earth", size: 1.7, distance: 16, color: 0x3399ff, speed: 0.006 },
  { name: "Mars", size: 1.3, distance: 20, color: 0xff3300, speed: 0.005 },
  { name: "Jupiter", size: 3, distance: 25, color: 0xffcc66, speed: 0.003 },
  { name: "Saturn", size: 2.7, distance: 30, color: 0xffe699, speed: 0.002 },
  { name: "Uranus", size: 2.2, distance: 35, color: 0x66ccff, speed: 0.0015 },
  { name: "Neptune", size: 2.1, distance: 40, color: 0x3333ff, speed: 0.0012 }
];

const planets = [];
const orbits = [];
const speeds = {};
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const tooltip = document.getElementById("tooltip");

// Sun
const sunGeometry = new THREE.SphereGeometry(4, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Planets
planetsData.forEach((planet, i) => {
  const geometry = new THREE.SphereGeometry(planet.size, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: planet.color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = planet.distance;
  mesh.name = planet.name;
  scene.add(mesh);
  planets.push(mesh);
  orbits.push({ angle: 0 });
  speeds[planet.name] = planet.speed;

  const controlDiv = document.getElementById("controls");
  const label = document.createElement("label");
  label.innerText = `${planet.name} Speed: `;
  const input = document.createElement("input");
  input.type = "range";
  input.min = "0.0001";
  input.max = "0.05";
  input.step = "0.0001";
  input.value = planet.speed;
  input.oninput = (e) => {
    speeds[planet.name] = parseFloat(e.target.value);
  };
  label.appendChild(input);
  controlDiv.appendChild(label);
});

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 1.5);
scene.add(pointLight);

// Background stars
function addStars(count = 500) {
  for (let i = 0; i < count; i++) {
    const geometry = new THREE.SphereGeometry(0.1, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const star = new THREE.Mesh(geometry, material);
    star.position.set(
      (Math.random() - 0.5) * 1000,
      (Math.random() - 0.5) * 1000,
      (Math.random() - 0.5) * 1000
    );
    scene.add(star);
  }
}
addStars();

// Pause/Resume
let paused = false;
document.getElementById("pauseBtn").onclick = () => {
  paused = !paused;
  document.getElementById("pauseBtn").innerText = paused ? "Resume" : "Pause";
};

// Dark/Light toggle
let dark = true;
document.getElementById("themeToggle").onclick = () => {
  dark = !dark;
  document.body.style.backgroundColor = dark ? "black" : "white";
  document.body.style.color = dark ? "white" : "black";
};

// Mouse hover for tooltip
window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets);

  if (intersects.length > 0) {
    const planet = intersects[0].object;
    tooltip.style.display = "block";
    tooltip.style.left = `${event.clientX + 10}px`;
    tooltip.style.top = `${event.clientY + 10}px`;
    tooltip.innerText = planet.name;
  } else {
    tooltip.style.display = "none";
  }
});

// Camera zoom on click
window.addEventListener("click", () => {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets);

  if (intersects.length > 0) {
    const planet = intersects[0].object;
    camera.position.set(planet.position.x, planet.position.y + 5, planet.position.z + 10);
  }
});

function animate() {
  requestAnimationFrame(animate);
  if (!paused) {
    planets.forEach((planet, i) => {
      orbits[i].angle += speeds[planet.name];
      planet.position.x = Math.cos(orbits[i].angle) * planetsData[i].distance;
      planet.position.z = Math.sin(orbits[i].angle) * planetsData[i].distance;
    });
  }
  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
