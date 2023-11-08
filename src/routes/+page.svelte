<script lang="ts">
  import { base } from "$app/paths";
</script>

<div
  style="display: flex; flex-direction: column; align-items: center; width: 100%;"
>
  <div
    style="width: 1040px; max-width: 1040px; display: flex; flex-direction: column; align-items: center;"
  >
    <h1>Welcome to the Weave!</h1>
    <div
      style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin: auto;"
    >
      <a href="{base}/map-editor" style="flex-grow: 1" class="button"
        >Map Editor</a
      >
      <a href="{base}/tileset-editor" class="button">Tileset Editor</a>
      <a href="{base}/merge-tilesets" class="button">Merge Tilesets</a>
      <a href="{base}/about" class="button">About</a>
    </div>
    <!-- TODO: Add an example tileset and map for square and hex orientations -->
  </div>
</div>
