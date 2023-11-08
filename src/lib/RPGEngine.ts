import type Tilemap from "./Tilemap";

export interface Camera {
  centerX: number;
  centerY: number;
  zoom: number;
}

export interface Character {
  name: string;
  token: string | ImageBitmap;
  position: { x: number; y: number };
  health: {
    max: number;
    current: number;
  };
  items: Item[];
  controlled_by: string;
}

export interface Item {
  name: string;
  amount?: number;
  damage?: string;
  skills?: string[];
  contents?: Item[];
}

interface Entity {
  component: string;
  data: any;
}

export default class RPGEngine {
  camera: Camera;
  tilemap: Tilemap;
  characters: Character[] = [];

  constructor(camera: Camera, tilemap: Tilemap) {
    this.camera = camera;
    this.tilemap = tilemap;
  }

  addCharacter(character: Character) {
    this.characters.push(character);
  }
}
