<script lang="ts">
  import { onMount } from "svelte";
  import type { ScenePage } from "./+page";
  import Tilemap from "$lib/Tilemap";
  import Scene from "$lib/Scene";
  import SceneUI from "$lib/Scene.svelte";

  export let data: ScenePage;
  let scene: Scene | undefined;

  onMount(() => {
    fetch(`/weave/examples/${data.url}`).then((resp) => {
      resp.arrayBuffer().then((buf) => {
        Tilemap.from(buf).then((tilemap) => {
          scene = new Scene(tilemap);
        });
      });
    });
  });
</script>

<div
  style="display: flex; gap: 16px; justify-content: space-between; width: 100%;"
>
  {#if scene}
    <SceneUI {scene} />
  {/if}
</div>
