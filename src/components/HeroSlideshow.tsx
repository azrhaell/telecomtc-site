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

const INTERVAL = 5000;

export default function HeroSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((current) => (current + 1) % SLIDES.length), INTERVAL);
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
          className={`tc-kenburns object-cover transition-opacity duration-1000 ${
            i === index ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        />
      ))}

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2.5">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Banner ${i + 1}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className={`h-2.5 w-2.5 rounded-full border-2 border-white transition-all hover:scale-125 ${
              i === index ? 'bg-brand-pink' : 'bg-white/35'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
