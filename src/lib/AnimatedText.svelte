<script lang="ts">
  export let text = '00:00:00';
  $: parts = text.split(':');
</script>

<div class="countdown-wrapper">
  <!-- Desktop / base: one line -->
  <h1 class="countdown-text">{text}</h1>

  <!-- Mobile: stacked HH / MM / SS or single big number -->
  <div class="countdown-mobile">
    {#if text.includes(':')}
      {#each parts as part}
        <span class="countdown-part">{part}</span>
      {/each}
    {:else}
      <span class="countdown-part countdown-part-seconds">{text}</span>
    {/if}
  </div>
</div>
