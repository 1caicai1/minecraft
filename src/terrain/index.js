import * as THREE from "three";
import Materials, { MaterialType } from "./mesh/materials.js";
import Block from "./mesh/block.js";
import Highlight from "./highlight/index.js";
import Noise from "./noise/index.js";
import GenerateWorker from "./worker/generate?worker";

export const BlockType = {
  grass: 0,
  sand: 1,
  tree: 2,
  leaf: 3,
  dirt: 4,
  stone: 5,
  coal: 6,
  wood: 7,
  diamond: 8,
  quartz: 9,
  glass: 10,
  bedrock: 11,
};

class Terrain {
  constructor(scene, camera) {
    this.distance = 3;
    this.chunkSize = 24;
    this.chunk = new THREE.Vector2(0, 0);
    this.previousChunk = new THREE.Vector2(0, 0);
    this.noise = new Noise();
    this.materials = new Materials();
    this.materialType = [
      MaterialType.grass,
      MaterialType.sand,
      MaterialType.tree,
      MaterialType.leaf,
      MaterialType.dirt,
      MaterialType.stone,
      MaterialType.coal,
      MaterialType.wood,
      MaterialType.diamond,
      MaterialType.quartz,
      MaterialType.glass,
      MaterialType.bedrock,
    ];
    this.blocks = [];
    this.blocksCount = [];
    this.blocksFactor = [1, 0.2, 0.1, 0.7, 0.1, 0.2, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1];
    this.customBlocks = [];
    this.idMap = new Map();
    this.generateWorker = new GenerateWorker();
    this.cloud = new THREE.InstancedMesh(
      new THREE.BoxGeometry(20, 5, 14),
      new THREE.MeshStandardMaterial({
        transparent: true,
        color: 0xffffff,
        opacity: 0.4,
      }),
      1000
    );
    this.cloudCount = 0;
    this.cloudGap = 5;

    this.getCount = (type) => this.blocksCount[type];

    this.setCount = (type) => {
      this.blocksCount[type] = this.blocksCount[type] + 1;
    };

    this.initBlocks = () => {
      for (const block of this.blocks) {
        this.scene.remove(block);
      }
      this.blocks = [];
      const geometry = new THREE.BoxGeometry();
      for (let i = 0; i < this.materialType.length; i++) {
        let block = new THREE.InstancedMesh(
          geometry,
          this.materials.get(this.materialType[i]),
          this.maxCount * this.blocksFactor[i]
        );
        block.name = Object.keys(BlockType)[i];
        this.blocks.push(block);
        this.scene.add(block);
      }
      this.blocksCount = new Array(this.materialType.length).fill(0);
    };

    this.resetBlocks = () => {
      for (let i = 0; i < this.blocks.length; i++) {
        this.blocks[i].instanceMatrix = new THREE.InstancedBufferAttribute(
          new Float32Array(this.maxCount * this.blocksFactor[i] * 16),
          16
        );
      }
    };

    this.generate = () => {
      this.blocksCount = new Array(this.blocks.length).fill(0);
      this.generateWorker.postMessage({
        distance: this.distance,
        chunk: this.chunk,
        noiseSeed: this.noise.seed,
        treeSeed: this.noise.treeSeed,
        stoneSeed: this.noise.stoneSeed,
        coalSeed: this.noise.coalSeed,
        idMap: new Map(),
        blocksFactor: this.blocksFactor,
        blocksCount: this.blocksCount,
        customBlocks: this.customBlocks,
        chunkSize: this.chunkSize,
      });

      if (this.cloudGap++ > 5) {
        this.cloudGap = 0;
        this.cloud.instanceMatrix = new THREE.InstancedBufferAttribute(
          new Float32Array(1000 * 16),
          16
        );
        this.cloudCount = 0;

        for (
          let x = -this.chunkSize * this.distance * 3 + this.chunkSize * this.chunk.x;
          x <
          this.chunkSize * this.distance * 3 +
            this.chunkSize +
            this.chunkSize * this.chunk.x;
          x += 20
        ) {
          for (
            let z = -this.chunkSize * this.distance * 3 + this.chunkSize * this.chunk.y;
            z <
            this.chunkSize * this.distance * 3 +
              this.chunkSize +
              this.chunkSize * this.chunk.y;
            z += 20
          ) {
            const matrix = new THREE.Matrix4();
            matrix.setPosition(x, 80 + (Math.random() - 0.5) * 30, z);
            if (Math.random() > 0.8) {
              this.cloud.setMatrixAt(this.cloudCount++, matrix);
            }
          }
        }
        this.cloud.instanceMatrix.needsUpdate = true;
      }
    };

    this.generateAdjacentBlocks = (position) => {
      const { x, y, z } = position;
      const noise = this.noise;
      const yOffset = Math.floor(noise.get(x / noise.gap, z / noise.gap, noise.seed) * noise.amp);
      if (y > 30 + yOffset) return;

      const stoneOffset = noise.get(x / noise.stoneGap, z / noise.stoneGap, noise.stoneSeed) * noise.stoneAmp;
      let type;
      if (stoneOffset > noise.stoneThreshold || y < 23) {
        type = BlockType.stone;
      } else {
        if (yOffset < -3) {
          type = BlockType.sand;
        } else {
          type = BlockType.dirt;
        }
      }

      this.buildBlock(new THREE.Vector3(x, y - 1, z), type);
      this.buildBlock(new THREE.Vector3(x, y + 1, z), type);
      this.buildBlock(new THREE.Vector3(x - 1, y, z), type);
      this.buildBlock(new THREE.Vector3(x + 1, y, z), type);
      this.buildBlock(new THREE.Vector3(x, y, z - 1), type);
      this.buildBlock(new THREE.Vector3(x, y, z + 1), type);
      this.blocks[type].instanceMatrix.needsUpdate = true;
    };

    this.buildBlock = (position, type) => {
      const noise = this.noise;
      const yOffset = Math.floor(
        noise.get(position.x / noise.gap, position.z / noise.gap, noise.seed) * noise.amp
      );
      if (position.y >= 30 + yOffset || position.y < 0) return;

      if (position.y === 0) type = BlockType.bedrock;

      for (const block of this.customBlocks) {
        if (block.x === position.x && block.y === position.y && block.z === position.z) return;
      }

      this.customBlocks.push(new Block(position.x, position.y, position.z, type, true));

      const matrix = new THREE.Matrix4();
      matrix.setPosition(position);
      this.blocks[type].setMatrixAt(this.getCount(type), matrix);
      this.blocks[type].instanceMatrix.needsUpdate = true;
      this.setCount(type);
    };

    this.update = () => {
      this.chunk.set(
        Math.floor(this.camera.position.x / this.chunkSize),
        Math.floor(this.camera.position.z / this.chunkSize)
      );

      if (this.chunk.x !== this.previousChunk.x || this.chunk.y !== this.previousChunk.y) {
        this.generate();
      }

      this.previousChunk.copy(this.chunk);
      this.highlight.update();
    };

    this.scene = scene;
    this.camera = camera;
    this.maxCount = Math.pow(this.distance * this.chunkSize * 2 + this.chunkSize, 2) + 500;
    this.highlight = new Highlight(scene, camera, this);
    this.scene.add(this.cloud);

    this.generateWorker.onmessage = (msg) => {
      this.resetBlocks();
      this.idMap = msg.data.idMap;
      this.blocksCount = msg.data.blocksCount;
      for (let i = 0; i < msg.data.arrays.length; i++) {
        this.blocks[i].instanceMatrix = new THREE.InstancedBufferAttribute(msg.data.arrays[i], 16);
      }
      for (const block of this.blocks) {
        block.instanceMatrix.needsUpdate = true;
      }
    };
  }
}

export default Terrain;
