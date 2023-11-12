<script lang="ts">
  import type Tilemap from "./Tilemap";

  export let map: Tilemap;

  let key: string | undefined;
  let value: string | undefined;
  $: selectedTile = map.selectedTiles[0];
  $: data = map.tiledata.data[selectedTile.toString()];
  $: if (data && Object.entries(data).length > 0) {
    key = Object.keys(data)[0];
    value = Object.values(data)[0] as string;
  } else {
    key = undefined;
    value = undefined;
  }

  function onChange(e: Event) {
    if (key && value) {
      map.tiledata.set(selectedTile, key, value);
      map = map;
    } else {
      delete map.tiledata.data[selectedTile.toString()];
    }
  }
</script>

<div>
  <input type="text" placeholder="Key" bind:value={key} on:change={onChange} />
  <input type="text" placeholder="Value" bind:value={value} on:change={onChange} />
</div>