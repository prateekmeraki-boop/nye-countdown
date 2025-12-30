<script lang="ts">
  import { onMount } from 'svelte';

  const VERT_SRC = `#version 300 es
    layout(location = 0) in vec2 a_pos;
    void main() {
      gl_Position = vec4(a_pos, 0.0, 1.0);
    }`;

  // Warp-style fragment shader (checks + swirl + colors)
  const FRAG_SRC = `#version 300 es
    precision highp float;
    out vec4 fragColor;
    uniform vec3 iResolution;
    uniform float iTime;

    mat2 rot(float a) {
      return mat2(cos(a), -sin(a), sin(a), cos(a));
    }

    float checks(vec2 p, float scale) {
      p *= scale;
      vec2 c = step(0.5, fract(p));
      return mod(c.x + c.y, 2.0);
    }

    void main() {
      vec2 uv = (gl_FragCoord.xy * 2.0 - iResolution.xy)
                / min(iResolution.x, iResolution.y);

      float t = iTime * 1.0;

      // Warp parameters similar to Warp props
      float proportion = 0.45;
      float softness = 1.0;
      float distortion = 0.25;
      float swirl = 0.8;
      int swirlIterations = 10;
      float shapeScale = 0.1;
      float scale = 1.0;

      vec2 p = uv * scale;

      // Swirl iterations
      for (int i = 0; i < 10; i++) {
        if (i >= swirlIterations) break;
        float a = swirl * 0.15;
        p *= rot(a);
        p += distortion * vec2(
          sin(p.y * 3.0 + t * 0.8),
          cos(p.x * 3.0 + t * 1.1)
        );
      }

      float mask = checks(p, 1.0 / shapeScale);
      mask = pow(mask, softness);

      vec3 c1 = vec3(0.0, 0.13, 0.2);
      vec3 c2 = vec3(0.5, 1.0, 0.75);
      vec3 c3 = vec3(0.0, 0.3, 0.3);
      vec3 c4 = vec3(0.6, 1.0, 0.8);

      vec3 base = mix(c1, c2, mask);
      vec3 overlay = mix(c3, c4, mask);
      float mixFactor = 0.5 + 0.5 * sin(t * 0.6);

      vec3 color = mix(base, overlay, mixFactor);

      fragColor = vec4(color, 1.0);
    }`;

  let canvas: HTMLCanvasElement;

  function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Failed to create shader');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader) || 'Unknown shader compile error';
      gl.deleteShader(shader);
      throw new Error('Shader compile error: ' + info);
    }
    return shader;
  }

  function createProgram(gl: WebGL2RenderingContext, vsSource: string, fsSource: string): WebGLProgram {
    const program = gl.createProgram();
    if (!program) throw new Error('Failed to create program');

    const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program) || 'Unknown program link error';
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      throw new Error('Program link error: ' + info);
    }

    gl.detachShader(program, vs);
    gl.detachShader(program, fs);
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    return program;
  }

  onMount(() => {
    const gl = canvas.getContext('webgl2');
    if (!gl) {
      console.error('WebGL2 not supported');
      return;
    }

    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    let raf = 0;

    try {
      program = createProgram(gl, VERT_SRC, FRAG_SRC);
      gl.useProgram(program);

      buffer = gl.createBuffer();
      if (!buffer) throw new Error('Failed to create buffer');

      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW
      );
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

      const uRes = gl.getUniformLocation(program, 'iResolution');
      const uTime = gl.getUniformLocation(program, 'iTime');

      const render = (t: number) => {
        const dpr = window.devicePixelRatio || 1;
        const width = Math.floor(window.innerWidth * dpr);
        const height = Math.floor(window.innerHeight * dpr);

        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        if (uRes) gl.uniform3f(uRes, canvas.width, canvas.height, dpr);
        if (uTime) gl.uniform1f(uTime, t / 1000);

        gl.drawArrays(gl.TRIANGLES, 0, 3);
        raf = requestAnimationFrame(render);
      };

      raf = requestAnimationFrame(render);
    } catch (err) {
      console.error('WebGL initialization failed:', err);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
    };
  });
</script>

<canvas bind:this={canvas}></canvas>

<style>
  canvas {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    display: block;
    z-index: 0;
  }
</style>
