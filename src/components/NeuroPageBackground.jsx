import React, { useEffect, useRef } from 'react';

const NODE_COLORS = [
  { r: 57, g: 49, b: 133 },   // Society Purple #393185
  { r: 193, g: 140, b: 38 },  // Heritage Gold #C18C26
  { r: 0, g: 157, b: 226 },   // Neural Cyan #009DE2
  { r: 145, g: 170, b: 24 },  // Deep Olive-Lime accent
];

/**
 * Interactive 60fps HTML5 canvas neural lattice running subtly across all pages.
 * Renders slowly drifting synaptic somas, ephemeral inter-node axon links,
 * travelling electrical signal pulses, periodic gentle synaptic ripples,
 * and subtle cursor-responsive neural connections.
 */
function NeuroAmbientCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let isMobile = width < 768;
    let dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 2);

    const pointer = { x: -9999, y: -9999, active: false };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      isMobile = width < 768;
      dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const handlePointerMove = (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
    };

    handleResize();

    // Node count scales gently with viewport so low-powered mobile devices stay cool & smooth
    const rawCount = Math.round((width * height) / 42000);
    const count = isMobile ? Math.max(10, Math.min(18, rawCount)) : Math.max(18, Math.min(42, rawCount));
    const nodes = Array.from({ length: count }, (_, idx) => {
      const palette = NODE_COLORS[idx % NODE_COLORS.length];
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.24,
        radius: 1.5 + (idx % 3) * 0.65,
        phase: Math.random() * Math.PI * 2,
        flash: 0,
        color: palette,
      };
    });

    // Travelling signals along temporary connected pairs
    const pulseCount = prefersReducedMotion ? 0 : isMobile ? 4 : 8;
    const pulses = Array.from({ length: pulseCount }, (_, idx) => ({
      fromIdx: idx % count,
      toIdx: (idx + 3) % count,
      progress: (idx * 0.14) % 1,
      speed: 0.008 + (idx % 3) * 0.003,
      color: NODE_COLORS[(idx + 1) % NODE_COLORS.length],
    }));

    // Periodic synaptic concentric ripple rings
    const ripples = [];
    let frameCount = 0;
    let rafId = 0;

    const maxConnectDist = width < 768 ? 135 : 175;

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);
      frameCount++;

      // 1. Advance floating neural soma positions
      if (!prefersReducedMotion) {
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          n.x += n.vx;
          n.y += n.vy;

          if (n.x < -20) n.x = width + 20;
          if (n.x > width + 20) n.x = -20;
          if (n.y < -20) n.y = height + 20;
          if (n.y > height + 20) n.y = -20;

          if (n.flash > 0) n.flash = Math.max(0, n.flash - 0.025);
        }
      }

      // 2. Draw delicate inter-node synaptic connections
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const distSq = dx * dx + dy * dy;
          if (distSq > maxConnectDist * maxConnectDist) continue;

          const dist = Math.sqrt(distSq);
          const falloff = 1 - dist / maxConnectDist;
          const alpha = falloff * 0.135;

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${a.color.r}, ${a.color.g}, ${a.color.b}, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.85;
          ctx.stroke();
        }

        // Subtle interactive cursor synapse tether
        if (pointer.active && !prefersReducedMotion) {
          const pdx = pointer.x - a.x;
          const pdy = pointer.y - a.y;
          const pDist = Math.hypot(pdx, pdy);
          if (pDist < 175) {
            const pFalloff = 1 - pDist / 175;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.strokeStyle = `rgba(${a.color.r}, ${a.color.g}, ${a.color.b}, ${(pFalloff * 0.19).toFixed(3)})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      }

      // 3. Travel live electrical impulses across nearest neighbors
      if (!prefersReducedMotion) {
        for (let pIdx = 0; pIdx < pulses.length; pIdx++) {
          const pulse = pulses[pIdx];
          const src = nodes[pulse.fromIdx];
          const dst = nodes[pulse.toIdx];
          const dist = Math.hypot(dst.x - src.x, dst.y - src.y);

          if (dist > maxConnectDist * 1.15 || pulse.progress >= 1) {
            if (pulse.progress >= 1 && dist <= maxConnectDist * 1.15) {
              dst.flash = 0.95;
              if (ripples.length < 6 && frameCount % 3 === 0) {
                ripples.push({
                  x: dst.x,
                  y: dst.y,
                  r: 3,
                  alpha: 0.34,
                  color: pulse.color,
                });
              }
            }
            // Pick next reachable neighbor to sustain continuous network flow
            const startNodeIdx = pulse.progress >= 1 ? pulse.toIdx : (pulse.fromIdx + 1) % count;
            const origin = nodes[startNodeIdx];
            let bestNeighbor = (startNodeIdx + 1) % count;
            let bestD = Infinity;
            for (let k = 0; k < nodes.length; k++) {
              if (k === startNodeIdx) continue;
              const d = Math.hypot(nodes[k].x - origin.x, nodes[k].y - origin.y);
              if (d < maxConnectDist && d > 35 && d < bestD) {
                bestD = d;
                bestNeighbor = k;
              }
            }
            pulse.fromIdx = startNodeIdx;
            pulse.toIdx = bestNeighbor;
            pulse.progress = 0;
            pulse.color = origin.color;
          } else {
            pulse.progress += pulse.speed;
            const px = src.x + (dst.x - src.x) * pulse.progress;
            const py = src.y + (dst.y - src.y) * pulse.progress;

            // Soft comet tail
            const tailProg = Math.max(0, pulse.progress - 0.14);
            const tx = src.x + (dst.x - src.x) * tailProg;
            const ty = src.y + (dst.y - src.y) * tailProg;
            const grad = ctx.createLinearGradient(tx, ty, px, py);
            grad.addColorStop(0, `rgba(${pulse.color.r}, ${pulse.color.g}, ${pulse.color.b}, 0)`);
            grad.addColorStop(1, `rgba(${pulse.color.r}, ${pulse.color.g}, ${pulse.color.b}, 0.42)`);
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(px, py);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.6;
            ctx.stroke();

            // Glowing impulse spark head
            ctx.beginPath();
            ctx.arc(px, py, 2.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${pulse.color.r}, ${pulse.color.g}, ${pulse.color.b}, 0.52)`;
            ctx.fill();
          }
        }

        // Expanding synaptic activation ripples
        for (let rIdx = ripples.length - 1; rIdx >= 0; rIdx--) {
          const rp = ripples[rIdx];
          rp.r += 0.35;
          rp.alpha -= 0.0085;
          if (rp.alpha <= 0) {
            ripples.splice(rIdx, 1);
            continue;
          }
          ctx.beginPath();
          ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${rp.color.r}, ${rp.color.g}, ${rp.color.b}, ${rp.alpha.toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // 4. Draw subtle breathing synaptic somas
      const timeSec = frameCount * 0.02;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const pulseMod = prefersReducedMotion ? 0.5 : 0.5 + 0.5 * Math.sin(timeSec + n.phase);
        const alpha = 0.16 + pulseMod * 0.12 + n.flash * 0.35;
        const rad = n.radius + n.flash * 1.4;

        ctx.beginPath();
        ctx.arc(n.x, n.y, rad * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${n.color.r}, ${n.color.g}, ${n.color.b}, ${(alpha * 0.25).toFixed(3)})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(n.x, n.y, rad, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${n.color.r}, ${n.color.g}, ${n.color.b}, ${alpha.toFixed(3)})`;
        ctx.fill();
      }

      if (!prefersReducedMotion) {
        rafId = window.requestAnimationFrame(drawFrame);
      }
    };

    drawFrame();

    window.addEventListener('resize', handleResize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-90" />;
}

/**
 * Global restrained neuroscience animation system mounted across every TNS page.
 * Combines a 60fps interactive ambient neural-synapse canvas with soft radial
 * atmospheric washes and subtle flowing architectural margin nerve traces.
 */
export default function NeuroPageBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Interactive 60fps global neural mesh + travelling synaptic pulses */}
      <NeuroAmbientCanvas />

      {/* Top-right restrained Society Purple radial wash */}
      <div
        className="absolute -top-28 -right-28 w-[440px] h-[440px] rounded-full opacity-40 tns-neuro-drift"
        style={{
          background: 'radial-gradient(circle, rgba(57, 49, 133, 0.065) 0%, transparent 70%)',
        }}
      />

      {/* Bottom-left subtle Gold & Lime atmospheric glow */}
      <div
        className="absolute -bottom-24 -left-24 w-[380px] h-[380px] rounded-full opacity-40 tns-neuro-drift-reverse"
        style={{
          background:
            'radial-gradient(circle, rgba(193, 140, 38, 0.055) 0%, rgba(176, 203, 31, 0.04) 45%, transparent 72%)',
        }}
      />

      {/* Right-margin flowing neural pathway lattice on wide viewports */}
      <svg
        className="hidden xl:block absolute right-2 top-36 w-48 h-[480px] opacity-65"
        viewBox="0 0 210 520"
        fill="none"
      >
        <path
          id="tnsRightAxonA"
          d="M172 18 C118 88, 190 176, 134 252 C92 310, 178 398, 140 492"
          stroke="#393185"
          strokeOpacity="0.1"
          strokeWidth="1.15"
        />
        <path
          id="tnsRightAxonB"
          d="M195 96 C144 150, 96 206, 134 252 C164 288, 196 340, 176 420"
          stroke="#C18C26"
          strokeOpacity="0.11"
          strokeWidth="1"
          strokeDasharray="3 5"
        />
        <path
          d="M172 18 C118 88, 190 176, 134 252 C92 310, 178 398, 140 492"
          stroke="#393185"
          strokeOpacity="0.2"
          strokeWidth="1.25"
          strokeDasharray="16 140"
          strokeLinecap="round"
          className="tns-axon-flow"
        />
        <circle r="2.6" fill="#8474FA" opacity="0.52">
          <animateMotion dur="11s" repeatCount="indefinite" rotate="auto">
            <mpath href="#tnsRightAxonA" />
          </animateMotion>
        </circle>
        <circle r="2.3" fill="#C18C26" opacity="0.52">
          <animateMotion dur="14s" begin="3.5s" repeatCount="indefinite" rotate="auto">
            <mpath href="#tnsRightAxonB" />
          </animateMotion>
        </circle>
      </svg>
    </div>
  );
}
