<script lang="ts">
  import { onMount } from 'svelte';
  import AnimatedText from './lib/AnimatedText.svelte';

  onMount(() => {
    const canvas = document.getElementById('warp-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);

    const vertexShader = `#version 300 es
precision highp float;

in vec2 position;
out vec2 v_uv;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
  v_uv = position * 0.5 + 0.5;
}`;

const fragmentShader = `#version 300 es
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;

in vec2 v_uv;
out vec4 fragColor;

// Improved Perlin-like noise
float random(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  vec2 u = f * f * (3.0 - 2.0 * f);
  
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  
  float ab = mix(a, b, u.x);
  float cd = mix(c, d, u.x);
  return mix(ab, cd, u.y);
}

// Fractional Brownian Motion for smooth noise
float fbm(vec2 st) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  float maxValue = 0.0;
  
  for (int i = 0; i < 6; i++) {
    value += amplitude * valueNoise(st * frequency);
    maxValue += amplitude;
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value / maxValue;
}

void main() {
  vec2 uv = v_uv;
  
  // AGGRESSIVE warp distortion - much stronger
  float n1 = fbm(uv * 1.5 + vec2(u_time * 0.5, u_time * 0.4));
  float n2 = fbm(uv * 1.2 - vec2(u_time * 0.4, -u_time * 0.3));
  float n3 = fbm(uv * 0.8 + vec2(u_time * 0.3, u_time * 0.2));
  
  // Multi-layered warp for fluid effect
  float angle = n1 * 6.28318;
  uv += vec2(cos(angle), sin(angle)) * (n2 - 0.5) * 0.4;
  
  uv += vec2(sin(uv.y * 2.0 + u_time * 0.6), cos(uv.x * 2.0 - u_time * 0.5)) * 0.25;
  uv += vec2(cos(uv.x * 1.5 + u_time * 0.45), sin(uv.y * 1.5 + u_time * 0.35)) * 0.15;
  
  // Your exact custom colors
  vec3 yellow = vec3(1.0, 0.843, 0.0);      // FFD700
  vec3 orange = vec3(1.0, 0.420, 0.0);      // FF6B00
  vec3 teal = vec3(0.0, 0.616, 0.847);      // 009BD8
  vec3 cyan = vec3(0.0, 0.925, 0.784);      // 00ECC8
  vec3 purple = vec3(0.208, 0.0, 0.631);    // 3500A1
  
  // DYNAMIC flow animations with varying speeds
  float flow1 = sin(uv.x * 3.0 + u_time * 0.6) * 0.5 + 0.5;
  float flow2 = sin(uv.y * 3.5 + u_time * 0.5) * 0.5 + 0.5;
  float flow3 = sin((uv.x + uv.y) * 2.0 + u_time * 0.7) * 0.5 + 0.5;
  float flow4 = sin((uv.x - uv.y) * 2.5 + u_time * 0.4) * 0.5 + 0.5;
  
  // Complex color mixing with more interactions
  vec3 col = mix(yellow, orange, flow1 * 0.7 + flow3 * 0.3);
  col = mix(col, teal, flow2 * 0.6 + flow4 * 0.2);
  col = mix(col, cyan, (flow1 + flow2) * 0.5 * 0.5);
  col += purple * (0.2 * sin(u_time * 0.35) + 0.1);
  
  // Multi-layered noise overlay for depth
  float noiseOverlay = fbm(uv * 4.0 + u_time * 0.2);
  noiseOverlay += fbm(uv * 2.5 - vec2(u_time * 0.15, u_time * 0.25)) * 0.5;
  col += vec3((noiseOverlay - 0.75) * 0.3);
  
  // Selective brightening for more contrast
  float brightness = fbm(uv * 1.0 + u_time * 0.1);
  col *= mix(0.7, 1.1, brightness);
  
  // Ensure colors stay within valid range
  col = clamp(col, 0.0, 1.0);
  
  fragColor = vec4(col, 1.0);
}`;



    function compileShader(source: string, type: number): WebGLShader | null {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.error('Shader error:', gl!.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    }

    const vShader = compileShader(vertexShader, gl.VERTEX_SHADER);
    const fShader = compileShader(fragmentShader, gl.FRAGMENT_SHADER);

    if (!vShader || !fShader) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const resolutionLoc = gl.getUniformLocation(program, 'u_resolution');

    function render(time: number) {
      gl!.uniform1f(timeLoc, time * 0.001);
      gl!.uniform2f(resolutionLoc, canvas.width, canvas.height);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(render);
    }

    render(0);
  });
</script>

<main class="app-root">
  <canvas id="warp-canvas"></canvas>
  <AnimatedText />
</main>

<style>
  :global(html, body) {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .app-root {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    background: #000;
  }

  canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    display: block;
  }
</style>
