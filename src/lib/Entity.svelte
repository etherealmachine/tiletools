<script lang="ts">
  import type { Entity } from "./Scene";

  export let entity: Entity;
</script>

<div style="display: flex; flex-direction: column;">
  <span>{entity.name}</span>
</div>