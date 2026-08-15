'use client';

import { FormEvent, useState } from 'react';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.append('subject', 'Novo contato pelo site — TC Telecom');
    formData.append('from_name', 'Site TC Telecom');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        setStatus('success');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="access_key" value={process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? ''} />
      <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

      <div className="sm:col-span-1">
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-zinc-700">
          Seu Nome
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full rounded-md border border-zinc-300 px-4 py-2.5 focus:border-[#4a0072] focus:outline-none"
        />
      </div>

      <div className="sm:col-span-1">
        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-zinc-700">
          Seu Telefone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          className="w-full rounded-md border border-zinc-300 px-4 py-2.5 focus:border-[#4a0072] focus:outline-none"
        />
      </div>

      <div className="sm:col-span-1">
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-zinc-700">
          Seu E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-zinc-300 px-4 py-2.5 focus:border-[#4a0072] focus:outline-none"
        />
      </div>

      <div className="sm:col-span-1">
        <label htmlFor="cnpj" className="mb-1 block text-sm font-medium text-zinc-700">
          Seu CNPJ
        </label>
        <input
          id="cnpj"
          name="cnpj"
          type="text"
          className="w-full rounded-md border border-zinc-300 px-4 py-2.5 focus:border-[#4a0072] focus:outline-none"
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-zinc-700">
          Sua Mensagem
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          className="w-full rounded-md border border-zinc-300 px-4 py-2.5 focus:border-[#4a0072] focus:outline-none"
        />
      </div>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full rounded-full bg-[#4a0072] px-6 py-3 font-bold text-white transition-colors hover:bg-[#3a005c] disabled:opacity-60 sm:w-auto"
        >
          {status === 'submitting' ? 'Enviando...' : 'Enviar mensagem'}
        </button>
        {status === 'success' && (
          <p className="mt-3 text-sm font-medium text-green-700">Mensagem enviada! Em breve entraremos em contato.</p>
        )}
        {status === 'error' && (
          <p className="mt-3 text-sm font-medium text-red-700">
            Não foi possível enviar agora. Tente novamente ou fale conosco pelo WhatsApp.
          </p>
        )}
      </div>
    </form>
  );
}
