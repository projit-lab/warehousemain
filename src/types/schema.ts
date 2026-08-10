export interface Product {
  id: string;
  name: string;
  tags: string[];
  unitWeight: number;
  unitVolume: number;
  velocityClass: 'A' | 'B' | 'C';
}

export interface Rack {
  id: string;
  zone: string;
  originCoordinates: {
    x: number;
    y: number;
    z: number;
  };
  dimensions: {
    columns: number;
    floors: number;
  };
}

export interface Bin {
  id: string;
  localCoordinates: {
    col: number;
    floor: number;
  };
  productId: string;
  currentWeight: number;
  unitCount: number;
}
