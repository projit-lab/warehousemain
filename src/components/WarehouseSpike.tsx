'use client'

import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';

export function WarehouseSpike() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // 10,000 bins layout setup
  const count = 10000;
  
  // Use useMemo to calculate grid layout only once
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  useEffect(() => {
    if (meshRef.current) {
      const gridX = 100;
      const gridZ = 100;
      let i = 0;
      
      // Basic 2D grid of bins, e.g. 100 x 100
      for (let x = 0; x < gridX; x++) {
        for (let z = 0; z < gridZ; z++) {
          dummy.position.set(
            (x - gridX / 2) * 1.5, // Spacing of 1.5
            0,                     // Flat on the ground
            (z - gridZ / 2) * 1.5
          );
          
          dummy.updateMatrix();
          meshRef.current.setMatrixAt(i, dummy.matrix);
          i++;
        }
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [dummy]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#4f46e5" />
    </instancedMesh>
  );
}
