import * as THREE from 'three';

import stoneTexture from '../../static/textures/block/stone.png';
import coalOreTexture from '../../static/textures/block/coal_ore.png';
import ironOreTexture from '../../static/textures/block/iron_ore.png';
import grassBlockSideTexture from '../../static/textures/block/grass_block_side.png';
import grassTopGreenTexture from '../../static/textures/block/grass_top_green.png';
import dirtTexture from '../../static/textures/block/dirt.png';
import oakLogTexture from '../../static/textures/block/oak_log.png';
import oakLogTopTexture from '../../static/textures/block/oak_log_top.png';
import oakLeavesTexture from '../../static/textures/block/oak_leaves.png';
import sandTexture from '../../static/textures/block/sand.png';
import oakPlanksTexture from '../../static/textures/block/oak_planks.png';
import diamondBlockTexture from '../../static/textures/block/diamond_block.png';
import quartzBlockSideTexture from '../../static/textures/block/quartz_block_side.png';
import glassTexture from '../../static/textures/block/glass.png';
import bedrockTexture from '../../static/textures/block/bedrock.png';

export const MaterialType = {
  grass: 'grass',
  dirt: 'dirt',
  tree: 'tree',
  leaf: 'leaf',
  sand: 'sand',
  stone: 'stone',
  coal: 'coal',
  wood: 'wood',
  diamond: 'diamond',
  quartz: 'quartz',
  glass: 'glass',
  bedrock: 'bedrock',
};

const loader = new THREE.TextureLoader();

const grassTopMaterial = loader.load(grassTopGreenTexture);
const grassMaterial = loader.load(grassBlockSideTexture);
const treeMaterial = loader.load(oakLogTexture);
const treeTopMaterial = loader.load(oakLogTopTexture);
const dirtMaterial = loader.load(dirtTexture);
const stoneMaterial = loader.load(stoneTexture);
const coalMaterial = loader.load(coalOreTexture);
const ironMaterial = loader.load(ironOreTexture);
const leafMaterial = loader.load(oakLeavesTexture);
const sandMaterial = loader.load(sandTexture);
const woodMaterial = loader.load(oakPlanksTexture);
const diamondMaterial = loader.load(diamondBlockTexture);
const quartzMaterial = loader.load(quartzBlockSideTexture);
const glassMaterial = loader.load(glassTexture);
const bedrockMaterial = loader.load(bedrockTexture);

[
  grassTopMaterial,
  grassMaterial,
  treeMaterial,
  treeTopMaterial,
  dirtMaterial,
  stoneMaterial,
  coalMaterial,
  ironMaterial,
  leafMaterial,
  sandMaterial,
  woodMaterial,
  diamondMaterial,
  quartzMaterial,
  glassMaterial,
  bedrockMaterial,
].forEach((mat) => {
  mat.magFilter = THREE.NearestFilter;
});

class Materials {
  constructor() {
    this.materials = {
      grass: [
        new THREE.MeshStandardMaterial({ map: grassMaterial }),
        new THREE.MeshStandardMaterial({ map: grassMaterial }),
        new THREE.MeshStandardMaterial({ map: grassTopMaterial }),
        new THREE.MeshStandardMaterial({ map: dirtMaterial }),
        new THREE.MeshStandardMaterial({ map: grassMaterial }),
        new THREE.MeshStandardMaterial({ map: grassMaterial }),
      ],
      dirt: new THREE.MeshStandardMaterial({ map: dirtMaterial }),
      sand: new THREE.MeshStandardMaterial({ map: sandMaterial }),
      tree: [
        new THREE.MeshStandardMaterial({ map: treeMaterial }),
        new THREE.MeshStandardMaterial({ map: treeMaterial }),
        new THREE.MeshStandardMaterial({ map: treeTopMaterial }),
        new THREE.MeshStandardMaterial({ map: treeTopMaterial }),
        new THREE.MeshStandardMaterial({ map: treeMaterial }),
        new THREE.MeshStandardMaterial({ map: treeMaterial }),
      ],
      leaf: new THREE.MeshStandardMaterial({
        map: leafMaterial,
        color: new THREE.Color(0, 1, 0),
        transparent: true,
      }),
      stone: new THREE.MeshStandardMaterial({ map: stoneMaterial }),
      coal: new THREE.MeshStandardMaterial({ map: coalMaterial }),
      wood: new THREE.MeshStandardMaterial({ map: woodMaterial }),
      diamond: new THREE.MeshStandardMaterial({ map: diamondMaterial }),
      quartz: new THREE.MeshStandardMaterial({ map: quartzMaterial }),
      glass: new THREE.MeshStandardMaterial({
        map: glassMaterial,
        transparent: true,
      }),
      bedrock: new THREE.MeshStandardMaterial({ map: bedrockMaterial }),
    };
  }

  get(type) {
    return this.materials[type];
  }
}

export default Materials;
