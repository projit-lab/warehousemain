import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { Product, Rack, Bin } from '@/types/schema';
import { calculateRequiredBins, calculateCOI, MAX_WEIGHT, MAX_VOLUME } from '@/utils/layoutMath';

interface LayoutPayload {
  [productId: string]: {
    targetVolume: number;
    arrivalRate: number;
  };
}

export async function POST(request: Request) {
  try {
    const payload: LayoutPayload = await request.json();
    
    // 1. Fetch Products and Racks
    const productsSnap = await getDocs(collection(db, 'Products'));
    const products: Record<string, Product> = {};
    productsSnap.forEach(d => {
      products[d.id] = d.data() as Product;
    });

    const racksSnap = await getDocs(collection(db, 'Racks'));
    const racks: Rack[] = [];
    racksSnap.forEach(d => racks.push(d.data() as Rack));

    // 2. Process payload and sort products by COI (Greedy order)
    const productList = Object.entries(payload).map(([productId, metrics]) => {
      const product = products[productId];
      if (!product) throw new Error(`Product ${productId} not found in database.`);
      
      const reqBins = calculateRequiredBins(product, metrics.targetVolume);
      const coi = calculateCOI(product, metrics.arrivalRate);
      
      return { product, reqBins, coi, targetVolume: metrics.targetVolume };
    });

    // Lower COI is better (fast-moving but small volume items get priority)
    productList.sort((a, b) => a.coi - b.coi);

    // 3. Generate available empty bin coordinates
    interface Coordinate { rackId: string, col: number, floor: number }
    const availableFloorCoords: Coordinate[] = [];
    const availableUpperCoords: Coordinate[] = [];

    racks.forEach(rack => {
      for (let col = 1; col <= rack.dimensions.columns; col++) {
        for (let floor = 0; floor < rack.dimensions.floors; floor++) {
          const coord = { rackId: rack.id, col, floor };
          if (floor === 0) {
            availableFloorCoords.push(coord);
          } else {
            availableUpperCoords.push(coord);
          }
        }
      }
    });

    // Reverse them so we can pop() from the start of the list efficiently
    // In a real greedy approach, we might want to pop coordinates closest to a dispatch zone.
    availableFloorCoords.reverse(); 
    availableUpperCoords.reverse();

    // 4. Generate new Bin assignments (Greedy Assignment)
    const newBins: (Bin & { rackId: string })[] = [];
    
    for (const item of productList) {
      const isHeavy = item.product.tags.includes('heavy');
      const unitsPerBin = Math.min(
        Math.floor(MAX_WEIGHT / item.product.unitWeight),
        Math.floor(MAX_VOLUME / item.product.unitVolume)
      );

      let remainingUnits = item.targetVolume;

      for (let i = 0; i < item.reqBins; i++) {
        let assignedCoord: Coordinate | undefined;

        if (isHeavy) {
          assignedCoord = availableFloorCoords.pop();
          if (!assignedCoord) {
            throw new Error(`Not enough floor (0) coordinates for heavy product ${item.product.id}`);
          }
        } else {
          // Normal products prefer upper coordinates first, fallback to floor
          assignedCoord = availableUpperCoords.length > 0 ? availableUpperCoords.pop() : availableFloorCoords.pop();
          if (!assignedCoord) {
            throw new Error(`Not enough total rack space for product ${item.product.id}`);
          }
        }

        const units = Math.min(remainingUnits, unitsPerBin);
        remainingUnits -= units;

        newBins.push({
          id: `bin-${item.product.id}-${i}`,
          localCoordinates: { col: assignedCoord.col, floor: assignedCoord.floor },
          productId: item.product.id,
          currentWeight: units * item.product.unitWeight,
          unitCount: units,
          rackId: assignedCoord.rackId
        });
      }
    }

    // 5. Save with a chunked Firestore writeBatch
    const batches: Promise<void>[] = [];
    let currentBatch = writeBatch(db);
    let opCount = 0;

    const commitCurrentBatch = () => {
      if (opCount > 0) {
        batches.push(currentBatch.commit());
        currentBatch = writeBatch(db);
        opCount = 0;
      }
    };

    // First delete all existing old bins
    for (const rack of racks) {
      const binsRef = collection(db, 'Racks', rack.id, 'Bins');
      const existingBins = await getDocs(binsRef);
      for (const b of existingBins.docs) {
        currentBatch.delete(b.ref);
        opCount++;
        if (opCount >= 490) commitCurrentBatch();
      }
    }

    // Then write all new bins
    for (const bin of newBins) {
      const binRef = doc(db, 'Racks', bin.rackId, 'Bins', bin.id);
      const { rackId, ...binData } = bin; 
      currentBatch.set(binRef, binData);
      opCount++;
      if (opCount >= 490) commitCurrentBatch();
    }

    // Commit any remaining operations
    commitCurrentBatch();
    await Promise.all(batches);

    return NextResponse.json({ success: true, message: 'Layout generated successfully.', binsGenerated: newBins.length });

  } catch (error: any) {
    console.error("Layout API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
