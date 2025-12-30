<script lang="ts">
  import { onMount } from 'svelte';
  import AnimatedText from './lib/AnimatedText.svelte';

  let countdownText = '00:00:00';

  function getNextNewYear() {
    const now = new Date();
    const targetYear = now.getFullYear() + 1;
    return new Date(`January 1, ${targetYear} 00:00:00`).getTime();
  }

  function formatHMS(ms: number) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  onMount(() => {
    let target = getNextNewYear();

    const updateTime = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        countdownText = 'HAPPY NEW YEAR';
        return;
      }

      const secondsLeft = Math.floor(diff / 1000);

      if (secondsLeft <= 20) {
        countdownText = secondsLeft.toString();
      } else {
        countdownText = formatHMS(diff);
      }
    };

    const timer = setInterval(updateTime, 250);
    updateTime();
    return () => clearInterval(timer);
  });
</script>

<main class="app-root">
  <iframe
    src="/warp-bg.html"
    class="shader-frame"
    title="Warp Shader Background"
  ></iframe>

  <AnimatedText text={countdownText} />
</main>
