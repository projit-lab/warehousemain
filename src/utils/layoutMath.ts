import { Product } from '@/types/schema';

export const MAX_WEIGHT = 100; // max 100 kg
export const MAX_VOLUME = 1; // max 1 cubic meter

export function calculateRequiredBins(product: Product, targetInventoryVolume: number): number {
  if (product.unitWeight <= 0 || product.unitVolume <= 0) return 0;
  
  const maxUnitsByWeight = Math.floor(MAX_WEIGHT / product.unitWeight);
  const maxUnitsByVolume = Math.floor(MAX_VOLUME / product.unitVolume);
  
  const maxUnitsPerBin = Math.min(maxUnitsByWeight, maxUnitsByVolume);
  if (maxUnitsPerBin <= 0) return 0;
  
  return Math.ceil(targetInventoryVolume / maxUnitsPerBin);
}

export function calculateCOI(product: Product, arrivalRate: number): number {
  if (arrivalRate === 0) return Infinity; 
  return product.unitVolume / arrivalRate;
}
