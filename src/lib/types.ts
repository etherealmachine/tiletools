export class Tileset {
  name: string
  img?: HTMLImageElement
  type: "square" | "hex"
  tilewidth: number
  tileheight: number
  margin: number
  spacing: number
  tiledata: { [key: number]: { [key: number]: { [key: string]: any } } }

  constructor(args: any) {
    this.name = args.name || "";
    this.type = args.type || "square";
    this.tilewidth = args.tilewidth || 0;
    this.tileheight = args.tileheight || 0;
    this.margin = args.margin || 0;
    this.spacing = args.spacing || 0;
    this.tiledata = args.tiledata || {};
  }

  loaded(): boolean {
    return !!(this.img && this.img.complete);
  }

  worldToTile(x: number, y: number): number[] {
    if (!this.tilewidth || !this.tileheight) return [0, 0];
    if (this.type === "hex") {
      return round_axial(
        ((2/3)*x) / this.radius(),
        ((-1/3)*x + Math.sqrt(3)/3*y)/this.radius());
    }
    return [
      Math.floor(x / this.tilewidth),
      Math.floor(y / this.tileheight),
    ];
  }

  tileToWorld(x: number, y: number): number[] {
    if (!this.tilewidth || !this.tileheight) return [0, 0];
    if (this.type === "hex") {
      return [
        this.radius()*(3/2)*x,
        this.radius()*((Math.sqrt(3)/2)*x + Math.sqrt(3)*y),
      ];
    }
    return [
      x*(this.tilewidth+this.spacing)+this.margin,
      y*(this.tileheight+this.spacing)+this.margin,
    ];
  }

  imgCoordsToTile(x: number, y: number) {
    if (!this.tilewidth || !this.tileheight) return [0, 0];
    return [
      Math.floor((x-this.margin) / (this.tilewidth+this.spacing)),
      Math.floor((y-this.margin) / (this.tileheight+this.spacing)),
    ];
  }

  tileToImgCoords(x: number, y: number) {
    if (!this.tilewidth || !this.tileheight) return [0, 0];
    return [
      x*(this.tilewidth+this.spacing)+this.margin,
      y*(this.tileheight+this.spacing)+this.margin,
    ];
  }

  /*
    Hex Math at https://www.redblobgames.com/grids/hexagons/
       ________
      /        \     |
     /          \    |
    /      __r___\   h
    \            /   |
     \          /    |
      \___w____/     |

    w = Tile Width
    r = Tile Width / 2
    h = √3 * r
  */
  radius(): number {
    return this.tilewidth/2;
  }

  hexHeight(): number {
    return Math.ceil(Math.sqrt(3)*this.radius());
  }

  metadata(): any {
    return {
      name: this.name,
      type: this.type,
      tilewidth: this.tilewidth,
      tileheight: this.tileheight,
      margin: this.margin,
      spacing: this.spacing,
      tiledata: this.tiledata,
    };
  }

  offsetWidth(): number {
    return this.tilewidth + this.spacing;
  }

  offsetHeight(): number {
    return this.tileheight + this.spacing;
  }

}

function round_axial(x: number, y: number): number[] {
  const xgrid = Math.round(x), ygrid = Math.round(y);
  x -= xgrid, y -= ygrid; // remainder
  const dx = Math.round(x + 0.5*y) * (x*x >= y*y ? 1 : 0);
  const dy = Math.round(y + 0.5*x) * (x*x < y*y ? 1 : 0);
  return [xgrid + dx, ygrid + dy];
}