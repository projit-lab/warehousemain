import { create } from 'zustand';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Rack, Bin } from '@/types/schema';

export interface StoreBin extends Bin {
  rackId: string;
}

interface WarehouseState {
  racks: Rack[];
  bins: StoreBin[];
  loading: boolean;
  fetchWarehouseData: () => Promise<void>;
}

export const useWarehouseStore = create<WarehouseState>((set) => ({
  racks: [],
  bins: [],
  loading: false,
  fetchWarehouseData: async () => {
    set({ loading: true });
    try {
      const racksSnapshot = await getDocs(collection(db, 'Racks'));
      const fetchedRacks: Rack[] = [];
      const fetchedBins: StoreBin[] = [];

      for (const rackDoc of racksSnapshot.docs) {
        const rackData = rackDoc.data() as Rack;
        fetchedRacks.push(rackData);

        const binsSnapshot = await getDocs(collection(db, 'Racks', rackDoc.id, 'Bins'));
        binsSnapshot.forEach((binDoc) => {
          const binData = binDoc.data() as Bin;
          fetchedBins.push({ ...binData, rackId: rackDoc.id });
        });
      }
      set({ racks: fetchedRacks, bins: fetchedBins, loading: false });
    } catch (error) {
      console.error("Error fetching warehouse data:", error);
      set({ loading: false });
    }
  },
}));
