<script lang="ts">
  import { page } from '$app/stores';

  import { PNGWithMetadata } from "$lib/PNGWithMetadata";
  import Scene from "$lib/Scene.svelte";
  import Tileset from "$lib/Tileset";
  import ECS, { type Camera, type Character, type Tilemap } from "$lib/ECS";
  import type { Layer } from '$lib/MapEditor.svelte';

  let ecs: ECS;

  function onLoad(e: Event) {
    if (e.target === null) return;
    const files = (e.target as HTMLInputElement).files;
    if (files === null) return;
    const file = files[0];
    ecs = new ECS();
    PNGWithMetadata.fromFile(file).then(png => {
      const tilesetPNG = PNGWithMetadata.fromDataURL(png.metadata.tileset);
      const tileset = new Tileset(tilesetPNG.metadata);
      tileset.setImageFromDataURL(tilesetPNG.dataURL());
      ecs.add<Tilemap>("Tilemap", {
        layers: png.metadata.layers,
        tileset: tileset,
      });
      const paths: number[][] = [];
      (png.metadata.layers as Layer[]).forEach(layer => {
        Object.entries(layer.tiles).forEach(([loc, tile]) => {
          const tags = tileset.getTileData<string[]>(tile.tileX, tile.tileY, 'tags', []);
          if (tags.includes('path')) {
            const [x, y] = loc.split(',').map(v => parseInt(v));
            paths.push([x, y]);
          }
        });
      });
      const r1 = paths[Math.floor(Math.random()*paths.length)];
      ecs.add<Character>('Character', {
        name: 'Player',
        portrait: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABqklEQVQY06WRMUhbURSGv0h8kBKetppGBRErWaoQqEWMtIttdBCUgpQM9k51ELfQyUUcyltEdIiLnZ4WOnTQgkNLDbhUiGAQmqE8aHTQ6yNFQYKKBq5LiYnviRHPdC/nP9/9/3OJxyLKMAwVj0UUgGEYijuUNxAeRAiBaYIRHlRCCAClZ+Yc4vGlA48DACClRAiBlBIpJQDtjV4HIDHSoK5DiirTNAGIRqMAhIamyoatlUn3CLntb2RONslZkpkvGx5AiZeP+fl9ldf9AwAkZz8CGjoai8NP1Hp3rdMBQDwWUXpmDuvQSwtgraT+dzTaHlYXdce9fgDSyTxVpYBXLzrxt/YU76GhqbIoudMCudMC+9lDdwcA9cEmdu0uWs5SJbm1G7+xintWmYN/9j5vJz6ztpwgz1UUsvOVOah72sPacsIhWu+uJT0WJPXGR9/Cb3cH4VAjhT+/3J/xXx1/jHbQBQR8NvrRRXmE85pmHjQ0OwF7O7fvYNuSHD/fIaidu8i0ypZYWnbWOdTU+oiAz64MAPDpw5YH4P30M5VO5gHQjy6K/Xdf/3ouAbr/hlXyQ9uGAAAAAElFTkSuQmCC',
        position: {
          x: r1[0], y: r1[1],
        },
      });
      const r2 = paths[Math.floor(Math.random()*paths.length)];
      ecs.add<Character>('Character', {
        name: 'Orc',
        portrait: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABTElEQVQY06WRsUvDYBDFfylx0cEIDbZC69K6xlVBCYKbDsWlUzcXcShuXRwcDHTopP+BQxwEsWNQMrWCQcwgqN0qWOTrUBcFlzhoY9okgu2b7r579+7ddwAYhuExImTDMLxSqQTgVSoVCWBxfzNS8O6gLg2/SY7j+GTLsjj9aKBk1chpvbYIiSQsy/Kb+w7+g0RcodcWkXHoD4R7wf37DaLVQdd1r/dTCK4RjHVd91e2bVuSg2q5XA7hCt6yYG4cYu0uA7B+1KBaLnyTUr98G5CHLamqCnWBM3XCzNYOANVyAS2fDtnfKy55CcbEgAMhBKZpcnl+HElOzs75cff1JXyF7eJKbHOsg6uFJLdZBeYVVh8b463wOZ1hMpUJsx7O4gXWnrpo3gRuq8M1oOWfR3cQhNvqhHJtKK+ZTUn+S71mNqX+vbV8ekC0X/sCfEF0/rAYTgQAAAAASUVORK5CYII=',
        position: {
          x: r2[0], y: r2[1],
        },
      });
      ecs.add<Camera>('Camera', {
        centerX: 0,
        centerY: 0,
        zoom: 1,
      });
    });
  }
</script>

<div style="display: flex; gap: 16px; justify-content: space-between; width: 100%;">
  {#if ecs}
    <Scene ecs={ecs} />
  {:else}
    <input
      type="file"
      accept="image/png"
      on:change={onLoad} />
  {/if}
</div>