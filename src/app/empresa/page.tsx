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
      <section className="bg-gradient-to-br from-[#4a0072] to-[#7c2ae8] py-16 text-center text-white">
        <h1 className="text-3xl font-extrabold uppercase sm:text-4xl">TC Telecom</h1>
        <p className="mt-3 text-lg text-purple-100">
          Saiba mais sobre nossa Empresa, equipes e escritórios de atendimento.
        </p>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 px-4 sm:px-6 md:flex-row">
          <Image
            src="/wp-content/uploads/2022/05/man_young_vivo-removebg-preview.png"
            alt="TC Telecom"
            width={320}
            height={400}
            className="h-72 w-auto flex-shrink-0 object-contain"
          />
          <div className="text-center md:text-left">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#4a0072]">Somos a TC TELECOM</h2>
            <p className="mt-4 text-lg text-zinc-700">
              Estamos no mercado há mais de 10 anos. Somos o maior parceiro autorizado VIVO EMPRESAS do RJ e
              conquistamos essa posição com muito trabalho e transparência. Temos como objetivo muito mais do que
              apenas vender, mas criar laços de confiança com nossos clientes.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-zinc-50 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-extrabold uppercase text-[#4a0072] sm:text-3xl">
            Nossas Equipes
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {TEAMS.map((team) => (
              <div key={team.title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
                <h3 className="text-lg font-bold text-[#4a0072]">{team.title}</h3>
                <p className="mt-2 text-zinc-700">{team.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <a
              href={CONTACT.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-full bg-[#4a0072] px-6 py-3 font-bold text-white transition-colors hover:bg-[#3a005c]"
            >
              Fale com um consultor
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
