import { Revivifiable } from "./Revivify";

export default class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(dx: number, dy: number): Point {
    return new Point(this.x+dx, this.y+dy);
  }
  
  floor(): Point {
    return new Point(Math.floor(this.x), Math.floor(this.y));
  }

  dist(p: Point): number {
    return Math.sqrt(Math.pow(p.x-this.x, 2)+Math.pow(p.y-this.y, 2));
  }

  clone(): Point {
    return new Point(this.x, this.y);
  }

  equals(p: Point): boolean {
    return p.x === this.x && p.y === this.y;
  }

  toString(): string {
    return `${this.x},${this.y}`;
  }

  toJSON() {
    return {
      class: 'Point',
      data: { x: this.x, y: this.y },
    };
  }

  static from(v: string | { x: number, y: number }): Point {
    if (typeof(v) === 'string') {
      const [x, y] = v.split(",").map((v) => parseInt(v));
      return new Point(x, y);
    }
    return new Point(v.x, v.y);
  }
}
Revivifiable(Point);