export interface Tileset {
  name: string
  type: "square" | "hex" | "isometric"
  tileheight: number
  tilewidth: number
  tileoffset: { x: number, y: number } 
  margin: number
  spacing: number
  tiledata: { [key: number]: { [key: string]: any } }
}