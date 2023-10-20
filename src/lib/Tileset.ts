import { PNGWithMetadata } from "./PNGWithMetadata"

export default class Tileset {
  name: string
  img?: HTMLImageElement
  type: "square" | "hex"
  tilewidth: number
  tileheight: number
  margin: number
  spacing: number
  tiledata: { [key: number]: { [key: number]: { [key: string]: any } } }
  selectedTiles: number[][] = []

  constructor(args: { [key: string]: any }) {
    this.name = args.name || "";
    this.img = args.img;
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
      x*this.tilewidth,
      y*this.tileheight,
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

  setSelectedTile(x: number, y: number) {
    this.selectedTiles = [[x, y]]
  }

  addSelectedTile(x: number, y: number) {
    this.selectedTiles.push([x, y]);
  }

  widthInTiles(): number {
    if (!this.img) return 0;
    return (this.img.width - this.margin) / this.offsetWidth();
  }

  heightInTiles(): number {
    if (!this.img) return 0;
    return (this.img.height - this.margin) / this.offsetHeight();
  }

  // Is x and y contained in the tileset's image?
  // x, y in image coordinates
  inBounds(x: number, y: number): boolean {
    return x >= 0 && x <= (this.img?.width || 0) && y >= 0 && y <= (this.img?.width || 0);
  }

  // Is x and y contained in the selection?
  // x, y in image coordinates
  inSelection(x: number, y: number): boolean {
    return this.inBounds(x, y) && this.selectedTiles.some(loc => {
      const [x1, y1] = this.tileToImgCoords(loc[0], loc[1]);
      const [x2, y2] = this.tileToImgCoords(loc[0]+1, loc[1]+1);
      return x >= x1 && x < x2 && y >= y1 && y < y2;
    });
  }

  randSelectedTile(): number[] | undefined {
    if (this.selectedTiles.length === 0) return undefined;
    return this.selectedTiles[Math.floor(Math.random()*this.selectedTiles.length)];
  }

  download() {
    if (!this.img) return;
    const png = new PNGWithMetadata(this.name, this.metadata(), this.img.src);
    png.download();
  }

  static loadFromFile(file: File, into?: Tileset): Promise<Tileset> {
    return new Promise((resolve, reject) => {
      PNGWithMetadata.fromFile(file).then(png => {
        if (!into) {
          into = new Tileset({});
        }
        if (!into.img) {
          into.img = document.createElement('img');
        }
        const img = into.img;
        if (!img) {
          reject('tileset has no HTML Image Element');
        } else {
          img.src = png.dataURL();
          Object.assign(into, png.metadata);
          resolve(into);
        }
      });
    });
  }
}

function round_axial(x: number, y: number): number[] {
  const xgrid = Math.round(x), ygrid = Math.round(y);
  x -= xgrid, y -= ygrid; // remainder
  const dx = Math.round(x + 0.5*y) * (x*x >= y*y ? 1 : 0);
  const dy = Math.round(y + 0.5*x) * (x*x < y*y ? 1 : 0);
  return [xgrid + dx, ygrid + dy];
}