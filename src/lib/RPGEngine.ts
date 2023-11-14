import type Point from "./Point";
import type Tilemap from "./Tilemap";

export interface Camera {
  centerX: number;
  centerY: number;
  zoom: number;
}

export interface Character {
  name: string;
  token: string | ImageBitmap;
  position: Point;
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
    const paths = this.tilemap.filter(d => !!d && (d['tags'] as string[]).includes("path"));
    this.addCharacter({
      name: "Player",
      token:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABqklEQVQY06WRMUhbURSGv0h8kBKetppGBRErWaoQqEWMtIttdBCUgpQM9k51ELfQyUUcyltEdIiLnZ4WOnTQgkNLDbhUiGAQmqE8aHTQ6yNFQYKKBq5LiYnviRHPdC/nP9/9/3OJxyLKMAwVj0UUgGEYijuUNxAeRAiBaYIRHlRCCAClZ+Yc4vGlA48DACClRAiBlBIpJQDtjV4HIDHSoK5DiirTNAGIRqMAhIamyoatlUn3CLntb2RONslZkpkvGx5AiZeP+fl9ldf9AwAkZz8CGjoai8NP1Hp3rdMBQDwWUXpmDuvQSwtgraT+dzTaHlYXdce9fgDSyTxVpYBXLzrxt/YU76GhqbIoudMCudMC+9lDdwcA9cEmdu0uWs5SJbm1G7+xintWmYN/9j5vJz6ztpwgz1UUsvOVOah72sPacsIhWu+uJT0WJPXGR9/Cb3cH4VAjhT+/3J/xXx1/jHbQBQR8NvrRRXmE85pmHjQ0OwF7O7fvYNuSHD/fIaidu8i0ypZYWnbWOdTU+oiAz64MAPDpw5YH4P30M5VO5gHQjy6K/Xdf/3ouAbr/hlXyQ9uGAAAAAElFTkSuQmCC",
      position: paths[0].clone(),
      health: {
        max: 20,
        current: 20,
      },
      items: [
        {
          name: "Short Sword",
          damage: "1d6",
          skills: ["Melee weapons"],
        },
      ],
      controlled_by: "current_player",
    });
  }

  addCharacter(character: Character) {
    this.characters.push(character);
  }
}
