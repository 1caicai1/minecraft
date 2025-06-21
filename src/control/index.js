// Control.js
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { Mode } from '../player/index.js';
import { BlockType } from '../terrain/index.js';
import Block from '../terrain/mesh/block.js';
import { isMobile } from '../utils/index.js';

export const Side = {
  front: 0,
  back: 1,
  left: 2,
  right: 3,
  down: 4,
  up: 5,
};

export default class Control {
  constructor(scene, camera, player, terrain, audio) {
    this.scene = scene;
    this.camera = camera;
    this.player = player;
    this.terrain = terrain;
    this.audio = audio;

    this.control = new PointerLockControls(camera, document.body);
    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 8;
    this.far = this.player.body.height;

    this.velocity = new THREE.Vector3(0, 0, 0);

    this.frontCollide = false;
    this.backCollide = false;
    this.leftCollide = false;
    this.rightCollide = false;
    this.downCollide = true;
    this.upCollide = false;

    this.isJumping = false;

    this.wheelGap = false;
    this.mouseHolding = false;
    this.spaceHolding = false;

    this.tempMesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial(),
      100
    );

    this.p1 = performance.now();
    this.p2 = performance.now();

    this.holdingBlocks = [
      BlockType.grass,
      BlockType.stone,
      BlockType.tree,
      BlockType.wood,
      BlockType.diamond,
      BlockType.quartz,
      BlockType.glass,
      BlockType.grass,
      BlockType.grass,
      BlockType.grass,
    ];
    this.holdingIndex = 0;
    this.holdingBlock = this.holdingBlocks[this.holdingIndex];

    this.downKeys = {
      a: false,
      d: false,
      w: false,
      s: false,
    };

    this.initRayCaster();
    this.initEventListeners();
  }

  initRayCaster() {
    this.raycasterUp = new THREE.Raycaster();
    this.raycasterDown = new THREE.Raycaster();
    this.raycasterFront = new THREE.Raycaster();
    this.raycasterBack = new THREE.Raycaster();
    this.raycasterLeft = new THREE.Raycaster();
    this.raycasterRight = new THREE.Raycaster();

    this.raycasterUp.ray.direction.set(0, 1, 0);
    this.raycasterDown.ray.direction.set(0, -1, 0);
    this.raycasterFront.ray.direction.set(1, 0, 0);
    this.raycasterBack.ray.direction.set(-1, 0, 0);
    this.raycasterLeft.ray.direction.set(0, 0, -1);
    this.raycasterRight.ray.direction.set(0, 0, 1);

    this.raycasterUp.far = 1.2;
    this.raycasterDown.far = this.player.body.height;
    this.raycasterFront.far = this.player.body.width;
    this.raycasterBack.far = this.player.body.width;
    this.raycasterLeft.far = this.player.body.width;
    this.raycasterRight.far = this.player.body.width;
  }

  setMovementHandler = (e) => {
    if (e.repeat) return;
    switch (e.key) {
      case 'q':
        if (this.player.mode === Mode.walking) {
          this.player.setMode(Mode.flying);
        } else {
          this.player.setMode(Mode.walking);
        }
        this.velocity.set(0, 0, 0);
        break;
      case 'w':
      case 'W':
        this.downKeys.w = true;
        this.velocity.x = this.player.speed;
        break;
      case 's':
      case 'S':
        this.downKeys.s = true;
        this.velocity.x = -this.player.speed;
        break;
      case 'a':
      case 'A':
        this.downKeys.a = true;
        this.velocity.z = -this.player.speed;
        break;
      case 'd':
      case 'D':
        this.downKeys.d = true;
        this.velocity.z = this.player.speed;
        break;
      case ' ':
        if (this.player.mode === Mode.sneaking && !this.isJumping) return;
        if (this.player.mode === Mode.walking) {
          if (!this.isJumping) {
            this.velocity.y = 8;
            this.isJumping = true;
            this.downCollide = false;
            this.far = 0;
            setTimeout(() => {
              this.far = this.player.body.height;
            }, 300);
          }
        } else {
          this.velocity.y += this.player.speed;
        }
        if (this.player.mode === Mode.walking && !this.spaceHolding) {
          this.spaceHolding = true;
          this.jumpInterval = setInterval(() => {
            this.setMovementHandler(e);
          }, 10);
        }
        break;
      case 'Shift':
        if (this.player.mode === Mode.walking) {
          if (!this.isJumping) {
            this.player.setMode(Mode.sneaking);
            if (this.downKeys.w) this.velocity.x = this.player.speed;
            if (this.downKeys.s) this.velocity.x = -this.player.speed;
            if (this.downKeys.a) this.velocity.z = -this.player.speed;
            if (this.downKeys.d) this.velocity.z = this.player.speed;
            this.camera.position.setY(this.camera.position.y - 0.2);
          }
        } else {
          this.velocity.y -= this.player.speed;
        }
        break;
      default:
        break;
    }
  };

  resetMovementHandler = (e) => {
    if (e.repeat) return;
    switch (e.key) {
      case 'w':
      case 'W':
        this.downKeys.w = false;
        this.velocity.x = 0;
        break;
      case 's':
      case 'S':
        this.downKeys.s = false;
        this.velocity.x = 0;
        break;
      case 'a':
      case 'A':
        this.downKeys.a = false;
        this.velocity.z = 0;
        break;
      case 'd':
      case 'D':
        this.downKeys.d = false;
        this.velocity.z = 0;
        break;
      case ' ':
        if (this.player.mode === Mode.sneaking && !this.isJumping) return;
        this.jumpInterval && clearInterval(this.jumpInterval);
        this.spaceHolding = false;
        if (this.player.mode === Mode.walking) return;
        this.velocity.y = 0;
        break;
      case 'Shift':
        if (this.player.mode === Mode.sneaking) {
          if (!this.isJumping) {
            this.player.setMode(Mode.walking);
            if (this.downKeys.w) this.velocity.x = this.player.speed;
            if (this.downKeys.s) this.velocity.x = -this.player.speed;
            if (this.downKeys.a) this.velocity.z = -this.player.speed;
            if (this.downKeys.d) this.velocity.z = this.player.speed;
            this.camera.position.setY(this.camera.position.y + 0.2);
          }
        }
        if (this.player.mode === Mode.walking) return;
        this.velocity.y = 0;
        break;
      default:
        break;
    }
  };

  mousedownHandler = (e) => {
    e.preventDefault();
    this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
    const block = this.raycaster.intersectObjects(this.terrain.blocks)[0];
    const matrix = new THREE.Matrix4();
    switch (e.button) {
      case 0:
        if (block && block.object instanceof THREE.InstancedMesh) {
          block.object.getMatrixAt(block.instanceId, matrix);
          const position = new THREE.Vector3().setFromMatrixPosition(matrix);
          if (BlockType[block.object.name] === BlockType.bedrock) {
            this.terrain.generateAdjacentBlocks(position);
            return;
          }
          block.object.setMatrixAt(block.instanceId, new THREE.Matrix4().set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0));
          this.audio.playSound(BlockType[block.object.name]);

          const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            this.terrain.materials.get(this.terrain.materialType[parseInt(BlockType[block.object.name])])
          );
          mesh.position.copy(position);
          this.scene.add(mesh);
          const time = performance.now();
          let raf = 0;
          const animate = () => {
            if (performance.now() - time > 250) {
              this.scene.remove(mesh);
              cancelAnimationFrame(raf);
              return;
            }
            raf = requestAnimationFrame(animate);
            mesh.geometry.scale(0.85, 0.85, 0.85);
          };
          animate();

          block.object.instanceMatrix.needsUpdate = true;

          let existed = false;
          for (const customBlock of this.terrain.customBlocks) {
            if (
              customBlock.x === position.x &&
              customBlock.y === position.y &&
              customBlock.z === position.z
            ) {
              existed = true;
              customBlock.placed = false;
            }
          }
          if (!existed) {
            this.terrain.customBlocks.push(
              new Block(position.x, position.y, position.z, BlockType[block.object.name], false)
            );
          }
          this.terrain.generateAdjacentBlocks(position);
        }
        break;
      case 2:
        if (block && block.object instanceof THREE.InstancedMesh) {
          const normal = block.face.normal;
          block.object.getMatrixAt(block.instanceId, matrix);
          const position = new THREE.Vector3().setFromMatrixPosition(matrix);

          if (
            position.x + normal.x === Math.round(this.camera.position.x) &&
            position.z + normal.z === Math.round(this.camera.position.z) &&
            (position.y + normal.y === Math.round(this.camera.position.y) ||
              position.y + normal.y === Math.round(this.camera.position.y - 1))
          ) {
            return;
          }
          matrix.setPosition(normal.x + position.x, normal.y + position.y, normal.z + position.z);
          this.terrain.blocks[this.holdingBlock].setMatrixAt(
            this.terrain.getCount(this.holdingBlock),
            matrix
          );
          this.terrain.setCount(this.holdingBlock);
          this.audio.playSound(this.holdingBlock);
          this.terrain.blocks[this.holdingBlock].instanceMatrix.needsUpdate = true;
          this.terrain.customBlocks.push(
            new Block(normal.x + position.x, normal.y + position.y, normal.z + position.z, this.holdingBlock, true)
          );
        }
        break;
      default:
        break;
    }

    if (!isMobile && !this.mouseHolding) {
      this.mouseHolding = true;
      this.clickInterval = setInterval(() => {
        this.mousedownHandler(e);
      }, 333);
    }
  };

  mouseupHandler = () => {
    this.clickInterval && clearInterval(this.clickInterval);
    this.mouseHolding = false;
  };

  changeHoldingBlockHandler = (e) => {
    if (isNaN(parseInt(e.key)) || e.key === '0') return;
    this.holdingIndex = parseInt(e.key) - 1;
    this.holdingBlock = this.holdingBlocks[this.holdingIndex] ?? BlockType.grass;
  };

  wheelHandler = (e) => {
    if (!this.wheelGap) {
      this.wheelGap = true;
      setTimeout(() => {
        this.wheelGap = false;
      }, 100);
      if (e.deltaY > 0) {
        this.holdingIndex++;
        if (this.holdingIndex > 9) this.holdingIndex = 0;
      } else if (e.deltaY < 0) {
        this.holdingIndex--;
        if (this.holdingIndex < 0) this.holdingIndex = 9;
      }
      this.holdingBlock = this.holdingBlocks[this.holdingIndex] ?? BlockType.grass;
    }
  };

  initEventListeners() {
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement) {
        document.body.addEventListener('keydown', this.changeHoldingBlockHandler);
        document.body.addEventListener('wheel', this.wheelHandler);
        document.body.addEventListener('keydown', this.setMovementHandler);
        document.body.addEventListener('keyup', this.resetMovementHandler);
        document.body.addEventListener('mousedown', this.mousedownHandler);
        document.body.addEventListener('mouseup', this.mouseupHandler);
      } else {
        document.body.removeEventListener('keydown', this.changeHoldingBlockHandler);
        document.body.removeEventListener('wheel', this.wheelHandler);
        document.body.removeEventListener('keydown', this.setMovementHandler);
        document.body.removeEventListener('keyup', this.resetMovementHandler);
        document.body.removeEventListener('mousedown', this.mousedownHandler);
        document.body.removeEventListener('mouseup', this.mouseupHandler);
        this.velocity.set(0, 0, 0);
      }
    });
  }

  moveZ(distance, delta) {
    this.camera.position.z += distance * (this.player.speed / Math.PI) * 2 * delta;
  }

  moveX(distance, delta) {
    this.camera.position.x += distance * (this.player.speed / Math.PI) * 2 * delta;
  }

  collideCheckAll(position, noise, customBlocks, far) {
    this.collideCheck(Side.down, position, noise, customBlocks, far);
    this.collideCheck(Side.front, position, noise, customBlocks);
    this.collideCheck(Side.back, position, noise, customBlocks);
    this.collideCheck(Side.left, position, noise, customBlocks);
    this.collideCheck(Side.right, position, noise, customBlocks);
    this.collideCheck(Side.up, position, noise, customBlocks);
  }

  collideCheck(side, position, noise, customBlocks, far = this.player.body.width) {
    const matrix = new THREE.Matrix4();
    let index = 0;
    this.tempMesh.instanceMatrix = new THREE.InstancedBufferAttribute(new Float32Array(100 * 16), 16);
    let removed = false;
    let treeRemoved = new Array(this.terrain.noise.treeHeight + 1).fill(false);
    let x = Math.round(position.x);
    let z = Math.round(position.z);

    switch (side) {
      case Side.front:
        x++;
        this.raycasterFront.ray.origin = position;
        break;
      case Side.back:
        x--;
        this.raycasterBack.ray.origin = position;
        break;
      case Side.left:
        z--;
        this.raycasterLeft.ray.origin = position;
        break;
      case Side.right:
        z++;
        this.raycasterRight.ray.origin = position;
        break;
      case Side.down:
        this.raycasterDown.ray.origin = position;
        this.raycasterDown.far = far;
        break;
      case Side.up:
        this.raycasterUp.ray.origin = new THREE.Vector3().copy(position);
        this.raycasterUp.ray.origin.y--;
        break;
    }

    let y = Math.floor(noise.get(x / noise.gap, z / noise.gap, noise.seed) * noise.amp) + 30;

    for (const block of customBlocks) {
      if (block.x === x && block.z === z) {
        if (block.placed) {
          matrix.setPosition(block.x, block.y, block.z);
          this.tempMesh.setMatrixAt(index++, matrix);
        } else if (block.y === y) {
          removed = true;
        } else {
          for (let i = 1; i <= this.terrain.noise.treeHeight; i++) {
            if (block.y === y + i) {
              treeRemoved[i] = true;
            }
          }
        }
      }
    }

    if (!removed) {
      matrix.setPosition(x, y, z);
      this.tempMesh.setMatrixAt(index++, matrix);
    }

    for (let i = 1; i <= this.terrain.noise.treeHeight; i++) {
      if (!treeRemoved[i]) {
        let treeOffset = noise.get(x / noise.treeGap, z / noise.treeGap, noise.treeSeed) * noise.treeAmp;
        let stoneOffset = noise.get(x / noise.stoneGap, z / noise.stoneGap, noise.stoneSeed) * noise.stoneAmp;
        if (treeOffset > noise.treeThreshold && y >= 27 && stoneOffset < noise.stoneThreshold) {
          matrix.setPosition(x, y + i, z);
          this.tempMesh.setMatrixAt(index++, matrix);
        }
      }
    }

    if (
      this.player.mode === Mode.sneaking &&
      y < Math.floor(this.camera.position.y - 2) &&
      side !== Side.down &&
      side !== Side.up
    ) {
      matrix.setPosition(x, Math.floor(this.camera.position.y - 1), z);
      this.tempMesh.setMatrixAt(index++, matrix);
    }

    this.tempMesh.instanceMatrix.needsUpdate = true;

    const origin = new THREE.Vector3(position.x, position.y - 1, position.z);

    switch (side) {
      case Side.front: {
        const c1 = this.raycasterFront.intersectObject(this.tempMesh).length;
        this.raycasterFront.ray.origin = origin;
        const c2 = this.raycasterFront.intersectObject(this.tempMesh).length;
        this.frontCollide = c1 || c2 ? true : false;
        break;
      }
      case Side.back: {
        const c1 = this.raycasterBack.intersectObject(this.tempMesh).length;
        this.raycasterBack.ray.origin = origin;
        const c2 = this.raycasterBack.intersectObject(this.tempMesh).length;
        this.backCollide = c1 || c2 ? true : false;
        break;
      }
      case Side.left: {
        const c1 = this.raycasterLeft.intersectObject(this.tempMesh).length;
        this.raycasterLeft.ray.origin = origin;
        const c2 = this.raycasterLeft.intersectObject(this.tempMesh).length;
        this.leftCollide = c1 || c2 ? true : false;
        break;
      }
      case Side.right: {
        const c1 = this.raycasterRight.intersectObject(this.tempMesh).length;
        this.raycasterRight.ray.origin = origin;
        const c2 = this.raycasterRight.intersectObject(this.tempMesh).length;
        this.rightCollide = c1 || c2 ? true : false;
        break;
      }
      case Side.down: {
        const c1 = this.raycasterDown.intersectObject(this.tempMesh).length;
        this.downCollide = c1 ? true : false;
        break;
      }
      case Side.up: {
        const c1 = this.raycasterUp.intersectObject(this.tempMesh).length;
        this.upCollide = c1 ? true : false;
        break;
      }
    }
  }

  // update() 方法重写，在原有基础上修复无法移动的问题

update() {
  this.p1 = performance.now();
  const delta = (this.p1 - this.p2) / 1000;

  // 初始时触发一次碰撞检测，避免进游戏无法移动
  if (!this.ready) {
    this.collideCheckAll(this.camera.position, this.terrain.noise, this.terrain.customBlocks, this.far);
    this.ready = true;
  }

  // 每帧更新水平速度
  let moveX = 0;
  let moveZ = 0;
  if (this.downKeys.w) moveX += this.player.speed;
  if (this.downKeys.s) moveX -= this.player.speed;
  if (this.downKeys.a) moveZ -= this.player.speed;
  if (this.downKeys.d) moveZ += this.player.speed;
  this.velocity.x = moveX;
  this.velocity.z = moveZ;

  this.collideCheckAll(this.camera.position, this.terrain.noise, this.terrain.customBlocks, this.far);

  if (this.player.mode === Mode.flying) {
    this.control.moveForward(this.velocity.x * delta);
    this.control.moveRight(this.velocity.z * delta);
    this.camera.position.y += this.velocity.y * delta;
  } else {
    this.collideCheckAll(this.camera.position, this.terrain.noise, this.terrain.customBlocks, this.far - this.velocity.y * delta);

    if (Math.abs(this.velocity.y) < this.player.falling) {
      this.velocity.y -= 25 * delta;
    }

    if (this.upCollide) {
      this.velocity.y = -225 * delta;
      this.far = this.player.body.height;
    }

    if (this.downCollide) {
      this.velocity.y = 0;
      this.isJumping = false;
    }

    // 仅清除与方向匹配的速度，避免完全卡死
    if (this.frontCollide && this.downKeys.w) {
      this.velocity.x = 0;
    } else if (this.backCollide && this.downKeys.s) {
      this.velocity.x = 0;
    }
    if (this.leftCollide && this.downKeys.a) {
      this.velocity.z = 0;
    } else if (this.rightCollide && this.downKeys.d) {
      this.velocity.z = 0;
    }

    this.control.moveForward(this.velocity.x * delta);
    this.control.moveRight(this.velocity.z * delta);
    this.camera.position.y += this.velocity.y * delta;

    if (this.camera.position.y < -100) {
      this.camera.position.y = 60;
    }
  }

  this.p2 = this.p1;
}

}
