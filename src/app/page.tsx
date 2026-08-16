import Image from 'next/image';
import Link from 'next/link';
import ContactForm from '@/components/ContactForm';
import HeroSlideshow from '@/components/HeroSlideshow';
import ParticlesNetwork from '@/components/ParticlesNetwork';
import Reveal from '@/components/Reveal';
import { CONTACT, SERVICES } from '@/lib/site';

function ServiceIcon({ id }: { id: string }) {
  const common = 'h-10 w-10';
  switch (id) {
    case 'vivo-movel':
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="7" y="2" width="10" height="20" rx="2" />
          <line x1="7" y1="18" x2="17" y2="18" />
        </svg>
      );
    case 'vivo-fibra':
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 8.5a15 15 0 0 1 20 0" />
          <path d="M5.5 12.5a10 10 0 0 1 13 0" />
          <path d="M9 16.5a5 5 0 0 1 6 0" />
          <circle cx="12" cy="20" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'vivo-tech':
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="12" rx="1.5" />
          <line x1="2" y1="19" x2="22" y2="19" />
        </svg>
      );
    case 'fixa-avancada':
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 5c0 8.5 6.5 15 15 15l1.5-3.6-4.6-1.9-1.4 1.9a11 11 0 0 1-6.9-6.9l1.9-1.4L7.6 3.5 4 5Z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function HomePage() {
  return (
    <>
      {/* HERO — carrossel de banners */}
      <HeroSlideshow />
      <div className="bg-white py-8 text-center">
        <Reveal kind="pop">
          <a
            href={CONTACT.whatsappProposalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full bg-brand-purple-dark px-8 py-3 font-bold text-white transition-all hover:-translate-y-[3px] hover:bg-brand-purple hover:shadow-[0_12px_26px_rgba(78,25,108,.4)]"
          >
            Receba uma proposta
          </a>
        </Reveal>
      </div>

      {/* SOLUÇÕES TC TELECOM */}
      <section className="network-pattern relative overflow-hidden bg-brand-purple py-16">
        <ParticlesNetwork />
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal as="h2" className="font-heading text-center text-3xl text-white sm:text-4xl">
            SOLUÇÕES TC TELECOM
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((service, index) => (
              <Reveal
                key={service.id}
                delay={index * 120}
                className="flex flex-col items-center rounded-lg border border-white px-6 py-8 text-center transition-all hover:-translate-y-1.5 hover:bg-white/10"
              >
                <div className="text-white">
                  <ServiceIcon id={service.id} />
                </div>
                <h3 className="font-heading mt-4 text-lg font-bold text-white">{service.title}</h3>
                <Link
                  href={`/servicos/#${service.id}`}
                  prefetch={false}
                  className="mt-6 rounded-full border border-white px-5 py-2 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-brand-purple"
                >
                  Saiba mais
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SOMOS A TC TELECOM */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <Reveal kind="left">
              <h2 className="font-heading text-2xl uppercase text-brand-purple sm:text-3xl">
                Somos a TC TELECOM
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-zinc-700">
                Estamos no mercado há mais de <strong>10 anos</strong>. Somos{' '}
                <strong>o maior parceiro autorizado VIVO EMPRESAS do RJ</strong> e conquistamos essa posição com
                muito trabalho e transparência. Temos como objetivo muito mais do que apenas vender, mas criar
                laços de <strong>confiança</strong> com nossos clientes.
              </p>
            </Reveal>
            <Reveal kind="right">
              <Image
                src="/wp-content/uploads/2022/04/FOTO-TC-TELECOM.jpg"
                alt="Equipe TC Telecom"
                width={900}
                height={553}
                className="w-full rounded-lg object-cover shadow-lg"
              />
            </Reveal>
          </div>
          <div className="mt-10 text-center">
            <a
              href={CONTACT.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-full bg-brand-purple px-8 py-3 font-bold text-white transition-opacity hover:opacity-90"
            >
              Fale com um consultor
            </a>
          </div>
        </div>
      </section>

      {/* FALE CONOSCO */}
      <section id="contato" className="scroll-mt-20 bg-black py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal as="h2" kind="in" className="neon-text font-heading text-center text-5xl sm:text-6xl">
            FALE CONOSCO
          </Reveal>
          <div className="mt-12 grid items-center gap-10 md:grid-cols-2">
            <Reveal kind="left">
              <Image
                src="/wp-content/uploads/2022/03/background.png"
                alt="Atendimento TC Telecom — Fibra"
                width={1076}
                height={692}
                className="w-full object-contain"
              />
            </Reveal>
            <Reveal kind="right">
              <ContactForm />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
