import { NextResponse } from 'next/server';
import { doc, setDoc, collection, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product, Rack, Bin } from '@/types/schema';

export async function GET() {
  try {
    // 1. Create 3 mock products
    const p1: Product = {
      id: 'prod-1',
      name: 'Widget A (Fast)',
      tags: ['electronics', 'fast-moving'],
      unitWeight: 0.5,
      unitVolume: 0.1,
      velocityClass: 'A',
    };
    await setDoc(doc(db, 'Products', 'prod-1'), p1);

    const p2: Product = {
      id: 'prod-2',
      name: 'Anvil (Heavy)',
      tags: ['metal', 'heavy'],
      unitWeight: 50.0,
      unitVolume: 5.0,
      velocityClass: 'C',
    };
    await setDoc(doc(db, 'Products', 'prod-2'), p2);

    const p3: Product = {
      id: 'prod-3',
      name: 'Spare Parts (Slow)',
      tags: ['misc'],
      unitWeight: 1.0,
      unitVolume: 0.5,
      velocityClass: 'B',
    };
    await setDoc(doc(db, 'Products', 'prod-3'), p3);

    // 2. Create 1 mock rack
    const rack1: Rack = {
      id: 'rack-A',
      zone: 'Dispatch',
      originCoordinates: { x: 10, y: 0, z: 10 },
      dimensions: { columns: 5, floors: 3 },
    };
    await setDoc(doc(db, 'Racks', 'rack-A'), rack1);

    // 3. Create 5 mock bins in a subcollection using a batch
    const batch = writeBatch(db);
    const binsCollectionRef = collection(db, 'Racks', 'rack-A', 'Bins');

    const mockBins: Bin[] = [
      { id: 'bin-1', localCoordinates: { col: 1, floor: 1 }, productId: 'prod-1', currentWeight: 5, unitCount: 10 },
      { id: 'bin-2', localCoordinates: { col: 2, floor: 1 }, productId: 'prod-1', currentWeight: 5, unitCount: 10 },
      { id: 'bin-3', localCoordinates: { col: 3, floor: 1 }, productId: 'prod-2', currentWeight: 50, unitCount: 1 },
      { id: 'bin-4', localCoordinates: { col: 4, floor: 1 }, productId: 'prod-3', currentWeight: 2, unitCount: 2 },
      { id: 'bin-5', localCoordinates: { col: 5, floor: 1 }, productId: 'prod-3', currentWeight: 1, unitCount: 1 },
    ];

    mockBins.forEach((binData) => {
      const binRef = doc(binsCollectionRef, binData.id);
      batch.set(binRef, binData);
    });

    await batch.commit();

    return NextResponse.json({ success: true, message: 'Database seeded successfully with typed mock data!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
