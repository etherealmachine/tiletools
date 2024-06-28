<script lang="ts" context="module">
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import { Camera } from "./Camera";
  import Tileset from "./Tileset";
  import Tilemap from "./Tilemap";
  import Point from "./Point";
  import { greedy } from "./search";
  import './array_extensions';

  let canvas: HTMLCanvasElement | undefined;
  let hoverAside: HTMLElement | undefined;
  let map: Tilemap = new Tilemap();
  let camera: Camera = new Camera();
  let hoverText: string | undefined;
  let mouse: Point = new Point(-1, -1);
  let mouseOver: boolean = false;

  function draw() {
    if (!canvas) return;
    const W = (canvas.parentElement?.scrollWidth || 0) - 4;
    const H = (canvas.parentElement?.scrollHeight || 0) - 4;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    camera.zoom = 1;
    camera.centerOn(canvas, new Point(0, 0));
    ctx.imageSmoothingEnabled = false;
    ctx.resetTransform();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.setTransform(
      camera.zoom,
      0,
      0,
      camera.zoom,
      camera.offset.x,
      camera.offset.y,
    );
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#ffffff77";
    map.draw(ctx);
    Object.entries(map.tiledata.data).forEach(([key, entry]) => {
      const tile = Point.from(key);
      const loc = map.tileset.tileToWorld(tile);
      const height = entry['height'] as number | undefined;
      if (height !== undefined) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(height.toFixed(2), loc.x, loc.y);
      }
    });
  }

  const neighbors = [
    new Point(+1, 0),
    new Point(+1, -1),
    new Point(0, -1), 
    new Point(-1, 0),
    new Point(-1, +1),
    new Point(0, +1),
  ];

  function* ring(center: Point, radius: number) {
    let hex = center.add(new Point(-1, +1).scale(radius));
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < radius; j++) {
        yield hex;
        hex = hex.add(neighbors[i]);
      }
    }
  }

  function* spiral(center: Point, radius: number) {
    yield center;
    for (let i = 1; i <= radius; i++) {
      const r = ring(center, i);
      for (let p of r) {
        yield p;
      }
    }
  }

  function shuffle(a: Array<any>) {
    let i = a.length, j, temp;
    while(--i > 0) {
      j = Math.floor(Math.random()*(i+1));
      temp = a[j];
      a[j] = a[i];
      a[i] = temp;
    }
  }

  function dist(a: Point, b: Point): number {
    const vec = a.sub(b);
    return (Math.abs(vec.x) + Math.abs(vec.y) + Math.abs(- vec.x - vec.y)) / 2;
  }

  function onPointerMove(e: PointerEvent) {
    mouse = camera.screenToWorld(new Point(e.offsetX, e.offsetY));
    const tile = map.tileset.worldToTile(mouse);
    hoverText = map.tiledata.get<string | undefined>(tile, 'height');
  }

  onMount(async () => {
    const resp = await fetch("/weave/examples/Fantasy Hex.png");
    const blob = await resp.blob();
    const buf = await blob.arrayBuffer();
    map.tileset = await Tileset.from(buf);
    const findTile = (tag: string): Point => {
      const tiledata = map.tileset.tiledata.filter<Array<string>>("tags").find(([t, tags]) => {
        return tags.includes(tag);
      });
      if (tiledata) {
        return tiledata[0];
      }
      return new Point(0, 0);
    }

    const grass = findTile('grassland');
    const shallow = findTile('shallow water');
    const deep = findTile('deep water');
    const hills = findTile('rocky hills');
    const desert = findTile('desert');
    const mountain= findTile('mountains');

    const continentSeeds = [1, 2, 4, 4];
    const mapSize = 20;
    const margin = 2;
    const padding = 1;
    const center = new Point(0, 0);
    const possibleSeeds: Point[] = []
    for (let loc of spiral(center, Infinity)) {
      if (dist(loc, center) > mapSize) break;
      if (dist(loc, center) >= mapSize-margin) {
        map.set(loc, deep);
        map.tiledata.set(loc, 'ocean', true);
      } else {
        map.set(loc, shallow);
        map.tiledata.set(loc, 'ocean', true);
      }
      if (dist(loc, center) < mapSize-(margin+padding)) {
        possibleSeeds.push(loc);
      }
    }
    // Seed the map with a few start points for continents
    const continents = new Map(Array.from(Array(continentSeeds.length).keys()).map((i) => {
      shuffle(possibleSeeds);
      const seed = possibleSeeds.shift() || new Point(0, 0);
      map.set(seed, grass);
      map.tiledata.set(seed, 'continent', i);
      map.tiledata.set(seed, 'height', continentSeeds[i]);
      return [i, {
        index: i,
        locs: [seed],
        stack: [seed],
      }];
    }));
    // Rotate through continents, expanding them with a BFS
    // If two continents run into each other, mark the tile as a border
    const mountains = [];
    let progress = 1;
    while (progress) {
      progress = 0;
      for (let continent of continents.values()) {
        const curr = continent.stack.shift();
        if (!curr) continue;
        progress++;
        map.tiledata.set(curr, 'ocean', false);
        const h = map.tiledata.get<number>(curr, 'height') || 0;
        if (h <= 0) continue;
        // TODO: faster randomization
        shuffle(neighbors);
        for (let i = 0; i < neighbors.length; i++) {
          const n = curr.add(neighbors[i]);
          if (dist(center, n) >= mapSize-(margin+padding)) continue;
          const layers = map.tagsAt(n);
          if (!layers || layers.some(tags => tags?.includes('shallow water'))) {
            map.set(n, grass);
            map.tiledata.set(n, 'continent', continent.index);
            map.tiledata.set(n, 'height', h-2*Math.random());
            continent.locs.push(n);
            continent.stack.push(n);
          } else {
            if (map.tiledata.get(curr, 'border') !== undefined) continue;
            const otherContinentIndex = map.tiledata.get(n, 'continent');
            if (continent.index !== otherContinentIndex) {
              map.set(n, mountain);
              mountains.push(n);
              map.tiledata.set(n, 'border', [continent.index, otherContinentIndex]);
            }
          }
        }
      }
    }
    for (const continent of continents.values()) {
      for (const loc of continent.locs) {
        if (map.tiledata.get(loc, 'border')) {
          map.tiledata.set(loc, 'height', Infinity);
        } else {
          map.tiledata.set(loc, 'height', 0);
        }
      }
    }
    // River placement:
    // 1. Water falls on the mountains and flows to the sea
    for (let i = 0; i < 100; i++) {
      let curr = mountains[Math.floor(Math.random()*mountains.length)];
      let sediment = 1;
      while (sediment > 0 && !map.tiledata.get(curr, 'ocean')) {
        const h = map.tiledata.get<number | undefined>(curr, 'height') || 0;
        const sedimentDropped = sediment * 0.1 * Math.random();
        map.tiledata.set(curr, 'height', h + sedimentDropped);
        sediment -= sedimentDropped;
        neighbors.sort((a, b) => {
          const na = curr.add(a);
          const nb = curr.add(b);
          const nha = map.tiledata.get(na, 'height') || Infinity;
          const nhb = map.tiledata.get(na, 'height') || Infinity;
          if (nha === nhb) {
            return Math.random() < 0.5 ? -1 : 1;
          } else if (nha < nhb) {
            return -1;
          }
          return 1;
        });
        curr = curr.add(neighbors[0]);
      }
    }
    requestAnimationFrame(draw);
  });
</script>

<div style="display: flex; flex-direction: row; flex-grow: 1;">
  <div class="canvas">
    <canvas
      style="position: absolute;"
      tabindex="0"
      bind:this={canvas}
      on:pointermove={onPointerMove}
      on:pointerenter={() => {
        mouseOver = true;
      }}
      on:pointerleave={() => {
        mouseOver = false;
      }}
    />
    {#if hoverText !== undefined}
      <aside style="position: absolute;" bind:this={hoverAside}>
        {hoverText}
      </aside>
    {/if}
  </div>
</div>

<style>
  .canvas {
    border: 2px solid white;
    margin: 0;
    padding: 0;
    flex-grow: 1;
  }
</style>