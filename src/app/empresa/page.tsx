import type { Metadata } from 'next';
import Image from 'next/image';
import { CONTACT, TEAMS } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Nossa Empresa',
  description: 'Saiba mais sobre a TC Telecom, nossas equipes e escritórios de atendimento.',
  alternates: { canonical: './' },
};

export default function EmpresaPage() {
  return (
    <>
      {/* HERO — foto real da equipe TC Telecom, full-bleed */}
      <section
        className="relative flex min-h-[520px] items-center justify-center overflow-hidden bg-brand-purple text-center text-white sm:min-h-[600px]"
        style={{
          backgroundImage:
            "url('/wp-content/uploads/2022/05/foto-tc-cortada-e-cor-REDUX-scaled.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
        }}
      >
        {/* overlay roxo translúcido, igual ao original (#940EA9 a 30% de opacidade) */}
        <div className="absolute inset-0 bg-brand-purple/30" aria-hidden="true" />
        <div className="relative z-10 px-4">
          <h1 className="font-heading text-6xl uppercase leading-none sm:text-7xl md:text-8xl">
            TC TELECOM
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base font-semibold sm:text-lg">
            Saiba mais sobre nossa Empresa, equipes e escritórios de atendimento.
          </p>
        </div>
        <div className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2" aria-hidden="true">
          <svg
            viewBox="0 0 24 16"
            className="h-6 w-8 text-white/80"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="2 1 12 9 22 1" />
            <polyline points="2 8 12 16 22 8" />
          </svg>
        </div>
      </section>

      {/* Somos a TC TELECOM */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-heading text-3xl text-brand-purple sm:text-4xl md:text-5xl">
            Somos a TC TELECOM
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-zinc-700">
            Estamos no mercado há mais de <strong>10 anos</strong>. Somos{' '}
            <strong>o maior parceiro autorizado VIVO EMPRESAS do RJ</strong> e conquistamos essa posição com
            muito trabalho e transparência. Temos como objetivo muito mais do que apenas vender, mas criar
            laços de <strong>confiança</strong> com nossos clientes.
          </p>
          <a
            href={CONTACT.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-full bg-brand-purple px-8 py-3 font-heading text-white transition-colors hover:bg-brand-purple-dark"
          >
            Fale com um consultor
          </a>
        </div>
      </section>

      {/* NOSSAS EQUIPES */}
      <section className="bg-zinc-50 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-center font-heading text-3xl text-brand-purple sm:text-4xl md:text-5xl">
            NOSSAS EQUIPES
          </h2>
          <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
            {TEAMS.map((team) => (
              <div key={team.title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
                <h3 className="font-heading text-lg text-brand-purple">{team.title}</h3>
                <p className="mt-2 text-sm text-zinc-700">{team.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FALE CONOSCO — CTA final, fundo preto com banner-escuro.png */}
      <section
        className="relative overflow-hidden bg-black py-20 sm:py-28 lg:py-32"
        style={{
          backgroundImage: "url('/wp-content/uploads/2022/03/banner-escuro.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 sm:px-6 md:flex-row md:items-start md:justify-between">
          <div className="text-center md:text-left">
            <h2 className="neon-text font-heading text-5xl uppercase sm:text-6xl">FALE CONOSCO</h2>
            <a
              href={CONTACT.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-block rounded-full border-2 border-white px-8 py-3 font-bold uppercase tracking-wide text-white transition-colors hover:bg-white/10"
            >
              Fale com um consultor
            </a>
          </div>
          <Image
            src="/wp-content/uploads/2022/05/man_young_vivo-removebg-preview.png"
            alt=""
            width={320}
            height={420}
            className="hidden h-96 w-auto object-contain md:block"
          />
        </div>
      </section>
    </>
  );
}
