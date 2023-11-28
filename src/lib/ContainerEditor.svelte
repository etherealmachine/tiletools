<script lang="ts">
  import type { Container } from "./Scene";

  export let container: Container;
</script>

<div style="display: flex; flex-direction: column;">
  <span>{container.name}</span>
</div>
