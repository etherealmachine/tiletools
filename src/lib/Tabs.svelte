<script lang="ts">
  export let tabs: string[];
  export let selected: number = 0;
</script>

<div class="tabs">
  {#each tabs as title}
    <button
        class="tab"
        on:click={() => { selected = tabs.indexOf(title) }}>
      {title}
    </button>
  {/each}
</div>

<style>
  .tabs {
    display: flex;
    flex-direction: row;
  }
  .tab {
    padding: 12px 16px;
  }
</style>