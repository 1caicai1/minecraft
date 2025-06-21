import * as THREE from 'three';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';

const noise = new ImprovedNoise();
const raycaster = new THREE.Raycaster(
  new THREE.Vector3(),
  new THREE.Vector3(0, -1, 0),
  0,
  1.8
);

self.onmessage = (msg) => {
  const { position, far, noiseGap, seed, noiseAmp, blocks } = msg.data;

  raycaster.ray.origin.set(position.x, position.y, position.z);
  raycaster.far = far;

  let index = 0;
  const mesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial(),
    100
  );
  const matrix = new THREE.Matrix4();

  const x = Math.round(position.x);
  const z = Math.round(position.z);
  const y = Math.floor(noise.noise(x / noiseGap, z / noiseGap, seed) * noiseAmp) + 30;

  let removed = false;
  for (const block of blocks) {
    if (block.x === x && block.z === z) {
      if (block.placed) {
        matrix.setPosition(new THREE.Vector3(block.x, block.y, block.z));
        mesh.setMatrixAt(index++, matrix);
      } else if (block.y === y) {
        removed = true;
      }
    }
  }

  if (!removed) {
    matrix.setPosition(new THREE.Vector3(x, y, z));
    mesh.setMatrixAt(index++, matrix);
  }

  mesh.instanceMatrix.needsUpdate = true;

  const intersects = raycaster.intersectObject(mesh);
  self.postMessage(intersects.length > 0);
};
