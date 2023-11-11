<script lang="ts">
  import Scene from "$lib/Scene.svelte";
  import RPGEngine from "$lib/RPGEngine";
  import Tilemap from "$lib/Tilemap";

  let engine: RPGEngine;

  function onLoad(e: Event) {
    if (e.target === null) return;
    const files = (e.target as HTMLInputElement).files;
    if (files === null) return;
    const file = files[0];
    Tilemap.from(file).then(tilemap => {
      console.log(tilemap.tileset);
      engine = new RPGEngine(
        {
          centerX: 0,
          centerY: 0,
          zoom: 1,
        },
        tilemap,
      );
      engine.addCharacter({
        name: "Player",
        token:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABqklEQVQY06WRMUhbURSGv0h8kBKetppGBRErWaoQqEWMtIttdBCUgpQM9k51ELfQyUUcyltEdIiLnZ4WOnTQgkNLDbhUiGAQmqE8aHTQ6yNFQYKKBq5LiYnviRHPdC/nP9/9/3OJxyLKMAwVj0UUgGEYijuUNxAeRAiBaYIRHlRCCAClZ+Yc4vGlA48DACClRAiBlBIpJQDtjV4HIDHSoK5DiirTNAGIRqMAhIamyoatlUn3CLntb2RONslZkpkvGx5AiZeP+fl9ldf9AwAkZz8CGjoai8NP1Hp3rdMBQDwWUXpmDuvQSwtgraT+dzTaHlYXdce9fgDSyTxVpYBXLzrxt/YU76GhqbIoudMCudMC+9lDdwcA9cEmdu0uWs5SJbm1G7+xintWmYN/9j5vJz6ztpwgz1UUsvOVOah72sPacsIhWu+uJT0WJPXGR9/Cb3cH4VAjhT+/3J/xXx1/jHbQBQR8NvrRRXmE85pmHjQ0OwF7O7fvYNuSHD/fIaidu8i0ypZYWnbWOdTU+oiAz64MAPDpw5YH4P30M5VO5gHQjy6K/Xdf/3ouAbr/hlXyQ9uGAAAAAElFTkSuQmCC",
        position: {
          x: 0,
          y: 0,
        },
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
    });
  }
</script>

<div
  style="display: flex; gap: 16px; justify-content: space-between; width: 100%;"
>
  {#if engine}
    <Scene {engine} />
  {:else}
    <input type="file" accept="image/png" on:change={onLoad} />
  {/if}
</div>
