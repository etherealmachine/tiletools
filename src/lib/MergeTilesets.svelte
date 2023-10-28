<script lang="ts">
  import Icon from "./Icon.svelte";
  import Tileset from "./Tileset";

  let left: Tileset = new Tileset({});
  let right: Tileset = new Tileset({});
  let result: Tileset = new Tileset({});
  let landscape: boolean = true;

  function merge(landscape: boolean) {
    if (!left.img || !right.img) return;
    const canvas = document.createElement('canvas');
    if (landscape) {
      canvas.width = left.img.width + right.img.width + left.spacing;
      canvas.height = Math.max(left.img.height, right.img.height);
    } else {
      canvas.width = Math.max(left.img.width, right.img.width);
      canvas.height = left.img.height + right.img.height + left.spacing;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.resetTransform();
    if (landscape) {
      ctx.drawImage(left.img, 0, 0);
      ctx.drawImage(right.img, left.img.width+left.spacing, 0);
    } else {
      ctx.drawImage(left.img, 0, 0);
      ctx.drawImage(right.img, 0, left.img.height+left.spacing);
    }
    const src = canvas.toDataURL();
    result.img = document.createElement('img');
    Object.assign(result, Object.fromEntries(
      Object.entries(left).filter(([k, _]) => !['name', 'img'].includes(k))));
    result.img.src = src;
  }

  function loadTileset(tileset: Tileset) {
    return (e: Event) => {
      if (e.target === null) return;
      const files = (e.target as HTMLInputElement).files;
      if (files === null) return;
      const file = files[0];
      if (!file) return;
      Tileset.loadFromFile(file, tileset).then(() => {
        left = left;
        right = right;
        console.log(left.spacing);
      });
    }
  }

  function onSave() {
    result.download();
  }

  $: merge(landscape);
</script>

<div style="display: flex; gap: 16px;">
  <div style="display: flex; flex-direction: column;">
    <label for="left">
      <input
        on:change={loadTileset(left)}
        name="left"
        type="file"
        accept="image/png" />
    </label>
    <img
      class="tileset-preview"  
      src={left?.img instanceof HTMLImageElement ? left?.img?.src : ''}
      alt="Left Tileset" />
  </div>

  <div style="display: flex; flex-direction: column;">
    <label for="right">
      <input
        on:change={loadTileset(right)}
        name="right"
        type="file"
        accept="image/png" />
    </label>
    <img
      class="tileset-preview"  
      src={right?.img instanceof HTMLImageElement ? right?.img?.src : ''}
      alt="Right Tileset" />
  </div>

  <div style="display: flex; flex-direction: column;">
    <div style="display: flex; flex-direction: row;">
      <div style="display: flex; flex-direction: column; align-items: start;">
        <label for="name">Name</label>
        <input
          name="name"
          type="text"
          bind:value={result.name}
        />
      </div>
      <label>
        <input type="checkbox" bind:checked={landscape} />
        Landscape 
      </label>
      <button on:click={() => merge(landscape)}>
        <Icon name="gitMerge" />
      </button>
      <button disabled={!result.img} on:click={onSave}>
        <Icon name="saveFloppyDisk" />
      </button>
    </div>
    <img
      class="tileset-preview"  
      src={result?.img instanceof HTMLImageElement ? result?.img?.src : ''}
      alt="Merged Tileset" />
  </div>
</div>

<style>
  .tileset-preview {
    width: 400px;
    height: 300px;
    object-fit: contain;
    border: 1px solid white;
  }
</style>