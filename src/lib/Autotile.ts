import Point from "./Point";
import type Tilemap from "./Tilemap";

enum Dir {
  Above,
  Below,
  Up,
  Down,
  Left,
  Right,
}

export default class Autotile {
  update(map: Tilemap, loc: Point) {
    const curr = map.layers[map.selectedLayer].tiles[loc.toString()];
    const above = map.layers[map.selectedLayer - 1]?.tiles[loc.toString()];
    const below = map.layers[map.selectedLayer + 1]?.tiles[loc.toString()];
    const up =
      map.layers[map.selectedLayer].tiles[loc.add(new Point(0, -1)).toString()];
    const down =
      map.layers[map.selectedLayer].tiles[loc.add(new Point(0, 1)).toString()];
    const left =
      map.layers[map.selectedLayer].tiles[loc.add(new Point(-1, 0)).toString()];
    const right =
      map.layers[map.selectedLayer].tiles[loc.add(new Point(1, 0)).toString()];
    if (above) this.connect(curr, above, Dir.Above);
    if (below) this.connect(curr, below, Dir.Below);
    if (up) this.connect(curr, up, Dir.Up);
    if (down) this.connect(curr, down, Dir.Down);
    if (left) this.connect(curr, left, Dir.Left);
    if (right) this.connect(curr, right, Dir.Right);
  }

  connect(a: Point, b: Point, dir: Dir) {}
}
