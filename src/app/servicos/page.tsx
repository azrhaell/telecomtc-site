import type { Metadata } from 'next';
import Image from 'next/image';
import { CONTACT, SERVICES } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Soluções',
  description:
    'Conheça as soluções da TC Telecom: Vivo Móvel, Vivo Fibra, Vivo Tech e Fixa Avançada para o seu negócio.',
  alternates: { canonical: './' },
};

export default function ServicosPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-[#4a0072] to-[#7c2ae8] py-16 text-center text-white">
        <h1 className="text-3xl font-extrabold uppercase sm:text-4xl">Soluções TC Telecom</h1>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto flex max-w-5xl flex-col gap-16 px-4 sm:px-6">
          {SERVICES.map((service, index) => (
            <div
              key={service.id}
              id={service.id}
              className={`scroll-mt-24 flex flex-col items-center gap-8 md:flex-row ${
                index % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              <Image
                src={service.image}
                alt={service.imageAlt}
                width={320}
                height={320}
                className="h-56 w-auto flex-shrink-0 object-contain"
              />
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-extrabold uppercase text-[#4a0072]">{service.title}</h2>
                <p className="mt-4 text-lg text-zinc-700">{service.summary}</p>
                <a
                  href={CONTACT.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-block rounded-full bg-[#4a0072] px-6 py-3 font-bold text-white transition-colors hover:bg-[#3a005c]"
                >
                  Fale com um consultor
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
