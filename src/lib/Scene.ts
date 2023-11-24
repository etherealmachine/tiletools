import { Camera } from "./Camera";
import Point from "./Point";
import type Tilemap from "./Tilemap";
import { drawScene, setupCanvasContext } from "./draw";
import FOV from "./fov";

export interface Viewport {
  width: number;
  height: number;
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

export default class Scene {
  viewport: Viewport;
  camera: Camera;
  tilemap: Tilemap;
  characters: Character[] = [];
  seen: { [key: string]: boolean } = {};
  fov: FOV | undefined;

  constructor(tilemap: Tilemap) {
    this.viewport = { width: 0, height: 0 };
    this.camera = new Camera();
    this.tilemap = tilemap;
    let paths = this.tilemap.filter(
      (d) => !!d && (d["tags"] as string[]).includes("path"),
    );
    if (paths.length === 0) paths = [new Point(0, 0)];
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

  currentPlayer(): Character | undefined {
    return this.characters.find((c) => c.controlled_by === "current_player");
  }

  moveCharacter(character: Character, dx: number, dy: number) {
    const newPos = character.position.add(dx, dy);
    const door = this.tilemap.tiledata
      .filter<Point>("door")
      .find(([from, _to]) => {
        return newPos.x === from.x && newPos.y === from.y;
      });
    if (door && !door[1].equals(character.position)) {
      character.position = door[1].clone();
    } else {
      const positionData = this.tilemap.dataAt(newPos);
      if (
        positionData.some(
          (d) => d["tags"] && (d["tags"] as string[]).includes("wall"),
        )
      ) {
        const currDoor = this.tilemap.tiledata.get<Point | undefined>(
          character.position,
          "door",
          undefined,
        );
        if (currDoor) {
          character.position = currDoor;
        } else {
          return;
        }
      } else {
        if (
          this.tilemap.layers.every((layer) => !layer.tiles[newPos.toString()])
        ) {
          return;
        }
        character.position = newPos;
      }
    }
    this.fov = new FOV(
      character.position,
      10,
      (pos: Point): boolean => {
        const positionData = this.tilemap.dataAt(pos);
        return positionData.some(
          (d) => d["tags"] && (d["tags"] as string[]).includes("wall"),
        );
      },
      (pos: Point) => {
        return this.tilemap.layers.every(
          (layer) => layer.tiles[pos.toString()] === undefined,
        );
      },
    );
    this.fov.calculate();
    for (let pos of this.fov.lit) {
      this.seen[pos.toString()] = true;
    }
    this.centerCameraOnCurrentCharacter();
  }

  centerCameraOnCurrentCharacter() {
    const c = this.currentPlayer();
    if (c) {
      this.camera.center.x = c.position.x * this.tilemap.tileset.tilewidth;
      this.camera.center.y = c.position.y * this.tilemap.tileset.tileheight;
    }
  }

  draw(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setupCanvasContext(ctx, this.camera);
    drawScene(ctx, this);
  }
}
