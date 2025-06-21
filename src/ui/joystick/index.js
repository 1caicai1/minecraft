import * as THREE from 'three';
import { Mode } from '../../player';
import { htmlToDom } from '../../utils';
import joystickHtmlRaw from './joystick.html?raw';

export const ActionKey = {
  FRONT: 'front',
  LEFT: 'left',
  RIGHT: 'right',
  BACK: 'back',
  MODE: 'mode',
  JUMP: 'jump',
  UP: 'up',
  DOWN: 'down',
};

class Joystick {
  constructor(control) {
    this.pageX = 0;
    this.pageY = 0;
    this.clickX = 0;
    this.clickY = 0;
    this.hold = false;
    this.control = control;
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
  }

  emitKeyboardEvent = (key) => ({ key });

  emitClickEvent = (button) => ({
    button,
    preventDefault: () => {},
  });

  initButton = ({ actionKey, key }) => {
    const button = document.querySelector(`#action-${actionKey}`);
    button.addEventListener('pointermove', (e) => {
      e.stopPropagation();
    });
    button.addEventListener('pointerdown', (e) => {
      this.control.setMovementHandler(this.emitKeyboardEvent(key));
      e.stopPropagation();
    });
    button.addEventListener('pointerup', (e) => {
      this.control.resetMovementHandler(this.emitKeyboardEvent(key));
      e.stopPropagation();
    });

    if (actionKey === ActionKey.MODE && key === 'q') {
      this.initButton({ actionKey: ActionKey.MODE, key: ' ' });
      button.addEventListener('pointerdown', () => {
        if (this.control.player.mode === Mode.flying) {
          document.querySelector('#action-down')?.classList.remove('hidden');
        } else {
          document.querySelector('#action-down')?.classList.add('hidden');
        }
      });
    }
  };

  init = () => {
    htmlToDom(joystickHtmlRaw);
    this.initButton({ actionKey: ActionKey.FRONT, key: 'w' });
    this.initButton({ actionKey: ActionKey.LEFT, key: 'a' });
    this.initButton({ actionKey: ActionKey.RIGHT, key: 'd' });
    this.initButton({ actionKey: ActionKey.BACK, key: 's' });
    this.initButton({ actionKey: ActionKey.MODE, key: 'q' });
    this.initButton({ actionKey: ActionKey.UP, key: ' ' });
    this.initButton({ actionKey: ActionKey.DOWN, key: 'Shift' });

    document.addEventListener('pointermove', (e) => {
      if (this.pageX !== 0 || this.pageY !== 0) {
        this.euler.setFromQuaternion(this.control.camera.quaternion);
        this.euler.y -= 0.01 * (e.pageX - this.pageX);
        this.euler.x -= 0.01 * (e.pageY - this.pageY);
        this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));
        this.control.camera.quaternion.setFromEuler(this.euler);
      }
      this.pageX = e.pageX;
      this.pageY = e.pageY;
      this.clickTimeout && clearTimeout(this.clickTimeout);
    });

    document.addEventListener('pointerdown', (e) => {
      this.clickX = e.pageX;
      this.clickY = e.pageY;
      this.clickTimeout = setTimeout(() => {
        if (e.pageX === this.clickX && e.pageY === this.clickY) {
          this.control.mousedownHandler(this.emitClickEvent(0));
          this.clickInterval = setInterval(() => {
            this.control.mousedownHandler(this.emitClickEvent(0));
          }, 333);
          this.hold = true;
        }
      }, 500);
    });

    document.addEventListener('pointerup', (e) => {
      this.clickTimeout && clearTimeout(this.clickTimeout);
      this.clickInterval && clearInterval(this.clickInterval);
      if (!this.hold && e.pageX === this.clickX && e.pageY === this.clickY) {
        this.control.mousedownHandler(this.emitClickEvent(2));
      }
      this.hold = false;
      this.pageX = 0;
      this.pageY = 0;
    });
  };
}

export default Joystick;
