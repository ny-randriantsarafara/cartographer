export interface Point {
  lat: number;
  lng: number;
}

export interface RadiusQuery {
  center: Point;
  radiusMeters: number;
}
