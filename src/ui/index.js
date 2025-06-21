import FPS from './fps';
import Bag from './bag';
import { Mode } from '../player';
import Joystick from './joystick';
import { isMobile } from '../utils';
import * as THREE from 'three';

class UI {
  constructor(terrain, control) {
    this.menu = document.querySelector('.menu');
    this.crossHair = document.createElement('div');
    this.play = document.querySelector('#play');
    this.control = document.querySelector('#control');
    this.setting = document.querySelector('#setting');
    this.feature = document.querySelector('#feature');
    this.back = document.querySelector('#back');
    this.exit = document.querySelector('#exit');
    this.save = document.querySelector('#save');
    this.saveModal = document.querySelector('.save-modal');
    this.loadModal = document.querySelector('.load-modal');
    this.settings = document.querySelector('.settings');
    this.features = document.querySelector('.features');
    this.github = document.querySelector('.github');
    this.distance = document.querySelector('#distance');
    this.distanceInput = document.querySelector('#distance-input');
    this.fov = document.querySelector('#fov');
    this.fovInput = document.querySelector('#fov-input');
    this.music = document.querySelector('#music');
    this.musicInput = document.querySelector('#music-input');
    this.settingBack = document.querySelector('#setting-back');

    this.fps = new FPS();
    this.bag = new Bag();
    this.joystick = new Joystick(control);

    this.crossHair.className = 'cross-hair';
    this.crossHair.innerHTML = '+';
    document.body.appendChild(this.crossHair);

    this.onPlay = () => {
      if (isMobile) this.joystick.init();
      this.menu?.classList.add('hidden');
      this.menu?.classList.remove('start');
      if (this.play) this.play.innerHTML = 'Resume';
      this.crossHair.classList.remove('hidden');
      this.github?.classList.add('hidden');
      this.feature?.classList.add('hidden');
    };

    this.onPause = () => {
      this.menu?.classList.remove('hidden');
      this.crossHair.classList.add('hidden');
      if (this.save) this.save.innerHTML = 'Save and Exit';
      this.github?.classList.remove('hidden');
    };

    this.onExit = () => {
      this.menu?.classList.add('start');
      if (this.play) this.play.innerHTML = 'Play';
      if (this.save) this.save.innerHTML = 'Load Game';
      this.feature?.classList.remove('hidden');
    };

    this.onSave = () => {
      this.saveModal?.classList.remove('hidden');
      setTimeout(() => this.saveModal?.classList.add('show'));
      setTimeout(() => this.saveModal?.classList.remove('show'), 1000);
      setTimeout(() => this.saveModal?.classList.add('hidden'), 1350);
    };

    this.onLoad = () => {
      this.loadModal?.classList.remove('hidden');
      setTimeout(() => this.loadModal?.classList.add('show'));
      setTimeout(() => this.loadModal?.classList.remove('show'), 1000);
      setTimeout(() => this.loadModal?.classList.add('hidden'), 1350);
    };

    this.update = () => {
      this.fps.update();
    };

    this.play?.addEventListener('click', () => {
      if (this.play?.innerHTML === 'Play') {
        this.onPlay();
        terrain.noise.seed = Math.random();
        terrain.noise.stoneSeed = Math.random();
        terrain.noise.treeSeed = Math.random();
        terrain.noise.coalSeed = Math.random();
        terrain.noise.leafSeed = Math.random();
        terrain.customBlocks = [];
        terrain.initBlocks();
        terrain.generate();
        terrain.camera.position.y = 40;
        control.player.setMode(Mode.walking);
      }
      if (!isMobile) control.control.lock();
    });

    this.save?.addEventListener('click', () => {
      if (this.save?.innerHTML === 'Save and Exit') {
        window.localStorage.setItem('block', JSON.stringify(terrain.customBlocks));
        window.localStorage.setItem('seed', JSON.stringify(terrain.noise.seed));
        window.localStorage.setItem('position', JSON.stringify({
          x: terrain.camera.position.x,
          y: terrain.camera.position.y,
          z: terrain.camera.position.z,
        }));
        this.onExit();
        this.onSave();
      } else {
        terrain.noise.seed = Number(window.localStorage.getItem('seed')) ?? Math.random();
        const customBlocks = JSON.parse(window.localStorage.getItem('block') || 'null') ?? [];
        terrain.customBlocks = customBlocks;
        terrain.initBlocks();
        terrain.generate();
        const position = JSON.parse(window.localStorage.getItem('position') || 'null');
        if (position) {
          terrain.camera.position.x = position.x;
          terrain.camera.position.y = position.y;
          terrain.camera.position.z = position.z;
        }
        this.onPlay();
        this.onLoad();
        if (!isMobile) control.control.lock();
      }
    });

    this.feature?.addEventListener('click', () => {
      this.features?.classList.remove('hidden');
    });

    this.back?.addEventListener('click', () => {
      this.features?.classList.add('hidden');
    });

    this.setting?.addEventListener('click', () => {
      this.settings?.classList.remove('hidden');
    });

    this.settingBack?.addEventListener('click', () => {
      this.settings?.classList.add('hidden');
    });

    this.distanceInput?.addEventListener('input', (e) => {
      if (this.distance && e.target instanceof HTMLInputElement) {
        this.distance.innerHTML = `Render Distance: ${e.target.value}`;
      }
    });

    this.fovInput?.addEventListener('input', (e) => {
      if (this.fov && e.target instanceof HTMLInputElement) {
        this.fov.innerHTML = `Field of View: ${e.target.value}`;
        control.camera.fov = parseInt(e.target.value);
        control.camera.updateProjectionMatrix();
      }
    });

    this.musicInput?.addEventListener('input', (e) => {
      if (this.music && e.target instanceof HTMLInputElement) {
        const disabled = e.target.value === '0';
        control.audio.disabled = disabled;
        this.music.innerHTML = `Music: ${disabled ? 'Off' : 'On'}`;
      }
    });

    this.settingBack?.addEventListener('click', () => {
      if (this.distanceInput instanceof HTMLInputElement) {
        terrain.distance = parseInt(this.distanceInput.value);
        terrain.maxCount = Math.pow((terrain.distance * terrain.chunkSize * 2 + terrain.chunkSize), 2) + 500;
        terrain.initBlocks();
        terrain.generate();
        terrain.scene.fog = new THREE.Fog(0x87ceeb, 1, terrain.distance * 24 + 24);
      }
    });

    document.body.addEventListener('keydown', (e) => {
      if (e.key === 'e' && document.pointerLockElement) {
        if (!isMobile) control.control.unlock();
      }
      if (e.key === 'f') {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.body.requestFullscreen();
        }
      }
    });

    this.exit?.addEventListener('click', () => {
      this.onExit();
    });

    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement) {
        this.onPlay();
      } else {
        this.onPause();
      }
    });

    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    document.querySelector('canvas')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (!isMobile) control.control.lock();
    });
  }
}

export default UI;
