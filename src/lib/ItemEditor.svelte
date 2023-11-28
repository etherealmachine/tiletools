<script lang="ts">
  import type { Item } from "./Scene";

  export let item: Item;
</script>

<div style="display: flex; flex-direction: column;">
  <span>{item.name}</span>
</div>
