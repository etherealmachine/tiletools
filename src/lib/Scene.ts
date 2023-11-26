import { Camera } from "./Camera";
import Point from "./Point";
import type Tilemap from "./Tilemap";
import { drawScene } from "./draw";
import FOV from "./fov";

export interface Viewport {
  width: number;
  height: number;
}

export interface Character {
  name: string;
  profile?: string | ImageBitmap;
  sprite?: string | ImageBitmap;
  position: Point;
  health: {
    max: number;
    current: number;
  };
  items: Item[];
  controlled_by: string;
}

export interface Container {
  name: string;
  sprite: string | ImageBitmap;
  position: Point;
  weight: number;
  capacity: { width: number; height: number };
  items: Item[];
}

export interface Item {
  name: string;
  amount?: number;
  damage?: string;
  skills?: string[];
  contents?: Item[];
}

export type Entity = Character | Container;

export default class Scene {
  viewport: Viewport;
  camera: Camera;
  tilemap: Tilemap;
  entities: Entity[] = [];

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
    this.entities.push({
      name: "Player",
      sprite:
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
    this.entities.push({
      name: "Chest",
      sprite:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAnklEQVQ4y2NgGPKAEZlTWl//nxhN3Y2NcH0syBpdXN2Itfg/zCCW0vr6/zCN/A92M3xUcGXgf7Abqy6YHJJF/5lgLFyasAFktUyUBiLFBrAwMDAwvP/0iYHh+T0GBgYGhvdCCDa/pBLE71jk3gt9QhiACxw/vJ+BgYGBQUtFHr8LcAFLW0cUF5BsAD6NgywWGBgYGN5rRzJgY6MDdDkAImM4MPFxfVIAAAAASUVORK5CYII=",
      position: new Point(29, 7),
      weight: 10,
      capacity: { width: 3, height: 3 },
      items: [{ name: "Silver Coins", amount: 5 }],
    });
    this.fov = new FOV(
      this.entities[0].position,
      10,
      (pos: Point): boolean => {
        return !!this.tilemap.tagsAt(pos)?.flat().includes("wall");
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
  }

  currentPlayer(): Character | undefined {
    return this.entities.find(
      (c) => "controlled_by" in c && c.controlled_by === "current_player",
    ) as Character;
  }

  moveCharacter(character: Character, dx: number, dy: number) {
    const newPos = character.position.add(dx, dy);
    const doorTo = this.tilemap.dataAt<Point>(newPos, "door");
    if (doorTo && !doorTo.equals(character.position)) {
      character.position = doorTo.clone();
    } else {
      const tags = this.tilemap.tagsAt(newPos);
      if (
        tags &&
        (tags.flat().includes("wall") ||
          tags[tags.length - 1]?.includes("water"))
      ) {
        const currDoor = this.tilemap.dataAt<Point>(character.position, "door");
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
    const player = this.currentPlayer();
    if (player) {
      this.fov = new FOV(
        player.position,
        10,
        (pos: Point): boolean => {
          return !!this.tilemap.tagsAt(pos)?.flat().includes("wall");
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
    }
  }

  centerCameraOnCurrentCharacter() {
    const c = this.currentPlayer();
    if (c) {
      const world = new Point(
        c.position.x * this.tilemap.tileset.tilewidth,
        c.position.y * this.tilemap.tileset.tileheight,
      );
      const center = new Point(
        this.viewport.width / 2,
        this.viewport.height / 2,
      );
      this.camera.offset.x = center.x - world.x * this.camera.zoom;
      this.camera.offset.y = center.y - world.y * this.camera.zoom;
    }
  }

  draw(canvas: HTMLCanvasElement, mouse?: Point) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    this.viewport.width = ctx.canvas.width;
    this.viewport.height = ctx.canvas.height;
    this.centerCameraOnCurrentCharacter();
    this.camera.setup(ctx);
    drawScene(ctx, this, mouse);
  }
}
