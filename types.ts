
export interface Point {
  id: string;
  name: string;
  x: number;
  y: number;
  labelXOffset: number;
  labelYOffset: number;
}

export interface Line {
  id: string;
  p1: string; // Point ID
  p2: string; // Point ID
  type: 'solid' | 'dashed';
}

export interface Circle {
  id: string;
  centerId: string;
  pointOnCircleId?: string;
  radius?: number;
}

export interface Angle {
  id: string;
  vertexId: string;
  p1Id: string;
  p2Id: string;
  isRightAngle: boolean;
}

export interface GeometryData {
  points: Point[];
  lines: Line[];
  circles: Circle[];
  angles: Angle[];
}

export interface HistoryState {
  geometry: GeometryData;
}
