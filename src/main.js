import Core from './core/index.js';
import Control from './control/index.js';
import Player from './player/index.js';
import Terrain from './terrain/index.js';
import UI from './ui/index.js';
import Audio from './audio/index.js';
import './style.css';

const core = new Core();
const camera = core.camera;
const scene = core.scene;
const renderer = core.renderer;

const player = new Player();
const audio = new Audio(camera);
const terrain = new Terrain(scene, camera);
const control = new Control(scene, camera, player, terrain, audio);
const ui = new UI(terrain, control);

(function animate() {
  requestAnimationFrame(animate);
  control.update();
  terrain.update();
  ui.update();
  renderer.render(scene, camera);
})();
