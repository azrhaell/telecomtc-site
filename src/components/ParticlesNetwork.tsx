'use client';

import { useEffect, useRef } from 'react';

/**
 * Rede de partículas animada — recria o particles.js que o Elementor
 * (addon-elements-for-elementor-page-builder) rodava sobre os fundos roxos do
 * site original. Fica em position:absolute dentro de uma seção relative;
 * o conteúdo da seção deve ter z-index acima.
 */
export default function ParticlesNetwork({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;

    type Point = { x: number; y: number; vx: number; vy: number; r: number };
    let points: Point[] = [];

    function size() {
      const rect = canvas!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.max(1, Math.round(width * dpr));
      canvas!.height = Math.max(1, Math.round(height * dpr));

      const count = Math.max(28, Math.min(80, Math.round(width / 22)));
      points = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 1.2 + Math.random() * 1.6,
      }));
    }

    function draw() {
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, width, height);

      for (const p of points) {
        if (!still) {
          p.x += p.vx;
          p.y += p.vy;
        }
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      }

      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const d = Math.hypot(dx, dy);
          if (d >= 130) continue;
          ctx!.strokeStyle = `rgba(255,255,255,${(0.22 * (1 - d / 130)).toFixed(3)})`;
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.moveTo(points[i].x, points[i].y);
          ctx!.lineTo(points[j].x, points[j].y);
          ctx!.stroke();
        }
      }

      ctx!.fillStyle = 'rgba(255,255,255,.55)';
      for (const p of points) {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
      }

      if (!still) raf = requestAnimationFrame(draw);
    }

    size();
    draw();

    const onResize = () => {
      size();
      if (still) draw();
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={`absolute inset-0 h-full w-full opacity-85 ${className}`} />;
}
