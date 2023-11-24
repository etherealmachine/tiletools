<script lang="ts">
  import type Tilemap from "./Tilemap";

  export let map: Tilemap;

  $: selectedTile = map.selectedTiles[0];
  $: data = map.tiledata.data[selectedTile.toString()];

  function onChange(e: Event) {
    // TODO
  }
</script>

<div>
  {#each Object.entries(data || {}) as [key, value]}
    <div>
      <input
        type="text"
        placeholder="Key"
        bind:value={key}
        on:change={onChange}
      />
      <input type="text" placeholder="Value" bind:value on:change={onChange} />
    </div>
  {/each}
</div>
