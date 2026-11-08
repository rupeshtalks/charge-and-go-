import React, { useRef, useEffect } from 'react';
import { useAppPreferences } from '../../context/AppPreferencesContext';

export const AmbientSpace3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useAppPreferences();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // Fine floating atmospheric spatial particles
    const particleCount = Math.min(width > 768 ? 40 : 20, 50);
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.8,
      speedX: (Math.random() - 0.5) * 0.35,
      speedY: (Math.random() - 0.5) * 0.35,
      opacity: Math.random() * 0.4 + 0.15,
      color: Math.random() > 0.6 ? '#E7B0DE' : '#FF5A0A',
    }));

    let mouseX = width / 2;
    let mouseY = height / 2;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render floating micro-elements
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Subtle mouse parallax
        const dx = (mouseX - width / 2) * 0.00008;
        const dy = (mouseY - height / 2) * 0.00008;
        p.x += dx;
        p.y += dy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = resolvedTheme === 'dark' ? p.opacity * 0.9 : p.opacity * 0.45;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.7,
      }}
      aria-hidden="true"
    />
  );
};
