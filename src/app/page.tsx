'use client'

import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { WarehouseScene } from '@/components/WarehouseScene';
import { useWarehouseStore } from '@/store/useWarehouseStore';

export default function Home() {
  const fetchWarehouseData = useWarehouseStore((state) => state.fetchWarehouseData);
  const loading = useWarehouseStore((state) => state.loading);

  useEffect(() => {
    fetchWarehouseData();
  }, [fetchWarehouseData]);

  return (
    <main style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {loading && (
        <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', zIndex: 10 }}>
          Loading warehouse data...
        </div>
      )}
      <Canvas camera={{ position: [50, 50, 50], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} />
        
        <Stats />
        {/* Center the controls on the mock rack's origin (10, 0, 10) so panning/orbiting feels natural */}
        <OrbitControls makeDefault target={[10, 0, 10]} />

        <WarehouseScene />
      </Canvas>
    </main>
  );
}
