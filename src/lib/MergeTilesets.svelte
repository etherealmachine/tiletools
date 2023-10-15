<script lang="ts">
    import { readFileAsDataURL } from "./files";

  let tilesetA: HTMLImageElement;
  let mergeFileInput: HTMLInputElement;

  /*
  function mergeTilesets(tilesetA: HTMLImageElement, tilesetB: HTMLImageElement): string | undefined {
    const canvas = document.createElement('canvas');
    canvas.width = tilesetA.width + tilesetB.width;
    canvas.height = Math.max(tilesetA.height, tilesetB.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    ctx.imageSmoothingEnabled = false;
    ctx.resetTransform();
    ctx.drawImage(tilesetA, 0, 0, tilesetA.width, tilesetA.height);
    ctx.drawImage(tilesetB, tilesetA.width, 0, tilesetB.width, tilesetB.height);
    return canvas.toDataURL('image/png');
  }
  */

  function onMergeFileChanged() {
    if (!mergeFileInput || !mergeFileInput.files) return;
    const file = mergeFileInput.files[0];
    if (!file) return;
    readFileAsDataURL(file).then(url => {
      tilesetA.setAttribute('src', url);
    });
  }
</script>

<label for="merge">
  <button on:click={() => { mergeFileInput.click() }}>
    Merge Tileset
  </button>
  <input
    bind:this={mergeFileInput}
    on:change={onMergeFileChanged}
    style="display: none;"
    name="merge"
    type="file"
    accept="image/png" />
</label>

<img bind:this={tilesetA} style="max-width: 300px" />