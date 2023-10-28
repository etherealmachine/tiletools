import type { Layer } from "./MapEditor.svelte";
import type Tileset from "./Tileset";

export interface Camera {
  centerX: number
  centerY: number
  zoom: number
}

export interface Tilemap {
  layers: Layer[];
  tileset: Tileset;
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
    return this.entities.find(e => components.includes(e.component)) as (T | undefined);
  }
}