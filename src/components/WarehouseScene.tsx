'use client'

import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useWarehouseStore } from '@/store/useWarehouseStore';

export function WarehouseScene() {
  const racks = useWarehouseStore((state) => state.racks);
  const bins = useWarehouseStore((state) => state.bins);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (meshRef.current && bins.length > 0 && racks.length > 0) {
      bins.forEach((bin, index) => {
        const rack = racks.find(r => r.id === bin.rackId);
        if (rack) {
          // Calculate absolute world position
          const spacingCol = 1.5;
          const spacingFloor = 1.5;
          
          const x = rack.originCoordinates.x + (bin.localCoordinates.col * spacingCol);
          const y = rack.originCoordinates.y + (bin.localCoordinates.floor * spacingFloor);
          const z = rack.originCoordinates.z;
          
          dummy.position.set(x, y, z);
          dummy.updateMatrix();
          meshRef.current!.setMatrixAt(index, dummy.matrix);
        }
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [bins, racks, dummy]);

  if (bins.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, bins.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#60a5fa" />
    </instancedMesh>
  );
}
