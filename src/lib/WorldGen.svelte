<script lang="ts" context="module">
</script>

<script lang="ts">
    import { onMount } from "svelte";
    import { Camera } from "./Camera";
    import Tileset from "./Tileset";
    import Tilemap from "./Tilemap";
    import Point from "./Point";

  let canvas: HTMLCanvasElement;
  let map: Tilemap = new Tilemap();
  let camera: Camera = new Camera();

  function draw() {
    const W = (canvas.parentElement?.scrollWidth || 0) - 4;
    const H = (canvas.parentElement?.scrollHeight || 0) - 4;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    camera.zoom = 0.5;
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
    const tiles = [
      findTile('grassland'),
      findTile('shallow water'),
      findTile('deep water'),
      findTile('desert'),
    ];
    const w = 20;
    const h = 20;
    // Seed the map with a few start points
    // Expand in rings from each seed, assigning the point to the seed
    // Skip over points assigned to another seed
    // Stop if we go out of bounds
    const generators = tiles.map((tile) => {
      const x = Math.floor(Math.random()*w);
      const y = Math.floor(Math.random()*h);
      const seed = new Point(x, y-Math.floor(x/2));
      return { tile, generator: spiral(seed, Infinity) };
    });
    let filled = false;
    while (!filled) {
      const g = generators.shift();
      if (!g) break;
      const p = g.generator.next();
      if (!p.value) break;
      if (p.value.x >= 0 && p.value.x < w && p.value.y >= 0 && p.value.y < h && !map.get(p.value)) {
        map.set(p.value, g.tile);
      }
      generators.push(g);
      filled = true;
      for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
          if (!map.get(new Point(x, y))) {
            filled = false;
          }
        }
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
    />
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