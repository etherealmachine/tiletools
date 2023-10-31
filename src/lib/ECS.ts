import type { Layer } from "./MapEditor.svelte";
import type Tileset from "./Tileset";

export interface Camera {
  centerX: number
  centerY: number
  zoom: number
}

export interface Tilemap {
  layers: Layer[]
  tileset: Tileset
}

export interface Character {
  name: string
  portrait: string | ImageBitmap
  position: { x: number, y: number }
}

interface Entity {
  component: string
  data: any
}

export default class ECS {

  entities: Entity[] = [];

  add<T>(componentName: string, component: T): number {
    this.entities.push({
      component: componentName,
      data: component,
    });
    return this.entities.length-1;
  }

  get<T>(...components: string[]): T | undefined {
    const e = this.entities.find(e => components.includes(e.component));
    if (e) {
      return e.data;
    }
    return undefined;
  }

  all<T>(...components: string[]): T[] {
    return this.entities.filter(e => components.includes(e.component)).map(e => {
      return e.data;
    });
  }
}