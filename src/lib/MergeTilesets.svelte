<script lang="ts">
  import { readFileAsDataURL } from "./files";

  let left: HTMLImageElement;
  let right: HTMLImageElement;
  let result: HTMLImageElement;

  function merge(left: HTMLImageElement, right: HTMLImageElement): string {
    const canvas = document.createElement('canvas');
    const landscape = left.width + right.width < left.height + right.height;
    if (landscape) {
      canvas.width = left.width + right.width;
      canvas.height = Math.max(left.height, right.height);
    } else {
      canvas.width = Math.max(left.width, right.width);
      canvas.height = left.height + right.height;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.imageSmoothingEnabled = false;
    ctx.resetTransform();
    if (landscape) {
      ctx.drawImage(left, 0, 0, left.width, left.height);
      ctx.drawImage(right, left.width, 0, right.width, right.height);
    } else {
      ctx.drawImage(left, 0, 0, left.width, left.height);
      ctx.drawImage(right, 0, left.height, right.width, right.height);
    }
    return canvas.toDataURL('image/png');
  }

  function maybeMerge() {
    if (left && left.complete && right && right.complete && left.src != '' && right.src != '') {
      result.setAttribute('src', merge(left, right));
    }
  }

  function loadImage(img: HTMLImageElement) {
    return (e: Event) => {
      if (e.target === null) return;
      const files = (e.target as HTMLInputElement).files;
      if (files === null) return;
      const file = files[0];
      if (!file) return;
      readFileAsDataURL(file).then(url => {
        img.setAttribute('src', url);
        img.onload = maybeMerge;
      });
    }
  }
</script>

<div style="display: flex; gap: 16px;">
  <div style="display: flex; flex-direction: column;">
    <label for="left">
      <input
        on:change={loadImage(left)}
        name="left"
        type="file"
        accept="image/png" />
    </label>
    <img
      bind:this={left}
      alt="Left Tileset" />
  </div>

  <div style="display: flex; flex-direction: column;">
    <label for="right">
      <input
        on:change={loadImage(right)}
        name="right"
        type="file"
        accept="image/png" />
    </label>
    <img
      bind:this={right}
      alt="Right Tileset" />
  </div>

  <div style="display: flex; flex-direction: column;">
    <img
      bind:this={result}
      alt="Merged Tileset" />
  </div>
</div>