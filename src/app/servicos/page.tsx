import type { Metadata } from 'next';
import Image from 'next/image';
import { CONTACT, SERVICES } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Soluções',
  description:
    'Conheça as soluções da TC Telecom: Vivo Móvel, Vivo Fibra, Vivo Tech e Fixa Avançada para o seu negócio, com a qualidade da rede Vivo Empresas.',
  alternates: { canonical: './' },
};

// Trechos destacados em negrito dentro do resumo de cada serviço — fiel ao HTML original
// (post-436.css / servicos/index.html), onde essas frases vêm envolvidas em <strong>.
const HIGHLIGHTS: Record<string, string[]> = {
  'vivo-movel': ['melhor rede móvel do Brasil', 'VIVO EMPRESAS'],
  'vivo-fibra': ['mais rápida fibra ótica', 'TC TELECOM'],
  'vivo-tech': ['manutenção ilimitada', 'suporte 24 horas'],
  'fixa-avancada': ['fixa avançada', 'PABX 100% em nuvem'],
};

function Summary({ id, text }: { id: string; text: string }) {
  const phrases = HIGHLIGHTS[id] ?? [];
  if (phrases.length === 0) {
    return <p className="mt-4 text-lg leading-relaxed text-zinc-700">{text}</p>;
  }

  const escaped = phrases.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const parts = text.split(new RegExp(`(${escaped.join('|')})`, 'g'));

  return (
    <p className="mt-4 text-lg leading-relaxed text-zinc-700">
      {parts.map((part, i) =>
        phrases.includes(part) ? (
          <strong key={i} className="font-bold text-zinc-900">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </p>
  );
}

function ServiceIcon({ id }: { id: string }) {
  const common = 'h-7 w-7';
  switch (id) {
    case 'vivo-movel':
      // barras de sinal (equivalente ao fa-signal do site original)
      return (
        <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden="true">
          <rect x="1.5" y="14" width="3.5" height="8" rx="0.5" />
          <rect x="7.5" y="10" width="3.5" height="12" rx="0.5" />
          <rect x="13.5" y="6" width="3.5" height="16" rx="0.5" />
          <rect x="19" y="2" width="3.5" height="20" rx="0.5" />
        </svg>
      );
    case 'vivo-fibra':
      // ondas de wi-fi (equivalente ao fa-wifi do site original)
      return (
        <svg
          viewBox="0 0 24 24"
          className={common}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M2 8.5a15 15 0 0 1 20 0" />
          <path d="M5.5 12.5a10 10 0 0 1 13 0" />
          <path d="M9 16.5a5 5 0 0 1 6 0" />
          <circle cx="12" cy="20" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'vivo-tech':
      // notebook (equivalente ao icon-Computer do site original)
      return (
        <svg
          viewBox="0 0 24 24"
          className={common}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="12" rx="1.5" />
          <line x1="2" y1="19" x2="22" y2="19" />
        </svg>
      );
    case 'fixa-avancada':
      // telefone (equivalente ao icon-cloud-computing usado junto ao título, aqui como fone fixo)
      return (
        <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden="true">
          <path d="M4 5c0 8.5 6.5 15 15 15l1.5-3.6-4.6-1.9-1.4 1.9a11 11 0 0 1-6.9-6.9l1.9-1.4L7.6 3.5 4 5Z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function ServicosPage() {
  return (
    <>
      {/* HERO — foto real (homem com tablet, já tonalizada em roxo/magenta) */}
      <section
        className="relative flex h-[320px] items-center overflow-hidden sm:h-[400px] md:h-[460px]"
        style={{
          backgroundImage: "url('/wp-content/uploads/2022/03/banner-site-servicos-2.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6">
          <h1 className="font-heading text-4xl uppercase leading-[1.05] text-white sm:text-5xl md:text-6xl">
            Soluções
            <br />
            <b>TC Telecom</b>
          </h1>
          <a
            href="#vivo-movel"
            className="mt-7 inline-block rounded-full border-2 border-white px-7 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-brand-purple"
          >
            Saiba mais
          </a>
        </div>
      </section>

      {/* SERVIÇOS — um bloco por item de SERVICES, alternando o lado da foto */}
      <div className="bg-white">
        {SERVICES.map((service, index) => {
          const imageOnLeft = index % 2 === 1;
          return (
            <section
              key={service.id}
              id={service.id}
              className={`mx-auto flex max-w-6xl scroll-mt-24 flex-col items-center gap-10 px-4 py-14 sm:px-6 md:py-20 ${
                imageOnLeft ? 'md:flex-row-reverse' : 'md:flex-row'
              }`}
            >
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center gap-3 md:justify-start">
                  <span className="text-brand-purple">
                    <ServiceIcon id={service.id} />
                  </span>
                  <h2 className="font-heading text-2xl uppercase text-brand-purple sm:text-3xl">
                    {service.title}
                  </h2>
                </div>

                <Summary id={service.id} text={service.summary} />

                {'badge' in service && service.badge ? (
                  <Image
                    src={service.badge}
                    alt={service.badgeAlt ?? ''}
                    width={320}
                    height={80}
                    className="mx-auto mt-5 h-auto w-64 md:mx-0"
                  />
                ) : null}

                <a
                  href={CONTACT.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 inline-block rounded-full bg-brand-purple px-7 py-3 font-bold text-white transition-opacity hover:opacity-90"
                >
                  Fale com um consultor
                </a>
              </div>

              <div className="flex-shrink-0">
                <Image
                  src={service.image}
                  alt={service.imageAlt}
                  width={200}
                  height={200}
                  className="rounded-full object-cover ring-4 ring-brand-pink"
                />
              </div>
            </section>
          );
        })}
      </div>

      {/* CTA FINAL — textura roxo-escura de fundo */}
      <section
        className="relative flex min-h-[380px] items-center justify-center overflow-hidden py-16 text-center"
        style={{
          backgroundImage: "url('/wp-content/uploads/2022/03/banner-escuro.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <a
          href={CONTACT.whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 inline-block rounded-full border-2 border-white px-9 py-3.5 text-base font-bold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-brand-purple-dark"
        >
          Fale com um consultor
        </a>
      </section>
    </>
  );
}
