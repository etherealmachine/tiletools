import { Revivifiable, type JSONValue } from "./Revivify";
import Point from "./Point";

export default class Tiledata {
  data: { [key: string]: { [key: string]: JSONValue } } = {};

  set(tile: Point, key: string, value: any) {
    const tileKey = tile.toString();
    if (!this.data[tileKey]) this.data[tileKey] = {};
    this.data[tileKey][key] = value;
  }

  get<T extends JSONValue | undefined>(
    tile: Point,
    key: string,
  ): T | undefined {
    const tileKey = tile.toString();
    if (!this.data[tileKey]) return undefined;
    return this.data[tileKey][key] as T | undefined;
  }

  filter<T>(key: string): [Point, T][] {
    return Object.entries(this.data)
      .filter(([_loc, data]) => {
        return data[key] !== undefined;
      })
      .map(([loc, data]) => {
        return [Point.from(loc), data[key] as T];
      });
  }

  toJSON() {
    return {
      class: "Tiledata",
      data: this.data,
    };
  }

  static from(data: { [key: string]: { [key: string]: JSONValue } }): Tiledata {
    const tiledata = new Tiledata();
    tiledata.data = data;
    return tiledata;
  }
}
Revivifiable(Tiledata);
