<script lang="ts">
  import { onMount } from 'svelte';

  let countdownText = '00:00:00';
  let showHeadline = true;
  let isMobile = false;
  let mounted = false;

  function formatTime(ms: number): string {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  function checkViewport() {
    if (typeof window !== 'undefined') {
      isMobile = window.innerWidth <= 767;
    }
  }

  onMount(() => {
    checkViewport();
    mounted = true;

    const handleResize = () => {
      checkViewport();
    };

    window.addEventListener('resize', handleResize);

    const targetTime = new Date('2026-01-01T00:00:00Z').getTime();

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        countdownText = 'Happy New Year';
        showHeadline = false;
        clearInterval(timer);
      } else {
        const secondsLeft = Math.floor(diff / 1000);
        if (secondsLeft <= 20) {
          countdownText = secondsLeft.toString();
          showHeadline = false;
        } else {
          countdownText = formatTime(diff);
          showHeadline = true;
        }
      }
    }, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(timer);
    };
  });

  $: parts = countdownText.split(':');
</script>

<div class="countdown-container">
  {#if mounted}
    <!-- Headline -->
    {#if showHeadline}
      <div class="headline">New Year Countdown</div>
    {/if}

    <!-- Countdown -->
    <div class="countdown-wrapper">
      {#if isMobile}
        <div class="countdown-mobile">
          {#if countdownText.includes(':')}
            <span class="countdown-part">{parts[0]}</span>
            <span class="countdown-separator">:</span>
            <span class="countdown-part">{parts[1]}</span>
            <span class="countdown-separator">:</span>
            <span class="countdown-part">{parts[2]}</span>
          {:else}
            <span class="countdown-part countdown-part-seconds">{countdownText}</span>
          {/if}
        </div>
      {:else}
        <h1 class="countdown-text">{countdownText}</h1>
      {/if}
    </div>
  {/if}
</div>

<style>
  .countdown-container {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    z-index: 1;
  }

  .headline {
    position: absolute;
    top: 5%;
    left: 50%;
    transform: translateX(-50%);
    font-size: clamp(2rem, 8vw, 5rem);
    font-weight: 400;
    color: #ffffff;
    text-align: center;
    opacity: 0.95;
    font-family: "Ballet", cursive;
    letter-spacing: 0.05em;
    margin: 0;
    padding: 0;
    width: 90vw;
  }

  .countdown-wrapper {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-inline: 4vw;
  }

  .countdown-text {
    margin: 0;
    padding: 0;
    width: 90vw;
    max-width: 90vw;
    font-family: "Quintessential", serif;
    font-weight: 400;
    font-size: clamp(4rem, 18vw, 20rem);
    letter-spacing: 0.12em;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    color: #ffffff;
  }

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
    font-family: "Quintessential", serif;
    font-weight: 400;
    font-size: clamp(3.5rem, 24vw, 10rem);
    letter-spacing: 0.18em;
    line-height: 1;
    color: #ffffff;
  }

  .countdown-part-seconds {
    font-family: "Quintessential", serif;
    font-size: clamp(5rem, 30vw, 14rem);
    letter-spacing: 0.12em;
  }

  .countdown-separator {
    display: block;
    width: 100%;
    text-align: center;
    font-weight: 400;
    font-family: "Quintessential", serif;
    font-size: clamp(3.5rem, 24vw, 10rem);
    letter-spacing: 0.18em;
    line-height: 1;
    color: #ffffff;
    margin: -0.1em 0;
  }

  @media (max-width: 767px) {
    .countdown-wrapper {
      padding-inline: 2vw;
    }
  }
</style>
