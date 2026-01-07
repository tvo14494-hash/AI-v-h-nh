export interface Point {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface Line {
  from: string;
  to: string;
  dashed?: boolean;
  isPerp?: boolean;
}

export interface Circle {
  center: string;
  radiusPt: string;
}

export interface GeometryData {
  points: Point[];
  lines: Line[];
  circles: Circle[];
  angles: any[];
}

export interface HistoryState {
  geometry: GeometryData;
}
