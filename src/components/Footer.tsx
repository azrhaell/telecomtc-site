import Image from 'next/image';
import { COMPANY_LEGAL, CONTACT } from '@/lib/site';

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-zinc-300">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-center gap-2">
          <Image
            src="/wp-content/uploads/2022/02/LOFO-OFICIAL.png"
            alt="TC Telecom"
            width={140}
            height={40}
            className="h-9 w-auto"
          />
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="mb-1 text-xs uppercase tracking-wide text-zinc-500">Nos encontre no telefone:</p>
            <a href={CONTACT.phoneHref} className="text-white hover:text-purple-300">
              {CONTACT.phone}
            </a>
          </div>
          <div>
            <p className="mb-1 text-xs uppercase tracking-wide text-zinc-500">Nos chame no WhatsApp:</p>
            <a
              href={CONTACT.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-purple-300"
            >
              {CONTACT.whatsappNumber}
            </a>
          </div>
          <div>
            <p className="mb-1 text-xs uppercase tracking-wide text-zinc-500">Envie um e-mail para:</p>
            <a href={`mailto:${CONTACT.email}`} className="text-white hover:text-purple-300">
              {CONTACT.email}
            </a>
          </div>
          <div>
            <p className="mb-1 text-xs uppercase tracking-wide text-zinc-500">Estamos em:</p>
            <p className="text-white">{CONTACT.address}</p>
          </div>
        </div>

        <p className="mt-10 border-t border-white/10 pt-6 text-xs text-zinc-500">{COMPANY_LEGAL}</p>
      </div>
    </footer>
  );
}
