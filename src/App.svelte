<script lang="ts">
    import MapEditor from "./lib/MapEditor.svelte";
    import Tabs from "./lib/Tabs.svelte";
    import TilesetEditor from "./lib/TilesetEditor.svelte";

    let tileset: HTMLImageElement;
    let tileWidth: number, tileHeight: number;
    let selectedTileX: number, selectedTileY: number;
    let selectedTab: number = 1;
</script>

<main>
  <div style="display: flex; flex-direction: row; gap: 16px;">
    <div style="display: flex; flex-direction: column;">
      <Tabs tabs={["Map Editor", "Tileset Editor"]} bind:selected={selectedTab} />
      <div>
        <div style={selectedTab === 0 ? "display: block" : "display: none"}>
          <MapEditor
            bind:selectedTileset={tileset}
            bind:tileWidth={tileWidth}
            bind:tileHeight={tileHeight}
            bind:selectedTileX={selectedTileX}
            bind:selectedTileY={selectedTileY}
          />
        </div>
        <div style={selectedTab === 1 ? "display: block" : "display: none"}>
          <TilesetEditor
            bind:tileset={tileset}
            bind:tileWidth={tileWidth}
            bind:tileHeight={tileHeight}
            bind:selectedTileX={selectedTileX}
            bind:selectedTileY={selectedTileY}
          />
        </div>
      </div>
    </div>
  </div>
</main>

<style>
</style>
