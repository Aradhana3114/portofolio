"use client";

import { useEffect, useRef, useState } from "react";

type Focus = { x: number; y: number };

type FluidRevealProps = {
  baseSrc: string;
  revealSrc: string;
  className?: string;
  /** Disable idle animation when cursor is outside the card */
  fadeOnLeave?: boolean;
  idleAnimation?: boolean;
  edgeGlow?: boolean;
  hint?: string;
  /** Texture-space point (0–1) kept at canvas center. Default centers the crop. */
  baseFocus?: Focus;
  revealFocus?: Focus;
  /** >1 zooms into the base image (1 = cover). */
  baseZoom?: number;
  /** >1 zooms into the reveal image (1 = cover). */
  revealZoom?: number;
};

type Splat = { x: number; y: number; dx: number; dy: number };

type DoubleFBO = {
  read: { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number };
  write: { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number };
  swap: () => void;
  w: number;
  h: number;
};

const VERT = `#version 300 es
precision highp float;
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG_SPLAT = `#version 300 es
precision highp float;
uniform sampler2D uTarget;
uniform float uAspect;
uniform vec2 uPoint;
uniform vec3 uColor;
uniform float uRadius;
uniform float uByte;
in vec2 vUv;
out vec4 fragColor;
void main() {
  vec2 p = vUv - uPoint;
  p.x *= uAspect;
  float d = 1.0 - min(length(p) / max(uRadius, 1e-5), 1.0);
  d = d * d;
  vec3 base = texture(uTarget, vUv).xyz;
  if (uByte > 0.5) base = base * 2.0 - 1.0;
  vec3 result = base + uColor * d;
  if (uByte > 0.5) result = clamp(result * 0.5 + 0.5, 0.0, 1.0);
  fragColor = vec4(result, 1.0);
}`;

const FRAG_ADVECT = `#version 300 es
precision highp float;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform float uDt;
uniform float uDissipation;
uniform float uByte;
in vec2 vUv;
out vec4 fragColor;
void main() {
  vec2 vel = texture(uVelocity, vUv).xy;
  if (uByte > 0.5) vel = vel * 2.0 - 1.0;
  vec2 coord = vUv - vel * uDt;
  vec4 result = texture(uSource, coord);
  fragColor = result * uDissipation;
}`;

const FRAG_DIV = `#version 300 es
precision highp float;
uniform sampler2D uVelocity;
uniform vec2 uTexel;
uniform float uByte;
in vec2 vUv;
out vec4 fragColor;
void main() {
  vec2 t = texture(uVelocity, vUv - vec2(uTexel.x, 0.0)).xy;
  vec2 r = texture(uVelocity, vUv + vec2(uTexel.x, 0.0)).xy;
  vec2 b = texture(uVelocity, vUv - vec2(0.0, uTexel.y)).xy;
  vec2 u = texture(uVelocity, vUv + vec2(0.0, uTexel.y)).xy;
  if (uByte > 0.5) {
    t = t * 2.0 - 1.0;
    r = r * 2.0 - 1.0;
    b = b * 2.0 - 1.0;
    u = u * 2.0 - 1.0;
  }
  float div = 0.5 * (r.x - t.x + u.y - b.y);
  if (uByte > 0.5) div = clamp(div * 0.5 + 0.5, 0.0, 1.0);
  fragColor = vec4(div, 0.0, 0.0, 1.0);
}`;

const FRAG_PRESSURE = `#version 300 es
precision highp float;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform vec2 uTexel;
uniform float uByte;
in vec2 vUv;
out vec4 fragColor;
void main() {
  float L = texture(uPressure, vUv - vec2(uTexel.x, 0.0)).x;
  float R = texture(uPressure, vUv + vec2(uTexel.x, 0.0)).x;
  float B = texture(uPressure, vUv - vec2(0.0, uTexel.y)).x;
  float T = texture(uPressure, vUv + vec2(0.0, uTexel.y)).x;
  float div = texture(uDivergence, vUv).x;
  if (uByte > 0.5) {
    L = L * 2.0 - 1.0;
    R = R * 2.0 - 1.0;
    B = B * 2.0 - 1.0;
    T = T * 2.0 - 1.0;
    div = div * 2.0 - 1.0;
  }
  float p = (L + R + B + T - div) * 0.25;
  if (uByte > 0.5) p = clamp(p * 0.5 + 0.5, 0.0, 1.0);
  fragColor = vec4(p, 0.0, 0.0, 1.0);
}`;

const FRAG_GRADIENT = `#version 300 es
precision highp float;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
uniform vec2 uTexel;
uniform float uByte;
in vec2 vUv;
out vec4 fragColor;
void main() {
  float L = texture(uPressure, vUv - vec2(uTexel.x, 0.0)).x;
  float R = texture(uPressure, vUv + vec2(uTexel.x, 0.0)).x;
  float B = texture(uPressure, vUv - vec2(0.0, uTexel.y)).x;
  float T = texture(uPressure, vUv + vec2(0.0, uTexel.y)).x;
  vec2 v = texture(uVelocity, vUv).xy;
  if (uByte > 0.5) {
    L = L * 2.0 - 1.0;
    R = R * 2.0 - 1.0;
    B = B * 2.0 - 1.0;
    T = T * 2.0 - 1.0;
    v = v * 2.0 - 1.0;
  }
  v -= vec2(R - L, T - B);
  if (uByte > 0.5) v = clamp(v * 0.5 + 0.5, 0.0, 1.0);
  fragColor = vec4(v, 0.0, 1.0);
}`;

const FRAG_CLEAR = `#version 300 es
precision highp float;
uniform sampler2D uTexture;
uniform float uValue;
uniform float uByte;
in vec2 vUv;
out vec4 fragColor;
void main() {
  vec4 t = texture(uTexture, vUv);
  if (uByte > 0.5) fragColor = uValue * t + (1.0 - uValue) * 0.5;
  else fragColor = uValue * t;
}`;

const FRAG_DISPLAY = `#version 300 es
precision highp float;
uniform sampler2D uBase;
uniform sampler2D uReveal;
uniform sampler2D uVelocity;
uniform sampler2D uDye;
uniform float uThreshold;
uniform int uEdgeGlow;
uniform vec2 uScaleBase;
uniform vec2 uScaleReveal;
uniform vec2 uFocusBase;
uniform vec2 uFocusReveal;
uniform float uByte;
in vec2 vUv;
out vec4 fragColor;

// Cover crop with focus: the focus point in texture stays at canvas center.
vec2 cover(vec2 uv, vec2 scale, vec2 focus) {
  vec2 halfSize = scale * 0.5;
  // allow slight overshoot past the safe zone so near-edge subjects can align
  vec2 minC = max(halfSize - 0.12, vec2(0.0));
  vec2 maxC = min(vec2(1.0) - halfSize + 0.12, vec2(1.0));
  vec2 center = clamp(focus, minC, maxC);
  return (uv - 0.5) * scale + center;
}

void main() {
  vec4 base = texture(uBase, clamp(cover(vUv, uScaleBase, uFocusBase), 0.001, 0.999));
  vec2 ruv = clamp(cover(vUv, uScaleReveal, uFocusReveal), 0.001, 0.999);
  vec4 rev = texture(uReveal, ruv);
  // mild unsharp mask — source reveal art is small, magnified by zoom
  vec2 rtexel = 1.0 / vec2(textureSize(uReveal, 0));
  vec4 rblur = texture(uReveal, ruv + vec2(rtexel.x, 0.0))
             + texture(uReveal, ruv - vec2(rtexel.x, 0.0))
             + texture(uReveal, ruv + vec2(0.0, rtexel.y))
             + texture(uReveal, ruv - vec2(0.0, rtexel.y));
  rblur *= 0.25;
  rev.rgb = clamp(rev.rgb + (rev.rgb - rblur.rgb) * 0.55, 0.0, 1.0);

  vec2 vel = texture(uVelocity, vUv).xy;
  if (uByte > 0.5) vel = vel * 2.0 - 1.0;
  float velLen = length(vel);
  float dye = texture(uDye, vUv).r;
  float signal = max(dye * 1.4, velLen * 2.5);
  float m = smoothstep(uThreshold, uThreshold + 0.1, signal);

  float glow = 0.0;
  if (uEdgeGlow == 1) {
    float e = abs(signal - uThreshold);
    glow = (1.0 - smoothstep(0.0, 0.15, e)) * m * (1.0 - m) * 4.0;
    glow = clamp(glow, 0.0, 1.0) * 0.65;
  }

  // transparent PNG holes become black (matches me.png bg) so base ears do not bleed through
  vec3 rcol = mix(vec3(0.0), rev.rgb, rev.a);
  vec3 color = mix(base.rgb, rcol, m);
  color += vec3(1.0, 0.42, 0.05) * glow;
  fragColor = vec4(color, 1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error(`Shader compile failed: ${log}`);
  }
  return s;
}

function createProgram(gl: WebGL2RenderingContext, fs: string) {
  const p = gl.createProgram()!;
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const frag = compile(gl, gl.FRAGMENT_SHADER, fs);
  gl.attachShader(p, vs);
  gl.attachShader(p, frag);
  gl.bindAttribLocation(p, 0, "aPos");
  gl.linkProgram(p);
  gl.deleteShader(vs);
  gl.deleteShader(frag);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(p);
    gl.deleteProgram(p);
    throw new Error(`Program link failed: ${log}`);
  }
  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS) as number;
  for (let i = 0; i < n; i++) {
    const info = gl.getActiveUniform(p, i)!;
    uniforms[info.name] = gl.getUniformLocation(p, info.name);
  }
  return { p, u: uniforms };
}

function coverScale(texAspect: number, canvasAspect: number): [number, number] {
  if (texAspect > canvasAspect) return [canvasAspect / texAspect, 1];
  return [1, texAspect / canvasAspect];
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

function canRenderTo(gl: WebGL2RenderingContext, internal: number, type: number): boolean {
  const tex = gl.createTexture();
  if (!tex) return false;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, internal, 4, 4, 0, gl.RGBA, type, null);
  const fbo = gl.createFramebuffer();
  if (!fbo) {
    gl.deleteTexture(tex);
    return false;
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.deleteFramebuffer(fbo);
  gl.deleteTexture(tex);
  return ok;
}

const PARAMS = {
  cursorSize: 0.14,
  mouseForce: 48,
  dissipation: 0.968,
  threshold: 0.11,
  resolution: 0.12,
  iters: 3,
  dt: 0.016,
  maxDpr: 1,
  frameInterval: 25,
};

export function FluidReveal({
  baseSrc,
  revealSrc,
  className = "",
  fadeOnLeave = true,
  idleAnimation = true,
  edgeGlow = true,
  hint,
  baseFocus = { x: 0.5, y: 0.38 },
  revealFocus = { x: 0.5, y: 0.3 },
  baseZoom = 1,
  revealZoom = 1,
}: FluidRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [glReady, setGlReady] = useState(false);
  const propsRef = useRef({ fadeOnLeave, idleAnimation, edgeGlow, baseFocus, revealFocus, baseZoom, revealZoom });
  propsRef.current = { fadeOnLeave, idleAnimation, edgeGlow, baseFocus, revealFocus, baseZoom, revealZoom };

  useEffect(() => {
    setGlReady(false);
  }, [baseSrc, revealSrc]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      failIfMajorPerformanceCaveat: false,
    });
    if (!gl) {
      console.error("FluidReveal: WebGL2 unavailable");
      return;
    }
    if (gl.isContextLost()) {
      console.error("FluidReveal: context lost at init");
      return;
    }

    const extCBF = gl.getExtension("EXT_color_buffer_float");
    const extHBF = gl.getExtension("EXT_color_buffer_half_float");
    gl.getExtension("OES_texture_float_linear");
    gl.getExtension("OES_texture_half_float_linear");
    void extCBF;
    void extHBF;

    let texType: number = gl.FLOAT;
    let texInternal: number = gl.RGBA32F;
    if (!canRenderTo(gl, gl.RGBA32F, gl.FLOAT)) {
      if (canRenderTo(gl, gl.RGBA16F, gl.HALF_FLOAT)) {
        texType = gl.HALF_FLOAT;
        texInternal = gl.RGBA16F;
      } else {
        texType = gl.UNSIGNED_BYTE;
        texInternal = gl.RGBA8;
      }
    }
    const byteFlag = texInternal === gl.RGBA8 ? 1 : 0;

    let progSplat: ReturnType<typeof createProgram>;
    let progAdvect: ReturnType<typeof createProgram>;
    let progDiv: ReturnType<typeof createProgram>;
    let progPressure: ReturnType<typeof createProgram>;
    let progGradient: ReturnType<typeof createProgram>;
    let progClear: ReturnType<typeof createProgram>;
    let progDisplay: ReturnType<typeof createProgram>;
    try {
      progSplat = createProgram(gl, FRAG_SPLAT);
      progAdvect = createProgram(gl, FRAG_ADVECT);
      progDiv = createProgram(gl, FRAG_DIV);
      progPressure = createProgram(gl, FRAG_PRESSURE);
      progGradient = createProgram(gl, FRAG_GRADIENT);
      progClear = createProgram(gl, FRAG_CLEAR);
      progDisplay = createProgram(gl, FRAG_DISPLAY);
    } catch (e) {
      console.error("FluidReveal: shader/program init failed", e);
      return;
    }

    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const imageTextures: WebGLTexture[] = [];
    const simTextures: WebGLTexture[] = [];
    const simFbos: WebGLFramebuffer[] = [];

    function createFBO(w: number, h: number) {
      const tex = gl!.createTexture()!;
      simTextures.push(tex);
      gl!.bindTexture(gl!.TEXTURE_2D, tex);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, texInternal, w, h, 0, gl!.RGBA, texType, null);
      const fbo = gl!.createFramebuffer()!;
      simFbos.push(fbo);
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
      gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, tex, 0);
      gl!.viewport(0, 0, w, h);
      gl!.clearColor(0, 0, 0, 1);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      return { tex, fbo, w, h };
    }

    function createDoubleFBO(w: number, h: number): DoubleFBO {
      let a = createFBO(w, h);
      let b = createFBO(w, h);
      const obj: DoubleFBO = {
        get read() {
          return a;
        },
        get write() {
          return b;
        },
        swap() {
          const t = a;
          a = b;
          b = t;
        },
        w,
        h,
      };
      return obj;
    }

    function createImageTex() {
      const tex = gl!.createTexture()!;
      imageTextures.push(tex);
      gl!.bindTexture(gl!.TEXTURE_2D, tex);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, 1, 1, 0, gl!.RGBA, gl!.UNSIGNED_BYTE, new Uint8Array([16, 16, 20, 255]));
      return { tex, aspect: 1 };
    }

    const baseImg = createImageTex();
    const revealImg = createImageTex();

    function uploadImg(target: { tex: WebGLTexture; aspect: number }, img: HTMLImageElement) {
      // keep full source res (cap 2048); upscale small art with high-quality filtering
      // so LINEAR magnification looks less blocky when revealZoom > 1
      const max = 2048;
      const longEdge = Math.max(img.naturalWidth, img.naturalHeight);
      const minTarget = 1024;
      const scale = Math.min(max / longEdge, Math.max(1, minTarget / longEdge));
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      gl!.bindTexture(gl!.TEXTURE_2D, target.tex);
      gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, true);
      gl!.pixelStorei(gl!.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, c);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, false);
      target.aspect = w / h;
    }

    let disposed = false;
    let imagesUploaded = false;
    let velocity: DoubleFBO | null = null;
    let pressure: DoubleFBO | null = null;
    let dye: DoubleFBO | null = null;
    let divergence: ReturnType<typeof createFBO> | null = null;
    let simW = 0;
    let simH = 0;

    function disposeSim() {
      for (const t of simTextures) gl!.deleteTexture(t);
      for (const f of simFbos) gl!.deleteFramebuffer(f);
      simTextures.length = 0;
      simFbos.length = 0;
      velocity = null;
      pressure = null;
      dye = null;
      divergence = null;
    }

    function initSim() {
      const rect = container!.getBoundingClientRect();
      if (rect.width < 4 || rect.height < 4) return;
      const dpr = Math.min(window.devicePixelRatio || 1, PARAMS.maxDpr);
      const w = Math.max(2, Math.floor(rect.width * dpr));
      const h = Math.max(2, Math.floor(rect.height * dpr));
      const nextSimW = Math.max(32, Math.round(rect.width * PARAMS.resolution));
      const nextSimH = Math.max(32, Math.round(rect.height * PARAMS.resolution));
      if (velocity && canvas!.width === w && canvas!.height === h && simW === nextSimW && simH === nextSimH) {
        return;
      }

      disposeSim();
      canvas!.width = w;
      canvas!.height = h;
      simW = nextSimW;
      simH = nextSimH;

      velocity = createDoubleFBO(simW, simH);
      pressure = createDoubleFBO(simW, simH);
      dye = createDoubleFBO(simW, simH);
      divergence = createFBO(simW, simH);
      splats.length = 0;
      if (byteFlag) {
        for (const pair of [velocity, pressure]) {
          for (const side of [pair.read, pair.write]) {
            gl!.bindFramebuffer(gl!.FRAMEBUFFER, side.fbo);
            gl!.viewport(0, 0, side.w, side.h);
            gl!.clearColor(0.5, 0.5, 0.5, 1);
            gl!.clear(gl!.COLOR_BUFFER_BIT);
          }
        }
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, divergence.fbo);
        gl!.viewport(0, 0, divergence.w, divergence.h);
        gl!.clearColor(0.5, 0, 0, 1);
        gl!.clear(gl!.COLOR_BUFFER_BIT);
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
      }
    }

    function bindTex(unit: number, tex: WebGLTexture) {
      gl!.activeTexture(gl!.TEXTURE0 + unit);
      gl!.bindTexture(gl!.TEXTURE_2D, tex);
      return unit;
    }

    function blit(target: { fbo: WebGLFramebuffer; w: number; h: number } | null) {
      if (target) {
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, target.fbo);
        gl!.viewport(0, 0, target.w, target.h);
      } else {
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
        gl!.viewport(0, 0, canvas!.width, canvas!.height);
      }
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    }

    const splats: Splat[] = [];
    let lastX = 0.5;
    let lastY = 0.5;
    let inside = false;
    let lastMove = 0;
    let idleT = 0;
    let prevIdleX = 0.5;
    let prevIdleY = 0.5;
    let clearBoost = 0;
    let leaveTimer = 0;
    let e0Type = "";
    let raf = 0;
    let last = performance.now();
    let inView = true;
    let pageHidden = false;
    let fading = false;
    let lastActive = performance.now();
    let rectCache: DOMRect | null = null;
    let rectRaf = 0;
    const IDLE_STOP_MS = 900;

    function refreshRect() {
      rectRaf = 0;
      rectCache = canvas!.getBoundingClientRect();
    }

    function scheduleRectRefresh() {
      if (rectRaf) return;
      rectRaf = requestAnimationFrame(refreshRect);
    }

    function wake() {
      lastActive = performance.now();
      if (inView && !pageHidden) startLoop();
    }

    function startLoop() {
      if (raf || disposed) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    function stopLoop() {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    }

    function queueSplat(x: number, y: number, dx: number, dy: number) {
      splats.push({ x, y, dx, dy });
    }

    function applySplats() {
      if (!splats.length || !velocity || !dye) return;
      gl!.useProgram(progSplat.p);
      gl!.bindVertexArray(vao);
      const aspect = simW / simH;
      for (const s of splats) {
        gl!.uniform1i(progSplat.u.uTarget!, bindTex(0, velocity.read.tex));
        gl!.uniform1f(progSplat.u.uAspect!, aspect);
        gl!.uniform2f(progSplat.u.uPoint!, s.x, s.y);
        gl!.uniform3f(progSplat.u.uColor!, s.dx, s.dy, 0);
        gl!.uniform1f(progSplat.u.uRadius!, PARAMS.cursorSize);
        if (progSplat.u.uByte) gl!.uniform1f(progSplat.u.uByte!, byteFlag);
        blit(velocity.write);
        velocity.swap();

        gl!.uniform1i(progSplat.u.uTarget!, bindTex(0, dye.read.tex));
        gl!.uniform3f(progSplat.u.uColor!, 1, 1, 1);
        if (progSplat.u.uByte) gl!.uniform1f(progSplat.u.uByte!, 0);
        blit(dye.write);
        dye.swap();
      }
      splats.length = 0;
    }

    function clearFluid() {
      if (!velocity || !pressure || !dye) return;
      gl!.useProgram(progClear.p);
      gl!.bindVertexArray(vao);
      const targets = [
        velocity.read,
        velocity.write,
        pressure.read,
        pressure.write,
        dye.read,
        dye.write,
      ];
      for (const t of targets) {
        gl!.uniform1i(progClear.u.uTexture!, bindTex(0, t.tex));
        const isDye = dye && (t === dye.read || t === dye.write);
        gl!.uniform1f(progClear.u.uValue!, 0);
        if (progClear.u.uByte) gl!.uniform1f(progClear.u.uByte!, isDye ? 0 : byteFlag);
        blit(t);
      }
    }

    function stepFluid(dt: number) {
      if (!velocity || !pressure || !dye || !divergence) return;
      gl!.bindVertexArray(vao);
      const texel: [number, number] = [1 / simW, 1 / simH];

      applySplats();

      let diss = PARAMS.dissipation;
      if (clearBoost > 0) {
        diss = Math.pow(PARAMS.dissipation, 4.5);
        clearBoost = Math.max(0, clearBoost - dt * 1.6);
        if (clearBoost <= 0) {
          fading = false;
          splats.length = 0;
          clearFluid();
        }
      }

      gl!.useProgram(progAdvect.p);
      if (progAdvect.u.uByte) gl!.uniform1f(progAdvect.u.uByte!, byteFlag);
      gl!.uniform1i(progAdvect.u.uVelocity!, bindTex(0, velocity.read.tex));
      gl!.uniform1i(progAdvect.u.uSource!, bindTex(1, velocity.read.tex));
      gl!.uniform1f(progAdvect.u.uDt!, dt * 60 * 0.15);
      gl!.uniform1f(progAdvect.u.uDissipation!, diss);
      blit(velocity.write);
      velocity.swap();

      gl!.uniform1i(progAdvect.u.uVelocity!, bindTex(0, velocity.read.tex));
      gl!.uniform1i(progAdvect.u.uSource!, bindTex(1, dye.read.tex));
      gl!.uniform1f(progAdvect.u.uDissipation!, diss);
      blit(dye.write);
      dye.swap();

      gl!.useProgram(progDiv.p);
      if (progDiv.u.uByte) gl!.uniform1f(progDiv.u.uByte!, byteFlag);
      gl!.uniform1i(progDiv.u.uVelocity!, bindTex(0, velocity.read.tex));
      gl!.uniform2f(progDiv.u.uTexel!, texel[0], texel[1]);
      blit(divergence);

      gl!.useProgram(progClear.p);
      gl!.uniform1i(progClear.u.uTexture!, bindTex(0, pressure.read.tex));
      gl!.uniform1f(progClear.u.uValue!, 0.8);
      if (progClear.u.uByte) gl!.uniform1f(progClear.u.uByte!, byteFlag);
      blit(pressure.write);
      pressure.swap();

      gl!.useProgram(progPressure.p);
      if (progPressure.u.uByte) gl!.uniform1f(progPressure.u.uByte!, byteFlag);
      gl!.uniform2f(progPressure.u.uTexel!, texel[0], texel[1]);
      gl!.uniform1i(progPressure.u.uDivergence!, bindTex(1, divergence.tex));
      for (let i = 0; i < PARAMS.iters; i++) {
        gl!.uniform1i(progPressure.u.uPressure!, bindTex(0, pressure.read.tex));
        blit(pressure.write);
        pressure.swap();
      }

      gl!.useProgram(progGradient.p);
      if (progGradient.u.uByte) gl!.uniform1f(progGradient.u.uByte!, byteFlag);
      gl!.uniform1i(progGradient.u.uPressure!, bindTex(0, pressure.read.tex));
      gl!.uniform1i(progGradient.u.uVelocity!, bindTex(1, velocity.read.tex));
      gl!.uniform2f(progGradient.u.uTexel!, texel[0], texel[1]);
      blit(velocity.write);
      velocity.swap();
    }

    function render() {
      if (!velocity || !dye) return;
      const canvasAspect = canvas!.width / canvas!.height;
      const cfg = propsRef.current;
      const zoomB = Math.max(1, cfg.baseZoom || 1);
      const zoomR = Math.max(1, cfg.revealZoom || 1);
      const sb = coverScale(baseImg.aspect, canvasAspect);
      const sr = coverScale(revealImg.aspect, canvasAspect);
      // zoom in = sample a smaller texture span around the focus point
      sb[0] /= zoomB;
      sb[1] /= zoomB;
      sr[0] /= zoomR;
      sr[1] /= zoomR;

      gl!.useProgram(progDisplay.p);
      gl!.bindVertexArray(vao);
      gl!.uniform1i(progDisplay.u.uBase!, bindTex(0, baseImg.tex));
      gl!.uniform1i(progDisplay.u.uReveal!, bindTex(1, revealImg.tex));
      gl!.uniform1i(progDisplay.u.uVelocity!, bindTex(2, velocity.read.tex));
      gl!.uniform1i(progDisplay.u.uDye!, bindTex(3, dye.read.tex));
      gl!.uniform1f(progDisplay.u.uThreshold!, PARAMS.threshold);
      gl!.uniform1i(progDisplay.u.uEdgeGlow!, cfg.edgeGlow ? 1 : 0);
      gl!.uniform2f(progDisplay.u.uScaleBase!, sb[0], sb[1]);
      gl!.uniform2f(progDisplay.u.uScaleReveal!, sr[0], sr[1]);
      if (progDisplay.u.uFocusBase) gl!.uniform2f(progDisplay.u.uFocusBase, cfg.baseFocus.x, cfg.baseFocus.y);
      if (progDisplay.u.uFocusReveal) gl!.uniform2f(progDisplay.u.uFocusReveal, cfg.revealFocus.x, cfg.revealFocus.y);
      if (progDisplay.u.uByte) gl!.uniform1f(progDisplay.u.uByte!, byteFlag);
      blit(null);
    }

    function clientToUv(clientX: number, clientY: number) {
      const rect = rectCache ?? canvas!.getBoundingClientRect();
      const px = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const py = Math.min(1, Math.max(0, 1 - (clientY - rect.top) / rect.height));
      return { px, py };
    }

    // draw the uploaded base image immediately so the canvas never shows the
    // black placeholder; only reveal it once a real frame exists
    function presentBase() {
      if (disposed || !imagesUploaded) return;
      if (!velocity || !dye) initSim();
      if (!velocity || !dye) return;
      lastActive = performance.now();
      render();
      setGlReady(true);
      startLoop();
    }

    function setPointer(e: PointerEvent) {
      wake();
      fading = false;
      const { px, py } = clientToUv(e.clientX, e.clientY);
      const dx = px - lastX;
      const dy = py - lastY;
      lastX = px;
      lastY = py;
      inside = true;
      clearBoost = 0;
      lastMove = performance.now();
      if (Math.abs(dx) > 0.0005 || Math.abs(dy) > 0.0005) {
        const f = PARAMS.mouseForce / 1000;
        queueSplat(px, py, dx * f * 40, dy * f * 40);
      }
    }

    function onPointerDown(e: PointerEvent) {
      wake();
      fading = false;
      const { px, py } = clientToUv(e.clientX, e.clientY);
      e0Type = e.pointerType || "";
      lastX = px;
      lastY = py;
      inside = true;
      clearBoost = 0;
      window.clearTimeout(leaveTimer);
      lastMove = performance.now();
      queueSplat(px, py, 0, 0);
      queueSplat(px, py, 0.002, 0.002);
      try {
        container!.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }

    function onPointerEnter(e: PointerEvent) {
      wake();
      refreshRect();
      inside = true;
      fading = false;
      clearBoost = 0;
      window.clearTimeout(leaveTimer);
      lastMove = performance.now();
      const { px, py } = clientToUv(e.clientX, e.clientY);
      lastX = px;
      lastY = py;
    }

    function onPointerLeave() {
      inside = false;
      if (e0Type === "mouse") {
        scheduleFade();
      } else {
        fading = true;
        lastActive = performance.now();
        window.clearTimeout(leaveTimer);
        leaveTimer = window.setTimeout(() => {
          if (!inside) clearBoost = 1;
        }, 250);
      }
    }

    function scheduleFade() {
      lastMove = performance.now();
      lastActive = performance.now();
      window.clearTimeout(leaveTimer);
      if (!propsRef.current.fadeOnLeave) return;
      fading = true;
      leaveTimer = window.setTimeout(() => {
        if (!inside) clearBoost = 1;
      }, 250);
    }

    function onPointerUp() {
      lastMove = performance.now();
      if (e0Type === "touch" || e0Type === "pen") {
        inside = false;
        scheduleFade();
      }
    }

    function onTouchMove(e: TouchEvent) {
      const t = e.touches[0];
      if (!t) return;
      setPointer({
        clientX: t.clientX,
        clientY: t.clientY,
      } as PointerEvent);
      e.preventDefault();
    }

    function onTouchStart(e: TouchEvent) {
      wake();
      const t = e.touches[0];
      if (!t) return;
      const { px, py } = clientToUv(t.clientX, t.clientY);
      e0Type = "touch";
      lastX = px;
      lastY = py;
      inside = true;
      clearBoost = 0;
      window.clearTimeout(leaveTimer);
      lastMove = performance.now();
      queueSplat(px, py, 0, 0);
      queueSplat(px, py, 0.002, 0.002);
      e.preventDefault();
    }

    function onTouchEnd() {
      inside = false;
      scheduleFade();
    }

    function onResize() {
      if (disposed) return;
      initSim();
      presentBase();
    }

    function idleSplats(dt: number) {
      if (!propsRef.current.idleAnimation) return;
      if (!inside) return;
      if (performance.now() - lastMove < 2200) return;

      idleT += dt;
      const nx = Math.sin(idleT * 1.1) * 0.5 + 0.5;
      const ny = Math.sin(idleT * 2.2 + 0.5) * 0.3 + 0.5;
      if (Math.abs(nx - prevIdleX) > 0.001 || Math.abs(ny - prevIdleY) > 0.001) {
        const f = PARAMS.mouseForce / 1000;
        queueSplat(nx, ny, (nx - prevIdleX) * f * 40, (ny - prevIdleY) * f * 40);
      }
      prevIdleX = nx;
      prevIdleY = ny;
    }

    function frame(now: number) {
      raf = 0;
      if (disposed) return;
      if (!inside && !fading && now - lastActive > IDLE_STOP_MS) return;
      if (now - last < PARAMS.frameInterval) {
        raf = requestAnimationFrame(frame);
        return;
      }
      const dt = Math.min((now - last) / 1000, 0.033);
      last = now;
      idleSplats(dt);
      stepFluid(PARAMS.dt);
      render();
      startLoop();
    }

    const evTarget: HTMLElement = container;
    evTarget.addEventListener("pointerdown", onPointerDown, { capture: true });
    evTarget.addEventListener("pointermove", setPointer, { capture: true });
    evTarget.addEventListener("pointerenter", onPointerEnter, { capture: true });
    evTarget.addEventListener("pointerleave", onPointerLeave, { capture: true });
    evTarget.addEventListener("pointerup", onPointerUp, { capture: true });
    evTarget.addEventListener("pointercancel", onPointerLeave, { capture: true });
    evTarget.addEventListener("touchstart", onTouchStart, { passive: false, capture: true });
    evTarget.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
    evTarget.addEventListener("touchend", onTouchEnd, { capture: true });
    evTarget.addEventListener("touchcancel", onTouchEnd, { capture: true });
    window.addEventListener("blur", onPointerLeave);
    window.addEventListener("scroll", scheduleRectRefresh, { passive: true });
    window.addEventListener("resize", scheduleRectRefresh, { passive: true });

    const ro = new ResizeObserver(() => {
      onResize();
      refreshRect();
    });
    ro.observe(container);

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView && !pageHidden) startLoop();
        else {
          stopLoop();
          if (!inView) {
            fading = false;
            clearBoost = 0;
            if (dye && velocity && pressure) {
              splats.length = 0;
              clearFluid();
              render();
            }
          }
        }
      },
      { rootMargin: "120px" }
    );
    io.observe(container);

    function onVisibility() {
      pageHidden = document.hidden;
      if (pageHidden) stopLoop();
      else if (inView) startLoop();
    }
    document.addEventListener("visibilitychange", onVisibility);

    function onContextLost(e: Event) {
      e.preventDefault();
      disposed = true;
      setGlReady(false);
    }
    canvas.addEventListener("webglcontextlost", onContextLost);

    initSim();

    Promise.all([loadImage(baseSrc), loadImage(revealSrc)])
      .then(([base, rev]) => {
        if (disposed) return;
        uploadImg(baseImg, base);
        uploadImg(revealImg, rev);
        imagesUploaded = true;
        presentBase();
      })
      .catch((err) => {
        console.error(err);
        setGlReady(false);
      });

    refreshRect();
    startLoop();

    return () => {
      disposed = true;
      stopLoop();
      if (rectRaf) cancelAnimationFrame(rectRaf);
      window.clearTimeout(leaveTimer);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("scroll", scheduleRectRefresh);
      window.removeEventListener("resize", scheduleRectRefresh);
      document.removeEventListener("visibilitychange", onVisibility);
      evTarget.removeEventListener("pointerdown", onPointerDown, { capture: true });
      evTarget.removeEventListener("pointermove", setPointer, { capture: true });
      evTarget.removeEventListener("pointerenter", onPointerEnter, { capture: true });
      evTarget.removeEventListener("pointerleave", onPointerLeave, { capture: true });
      evTarget.removeEventListener("pointerup", onPointerUp, { capture: true });
      evTarget.removeEventListener("pointercancel", onPointerLeave, { capture: true });
      evTarget.removeEventListener("touchstart", onTouchStart, { capture: true });
      evTarget.removeEventListener("touchmove", onTouchMove, { capture: true });
      evTarget.removeEventListener("touchend", onTouchEnd, { capture: true });
      evTarget.removeEventListener("touchcancel", onTouchEnd, { capture: true });
      window.removeEventListener("blur", onPointerLeave);
      canvas.removeEventListener("webglcontextlost", onContextLost);

      for (const t of simTextures) gl.deleteTexture(t);
      for (const f of simFbos) gl.deleteFramebuffer(f);
      for (const t of imageTextures) gl.deleteTexture(t);
      for (const prog of [progSplat, progAdvect, progDiv, progPressure, progGradient, progClear, progDisplay]) {
        gl.deleteProgram(prog.p);
      }
      gl.deleteBuffer(vbo);
      gl.deleteVertexArray(vao);
    };
  }, [baseSrc, revealSrc]);

  return (
    <div
      ref={containerRef}
      className={`relative aspect-square w-full overflow-hidden rounded-lg bg-black select-none ${glReady ? "touch-none" : ""} ${className}`}
      style={{ cursor: glReady ? "none" : "auto" }}
    >
      <img
        src={baseSrc}
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover select-none"
        style={{ objectPosition: `${baseFocus.x * 100}% ${(1 - baseFocus.y) * 100}%` }}
      />
      <canvas
        ref={canvasRef}
        aria-hidden={!glReady}
        className={`absolute inset-0 h-full w-full ${glReady ? "opacity-100" : "pointer-events-none opacity-0"}`}
        style={{ touchAction: glReady ? "none" : "auto" }}
      />
      {hint ? (
        <div className="pointer-events-none absolute bottom-2 left-0 right-0 text-center text-[10px] tracking-wide text-white/45 select-none">
          {hint}
        </div>
      ) : null}
    </div>
  );
}
