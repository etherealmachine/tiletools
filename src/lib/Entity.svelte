<script lang="ts">
  import type Scene from "./Scene";
  import type { Entity } from "./Scene";

  export let scene: Scene;
  export let entity: Entity;
</script>

<div style="display: flex; flex-direction: column;">
  <span>{entity.name}</span>
  <button on:click={() => scene.take(entity)}>Take</button>
</div>
