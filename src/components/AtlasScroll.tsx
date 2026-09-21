'use client';

import { useEffect, useRef, useState } from 'react';

const FRAMES = Array.from({ length: 18 }, (_, index) =>
  `/atlas/frame_${String(index + 1).padStart(3, '0')}.jpg`,
);

export default function AtlasScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let drawFrame = () => {};
    const images = FRAMES.map((src, index) => {
      const image = new Image();
      image.onload = () => {
        if (cancelled) return;
        setLoaded((count) => count + 1);
        if (index === 0) {
          drawFrame();
          setReady(true);
        }
      };
      image.src = src;
      return image;
    });

    const draw = (index: number) => {
      const canvas = canvasRef.current;
      const image = images[index];
      if (!canvas || !image?.complete || !image.naturalWidth) return;
      const context = canvas.getContext('2d');
      if (!context) return;
      const ratio = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
      const width = image.naturalWidth * ratio;
      const height = image.naturalHeight * ratio;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
    };

    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * pixelRatio);
      canvas.height = Math.round(window.innerHeight * pixelRatio);
      draw(frameRef.current);
    };
    drawFrame = resize;

    const update = () => {
      const section = sectionRef.current;
      if (!section) return;
      const maximum = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -section.getBoundingClientRect().top / maximum));
      const index = Math.min(FRAMES.length - 1, Math.round(progress * (FRAMES.length - 1)));
      if (index !== frameRef.current) {
        frameRef.current = index;
        draw(index);
      }
    };

    window.addEventListener('resize', resize);
    window.addEventListener('scroll', update, { passive: true });
    resize();
    return () => {
      cancelled = true;
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', update);
    };
  }, []);

  return (
    <section ref={sectionRef} className="atlas-scroll" aria-label="Experiência visual de química">
      <div className="atlas-scroll__sticky">
        <canvas ref={canvasRef} className="atlas-scroll__canvas" aria-hidden="true" />
        <div className="atlas-scroll__veil" />
        {!ready && <p className="atlas-scroll__loading">Carregando experiência {Math.round((loaded / FRAMES.length) * 100)}%</p>}
        <div className="atlas-scroll__copy">
          <span className="label text-brand">Química em movimento</span>
          <h1 className="atlas-scroll__title">Entenda a matéria.<br /><em>Veja as conexões.</em></h1>
          <p>Uma trilha visual para dominar os conceitos que aparecem na prova.</p>
        </div>
        <span className="atlas-scroll__cue">role para explorar</span>
      </div>
    </section>
  );
}
