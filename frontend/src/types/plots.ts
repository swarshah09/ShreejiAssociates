export type PlotStatus = 'AVAILABLE' | 'SOLD' | 'IN_PROGRESS' | 'RESERVED';

export interface PlotShape {
  id: string;
  plotNumber: string;
  status: PlotStatus;
  points: number[]; // [x1, y1, x2, y2, ...] in image coordinate space
}

export interface PlotMetadata {
  area?: string;
  dimensions?: string;
  direction?: string;
  type?: string;
  price?: string;
  negotiable?: string;
}


