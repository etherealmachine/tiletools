import Point from "./Point";
import type Tileset from "./Tileset";

export class Camera {
  center: Point;
  zoom: number;

  constructor() {
    this.center = new Point(0, 0);
    this.zoom = 1;
  }

  screenToWorld(screen: Point): Point {
    return new Point(
      (screen.x - this.center.x) / this.zoom,
      (screen.y - this.center.y) / this.zoom,
    );
  }

  worldToScreen(world: Point): Point {
    return new Point(
      world.x * this.zoom + this.center.x,
      world.y * this.zoom + this.center.y,
    );
  }

  screenToTile(screen: Point, tileset: Tileset): Point {
    const world = this.screenToWorld(screen);
    return tileset.worldToTile(world);
  }
}
