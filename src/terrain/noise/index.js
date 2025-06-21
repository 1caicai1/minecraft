import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';

class Noise {
  constructor() {
    this.noise = new ImprovedNoise();
    this.seed = Math.random();
    this.gap = 22;
    this.amp = 8;

    this.stoneSeed = this.seed * 0.4;
    this.stoneGap = 12;
    this.stoneAmp = 8;
    this.stoneThreshold = 3.5;

    this.coalSeed = this.seed * 0.5;
    this.coalGap = 3;
    this.coalAmp = 8;
    this.coalThreshold = 3;

    this.treeSeed = this.seed * 0.7;
    this.treeGap = 2;
    this.treeAmp = 6;
    this.treeHeight = 10;
    this.treeThreshold = 4;

    this.leafSeed = this.seed * 0.8;
    this.leafGap = 2;
    this.leafAmp = 5;
    this.leafThreshold = -0.03;

    this.get = (x, y, z) => {
      return this.noise.noise(x, y, z);
    };
  }
}

export default Noise;
