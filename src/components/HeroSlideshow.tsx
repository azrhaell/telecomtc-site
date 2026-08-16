'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const SLIDES = [
  {
    src: '/wp-content/uploads/2022/03/banner-site-temp-consertado.png',
    alt: 'Somos a TC TELECOM — maior parceiro autorizado do RJ, há 10 anos no mercado',
  },
  {
    src: '/wp-content/uploads/2022/03/banner-3-vivo-fibra.jpg',
    alt: 'Vivo Fibra — 300 mega + ligações ilimitadas + 22GB',
  },
  {
    src: '/wp-content/uploads/2022/02/45g.jpg',
    alt: '4G e 5G — até 10x mais rápido na maior cobertura de internet móvel do Brasil',
  },
] as const;

export default function HeroSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative aspect-[1980/720] w-full overflow-hidden bg-brand-purple-dark">
      {SLIDES.map((slide, i) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={i === 0}
          sizes="100vw"
          className={`object-cover transition-opacity duration-700 ${
            i === index ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        />
      ))}
    </div>
  );
}
