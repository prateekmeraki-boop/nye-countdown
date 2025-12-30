<script lang="ts">
  import { onMount } from 'svelte';

  export let text = '00:00:00';
  $: parts = text.split(':');

  let isMobile = false;

  onMount(() => {
    // Create a media query
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    
    // Set initial state
    isMobile = mediaQuery.matches;

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      isMobile = e.matches;
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  });
</script>

<div class="countdown-wrapper">
  {#if isMobile}
    <!-- MOBILE: Stacked layout -->
    <div class="countdown-mobile">
      {#if text.includes(':')}
        {#each parts as part}
          <span class="countdown-part">{part}</span>
        {/each}
      {:else}
        <span class="countdown-part countdown-part-seconds">{text}</span>
      {/if}
    </div>
  {:else}
    <!-- DESKTOP: Single line -->
    <h1 class="countdown-text">{text}</h1>
  {/if}
</div>

<style>
  .countdown-wrapper {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    z-index: 1;
    padding-inline: 4vw;
  }

  /* Desktop layout */
  .countdown-text {
    margin: 0;
    padding: 0;
    width: 90vw;
    max-width: 90vw;
    font-weight: 800;
    font-size: clamp(4rem, 18vw, 20rem);
    letter-spacing: 0.12em;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    color: #ffffff;
  }

  /* Mobile stacked layout */
  .countdown-mobile {
    display: flex;
    flex-direction: column;
    gap: 0.35em;
    align-items: stretch;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .countdown-part {
    display: block;
    width: 100%;
    margin: 0;
    padding: 0;
    text-align: center;
    font-weight: 800;
    font-size: clamp(3.5rem, 24vw, 10rem);
    letter-spacing: 0.18em;
    line-height: 1;
    color: #ffffff;
  }

  .countdown-part-seconds {
    font-size: clamp(5rem, 30vw, 14rem);
    letter-spacing: 0.12em;
  }
</style>
