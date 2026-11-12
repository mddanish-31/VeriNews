'use client';

import React, { useEffect, useRef } from 'react';

export interface InteractiveNeuralVortexProps {
  brand?: string;
  eyebrow?: string;
  headline?: React.ReactNode;
  description?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  primaryCtaOnClick?: () => void;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  secondaryCtaOnClick?: () => void;
  children?: React.ReactNode;
  className?: string;
}

const InteractiveNeuralVortex: React.FC<InteractiveNeuralVortexProps> = ({
  brand = 'VeriNews',
  eyebrow = 'AI-POWERED NEWS INTELLIGENCE',
  headline,
  description = 'Understand information. Examine evidence. Make informed decisions.',
  primaryCtaText = 'Start Analyzing',
  primaryCtaHref = '#analyzer',
  primaryCtaOnClick,
  secondaryCtaText = 'Explore How It Works',
  secondaryCtaHref = '#why-verinews',
  secondaryCtaOnClick,
  children,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointer = useRef<{ x: number; y: number; tX: number; tY: number }>({ x: 0, y: 0, tX: 0, tY: 0 }); // Real-time pointer updates
  const animationRef = useRef<number | null>(null);

  // WebGL setup
  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    // Center pointer position initially
    if (typeof window !== 'undefined' && pointer.current.x === 0 && pointer.current.y === 0) {
      const cx = window.innerWidth * 0.5;
      const cy = window.innerHeight * 0.5;
      pointer.current = { x: cx, y: cy, tX: cx, tY: cy };
    }

    // Initialize WebGL context
    const gl = (canvasEl.getContext('webgl') || canvasEl.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    // Shader sources
    const vsSource = `
      precision mediump float;
      attribute vec2 a_position;
      varying vec2 vUv;
      void main() {
        vUv = .5 * (a_position + 1.);
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      varying vec2 vUv;
      uniform float u_time;
      uniform float u_ratio;
      uniform vec2 u_pointer_position;
      uniform float u_scroll_progress;
      uniform float u_theme;
      
      vec2 rotate(vec2 uv, float th) {
        return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
      }
      
      float neuro_shape(vec2 uv, float t, float p) {
        vec2 sine_acc = vec2(0.);
        vec2 res = vec2(0.);
        float scale = 8.;
        for (int j = 0; j < 15; j++) {
          uv = rotate(uv, 1.);
          sine_acc = rotate(sine_acc, 1.);
          vec2 layer = uv * scale + float(j) + sine_acc - t;
          sine_acc += sin(layer) + 2.4 * p;
          res += (.5 + .5 * cos(layer)) / scale;
          scale *= (1.2);
        }
        return res.x + res.y;
      }
      
      void main() {
        vec2 uv = .5 * vUv;
        uv.x *= u_ratio;
        vec2 pointer = vUv - u_pointer_position;
        pointer.x *= u_ratio;
        float p = clamp(length(pointer), 0., 1.);
        p = .5 * pow(1. - p, 2.);
        float t = .001 * u_time;
        float noise = neuro_shape(uv, t, p);
        noise = 1.2 * pow(noise, 3.);
        noise += pow(noise, 10.);
        noise = max(.0, noise - .5);
        noise *= (1. - length(vUv - .5));

        // 1. Dark Mode Color: Rich electric royal blue & deep indigo filaments matching reference
        vec3 baseIndigo = vec3(0.28, 0.18, 0.88); // Deep electric indigo
        vec3 royalBlue = vec3(0.12, 0.30, 0.98);  // Vibrant royal sapphire blue
        vec3 darkColor = mix(baseIndigo, royalBlue, 0.40 + 0.20 * sin(1.8 * u_scroll_progress + 1.2));
        darkColor += vec3(0.12, 0.04, 0.32) * sin(2.0 * u_scroll_progress + 1.5);
        
        // Controlled noise scaling preserves deep sapphire/indigo without blowing out into flat white
        float darkNoise = min(noise, 1.35);
        darkColor = darkColor * darkNoise;
        // Electric core highlight
        darkColor += vec3(0.50, 0.65, 1.0) * pow(clamp(noise - 0.4, 0.0, 1.5), 4.0) * 0.22;

        // 2. Light Mode Color (soft lavender-white foundation #F8F9FF with electric violet filaments)
        vec3 lightBg = vec3(0.973, 0.976, 1.0);
        vec3 lightAmbient = mix(lightBg, vec3(0.92, 0.93, 0.99), 0.65);
        
        // Controlled noise for light mode: softer curve, reduced bloom for crisp text readability
        float lightNoise = clamp(noise * 0.7, 0.0, 1.0);
        
        // Vibrant violet-blue neural filaments on light
        vec3 lightFilament = vec3(0.48, 0.36, 1.0); // #7B5CFF
        lightFilament = mix(lightFilament, vec3(0.20, 0.45, 0.95), 0.35 + 0.15 * sin(2.0 * u_scroll_progress + 1.2));
        
        // Blend filaments onto light ambient background
        vec3 lightColor = mix(lightAmbient, lightFilament, pow(lightNoise, 1.4) * 0.75);
        // Controlled soft violet highlights on top filaments
        lightColor = mix(lightColor, vec3(0.72, 0.60, 1.0), pow(lightNoise, 3.2) * 0.35);

        // 3. Smooth Composite Interpolation between Dark (u_theme = 0.0) and Light (u_theme = 1.0)
        vec3 finalColor = mix(darkColor, lightColor, u_theme);
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    // Shader compilation
    const compileShader = (glContext: WebGLRenderingContext, source: string, type: number): WebGLShader | null => {
      const shader = glContext.createShader(type);
      if (!shader) return null;
      glContext.shaderSource(shader, source);
      glContext.compileShader(shader);
      if (!glContext.getShaderParameter(shader, glContext.COMPILE_STATUS)) {
        console.error('Shader error:', glContext.getShaderInfoLog(shader));
        glContext.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(gl, vsSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return;

    // Program setup
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // Geometry
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uRatio = gl.getUniformLocation(program, 'u_ratio');
    const uPointerPosition = gl.getUniformLocation(program, 'u_pointer_position');
    const uScrollProgress = gl.getUniformLocation(program, 'u_scroll_progress');
    const uTheme = gl.getUniformLocation(program, 'u_theme');

    const initialIsDark = typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : true;
    const currentTheme = { current: initialIsDark ? 0.0 : 1.0 };

    // Resize handler
    const resizeCanvas = () => {
      const devicePixelRatio = Math.min(window.devicePixelRatio, 2);
      canvasEl.width = window.innerWidth * devicePixelRatio;
      canvasEl.height = window.innerHeight * devicePixelRatio;
      gl.viewport(0, 0, canvasEl.width, canvasEl.height);
      gl.uniform1f(uRatio, canvasEl.width / canvasEl.height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation loop
    const render = () => {
      const currentTime = performance.now();
      
      // Smooth pointer movement (exact 0.2 factor preserved)
      pointer.current.x += (pointer.current.tX - pointer.current.x) * 0.2;
      pointer.current.y += (pointer.current.tY - pointer.current.y) * 0.2;

      // Theme-aware smooth transition without remounting WebGL
      const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
      const targetTheme = isDark ? 0.0 : 1.0;
      const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        currentTheme.current = targetTheme;
      } else {
        currentTheme.current += (targetTheme - currentTheme.current) * 0.08;
      }
      
      gl.uniform1f(uTime, currentTime);
      if (uTheme) {
        gl.uniform1f(uTheme, currentTheme.current);
      }
      gl.uniform2f(
        uPointerPosition, 
        pointer.current.x / window.innerWidth, 
        1 - pointer.current.y / window.innerHeight
      );
      gl.uniform1f(uScrollProgress, window.pageYOffset / (2 * window.innerHeight));
      
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationRef.current = requestAnimationFrame(render);
    };

    render();

    // Event listeners
    const handleMouseMove = (e: MouseEvent | PointerEvent) => {
      pointer.current.tX = e.clientX;
      pointer.current.tY = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        pointer.current.tX = e.touches[0].clientX;
        pointer.current.tY = e.touches[0].clientY;
      }
    };

    window.addEventListener('pointermove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('pointermove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      if (vertexBuffer) {
        gl.deleteBuffer(vertexBuffer);
      }
    };
  }, []);

  return (
    <div className={`relative min-h-screen flex flex-col items-center justify-center overflow-x-hidden font-sans bg-[#F8F9FF] dark:bg-black transition-colors duration-700 ease-in-out ${className}`}>
      {/* Canvas Background */}
      <canvas 
        ref={canvasRef} 
        id="neuro" 
        className="fixed inset-0 w-full h-full pointer-events-none opacity-95 z-0"
      />

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 w-full px-4 sm:px-6 z-10 pt-6 pb-16 sm:pt-8 sm:pb-20">
        {children ? (
          children
        ) : (
          <div className="max-w-2xl w-full outline-style rounded-3xl px-8 py-14 text-center backdrop-blur-md animate-seq">
            {eyebrow && (
              <div className="mb-4">
                <span className="inline-block font-mono text-xs md:text-sm font-semibold tracking-widest text-slate-700 dark:text-white/70 uppercase">
                  {brand ? `${brand} · ${eyebrow}` : eyebrow}
                </span>
              </div>
            )}
            <h1 className="geist-heading geist-h1">
              {headline ?? (
                <>
                  Verify News.
                  <br />
                  Read Smarter.
                </>
              )}
            </h1>
            <p className="geist-heading geist-h2 mb-9 text-slate-600 dark:text-white/60">
              {description}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {primaryCtaText && (
                <a
                  href={primaryCtaHref}
                  onClick={primaryCtaOnClick}
                  className="inline-block px-8 py-4 rounded-xl outline-btn font-semibold text-slate-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  {primaryCtaText}
                </a>
              )}
              {secondaryCtaText && (
                <a
                  href={secondaryCtaHref}
                  onClick={secondaryCtaOnClick}
                  className="inline-block px-8 py-4 rounded-xl outline-btn font-semibold text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  {secondaryCtaText}
                </a>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Ambient Bottom Transition into Page Main */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-b from-transparent to-main pointer-events-none z-10" />

      {/* Scoped Animations & Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes slideInLeft { 
          from { opacity: 0; transform: translateX(-40px); } 
          to { opacity: 1; transform: translateX(0); } 
        }
        @keyframes slideInRight { 
          from { opacity: 0; transform: translateX(40px); } 
          to { opacity: 1; transform: translateX(0); } 
        }
        @keyframes slideInUp { 
          from { opacity: 0; transform: translateY(40px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .animate-seq {
          animation: slideInUp 0.8s both;
        }
        .geist-heading {
          font-family: 'Geist', ui-sans-serif, system-ui, sans-serif;
          font-weight: 300;
          letter-spacing: -0.02em;
          color: #fff;
          margin-bottom: 0.5em;
        }
        .geist-h1 {
          font-size: 48px;
          line-height: 1.05;
        }
        @media (min-width: 768px) {
          .geist-h1 { font-size: 64px; }
        }
        .geist-h2 {
          font-size: 20px;
          line-height: 1.25;
        }
        @media (min-width: 768px) {
          .geist-h2 { font-size: 20px; }
        }
        .geist-h3 {
          font-size: 16px;
          line-height: 1.2;
        }
        @media (min-width: 768px) {
          .geist-h3 { font-size: 20px; }
        }
        .outline-style,
        .outline-btn,
        .outline-card {
          border: 2px solid rgba(255,255,255,0.10) !important;
          background: transparent;
          box-shadow: none;
        }
      `,
        }}
      />
    </div>
  );
};

export default InteractiveNeuralVortex;
