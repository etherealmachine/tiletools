import Point from "./Point";
import type Tileset from "./Tileset";

export class Camera {
  offset: Point;
  zoom: number;

  constructor() {
    this.offset = new Point(0, 0);
    this.zoom = 1;
  }

  screenToWorld(screen: Point): Point {
    return new Point(
      (screen.x - this.offset.x) / this.zoom,
      (screen.y - this.offset.y) / this.zoom,
    );
  }

  worldToScreen(world: Point): Point {
    return new Point(
      world.x * this.zoom + this.offset.x,
      world.y * this.zoom + this.offset.y,
    );
  }

  screenToTile(screen: Point, tileset: Tileset): Point {
    return tileset.worldToTile(this.screenToWorld(screen));
  }

  tileToScreen(tile: Point, tileset: Tileset): Point {
    return this.worldToScreen(tileset.tileToWorld(tile));
  }

  zoomTo(delta: number, point?: Point) {
    const prevZoom = this.zoom;
    this.zoom *= (1+delta);
    this.zoom = Math.min(Math.max(0.25, this.zoom), 8);
    if (point) {
      this.offset.x =
        (-this.zoom * (point.x - this.offset.x)) / prevZoom + point.x;
      this.offset.y =
        (-this.zoom * (point.y - this.offset.y)) / prevZoom + point.y;
    }
  }

  setup(ctx: CanvasRenderingContext2D) {
    ctx.imageSmoothingEnabled = false;
    ctx.resetTransform();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.setTransform(
      this.zoom,
      0,
      0,
      this.zoom,
      this.offset.x,
      this.offset.y,
    );
  }

}
