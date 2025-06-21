import * as THREE from 'three';

self.onmessage = (msg) => {
  const { position, matrices, count } = msg.data;

  const rayOrigin = new THREE.Vector3(position.x, position.y - 1, position.z);
  const rayDirection = new THREE.Vector3(1, 0, 0);
  const raycaster = new THREE.Raycaster(rayOrigin, rayDirection, 0, 0.6);

  const meshes = matrices.map((matrix) => {
    const mesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial(),
      count
    );
    mesh.instanceMatrix = matrix;
    return mesh;
  });

  const intersects = raycaster.intersectObjects(meshes);
  self.postMessage(intersects.length > 0);
};
