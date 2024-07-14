<script lang="ts">
  export let params: { [key: string]: number };

  function updateValue(key: string) {
    return (e: Event & { currentTarget: EventTarget & HTMLInputElement; }) => {
      if (e.currentTarget.value.includes('.')) {
        params[key] = parseFloat(e.currentTarget.value);
      } else {
        params[key] = parseInt(e.currentTarget.value);
      }
      params = params;
    }
  }
</script>

<div style="display: flex; flex-direction: column; gap: 8px">
  {#each Object.entries(params) as [key, value]}
    <span style="display: flex; justify-content: space-between;" >
      <span>{key}</span>
      {#if value.toString().includes('.')}
        <input type="range" min="0" max="1" value={value} step="0.01" style="width: 12ch" on:change={updateValue(key)}/>
      {:else}
        <input type="number" value={value} style="width: 8ch" on:change={updateValue(key)}/>
      {/if}
    </span> 
  {/each}
</div>