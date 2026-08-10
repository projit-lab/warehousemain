'use client'

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { WarehouseSpike } from '@/components/WarehouseSpike';

export default function Home() {
  return (
    <main style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [50, 50, 50], fov: 60 }}>
        {/* Basic lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 10]} intensity={1} />
        
        {/* Performance monitor */}
        <Stats />
        
        {/* Controls to pan and zoom */}
        <OrbitControls makeDefault />

        {/* The 10,000 bins */}
        <WarehouseSpike />
      </Canvas>
    </main>
  );
}
