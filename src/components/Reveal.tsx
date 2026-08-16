'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

type Kind = 'up' | 'left' | 'right' | 'pop' | 'in';

type Props = {
  children: ReactNode;
  /** direção da entrada — mapeia para os @keyframes tc-* em globals.css */
  kind?: Kind;
  /** atraso em ms, para escalonar grades de cards */
  delay?: number;
  className?: string;
  style?: CSSProperties;
  id?: string;
  as?: 'div' | 'section' | 'h2' | 'p' | 'span';
};

/**
 * Entrada ao rolar, equivalente às "Entrance Animations" do Elementor no site
 * original. A classe .tc-reveal (opacity: 0) só é aplicada depois da montagem e
 * apenas se IntersectionObserver existir — assim nada fica invisível quando o JS
 * falha ou está desativado.
 */
export default function Reveal({
  children,
  kind = 'up',
  delay = 0,
  className = '',
  style,
  id,
  as: Tag = 'div',
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    setArmed(true);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setShown(true);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      id={id}
      data-kind={kind}
      className={`${armed ? 'tc-reveal' : ''} ${shown ? 'is-in' : ''} ${className}`.trim()}
      style={delay ? { ...style, animationDelay: `${delay}ms` } : style}
    >
      {children}
    </Tag>
  );
}
