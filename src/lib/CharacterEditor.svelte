<script lang="ts">
  import type { Character } from "./Scene";

  export let character: Character;
</script>

<div style="display: flex; flex-direction: column;">
  <span>{character.name}</span>
</div>
