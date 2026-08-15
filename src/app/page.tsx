import Image from 'next/image';
import Link from 'next/link';
import ContactForm from '@/components/ContactForm';
import { CONTACT, SERVICES } from '@/lib/site';

export default function HomePage() {
  return (
    <>
      <section className="bg-gradient-to-br from-[#4a0072] to-[#7c2ae8] text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-16 sm:px-6 md:flex-row md:py-24">
          <div className="flex-1 text-center md:text-left">
            <Image
              src="/wp-content/uploads/2022/02/vivo-empresas-parceiro-autorizado.png"
              alt="Vivo Empresas — Parceiro Autorizado"
              width={220}
              height={90}
              className="mx-auto mb-6 h-auto w-48 md:mx-0"
              priority
            />
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
              TC TELECOM – Parceiro Autorizado Vivo Empresas
            </h1>
            <p className="mt-4 max-w-xl text-lg text-purple-100">
              Estamos no mercado há mais de 10 anos. Somos o maior parceiro autorizado VIVO EMPRESAS do RJ e
              conquistamos essa posição com muito trabalho e transparência.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
              <a
                href={CONTACT.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-white px-6 py-3 text-center font-bold text-[#4a0072] transition-colors hover:bg-purple-100"
              >
                Fale Conosco
              </a>
              <a
                href={CONTACT.whatsappProposalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border-2 border-white px-6 py-3 text-center font-bold text-white transition-colors hover:bg-white/10"
              >
                Receba uma proposta
              </a>
            </div>
          </div>
          <div className="flex-1">
            <Image
              src="/wp-content/uploads/2022/04/FOTO-TC-TELECOM.jpg"
              alt="Equipe TC Telecom"
              width={600}
              height={450}
              className="mx-auto w-full max-w-md rounded-2xl object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#4a0072]">Somos a TC TELECOM</h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-zinc-700">
            Estamos no mercado há mais de 10 anos. Somos o maior parceiro autorizado VIVO EMPRESAS do RJ e
            conquistamos essa posição com muito trabalho e transparência. Temos como objetivo muito mais do que
            apenas vender, mas criar laços de confiança com nossos clientes.
          </p>
        </div>
      </section>

      <section className="bg-zinc-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-extrabold uppercase text-[#4a0072] sm:text-3xl">
            Soluções TC Telecom
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((service) => (
              <div key={service.id} className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
                <Image
                  src={service.image}
                  alt={service.imageAlt}
                  width={200}
                  height={200}
                  className="mx-auto h-32 w-auto object-contain"
                />
                <h3 className="mt-4 text-center text-lg font-bold text-[#4a0072]">{service.title}</h3>
                <Link
                  href={`/servicos/#${service.id}`}
                  prefetch={false}
                  className="mt-4 text-center text-sm font-bold uppercase text-[#4a0072] underline-offset-4 hover:underline"
                >
                  Saiba mais
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contato" className="scroll-mt-20 bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-extrabold uppercase text-[#4a0072] sm:text-3xl">
            Fale com a gente
          </h2>
          <p className="mt-3 text-center text-zinc-600">
            Preencha o formulário abaixo e nossa equipe comercial entra em contato.
          </p>
          <div className="mt-10">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
