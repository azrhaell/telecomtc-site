'use client';

import { FormEvent, useState } from 'react';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const inputClass =
  'w-full rounded-md border-2 border-brand-pink bg-white px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-pink';

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
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-white">
          Nome <span className="text-brand-pink">*</span>
        </label>
        <input id="name" name="name" type="text" placeholder="Seu Nome" required className={inputClass} />
      </div>

      <div className="sm:col-span-1">
        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-white">
          Telefone <span className="text-brand-pink">*</span>
        </label>
        <input id="phone" name="phone" type="tel" placeholder="Seu Telefone" required className={inputClass} />
      </div>

      <div className="sm:col-span-1">
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-white">
          E-mail <span className="text-brand-pink">*</span>
        </label>
        <input id="email" name="email" type="email" placeholder="Seu E-mail" required className={inputClass} />
      </div>

      <div className="sm:col-span-1">
        <label htmlFor="company" className="mb-1 block text-sm font-medium text-white">
          Empresa
        </label>
        <input id="company" name="company" type="text" placeholder="Seu CNPJ" className={inputClass} />
      </div>

      <div className="sm:col-span-1">
        <label htmlFor="cnpj" className="mb-1 block text-sm font-medium text-white">
          CNPJ
        </label>
        <input id="cnpj" name="cnpj" type="text" placeholder="Seu CNPJ" className={inputClass} />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-white">
          Como podemos ajudar?
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Sua Mensagem"
          required
          className={inputClass}
        />
      </div>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full rounded-full border-2 border-white bg-transparent px-8 py-3 font-bold uppercase text-white transition-colors hover:bg-white hover:text-black disabled:opacity-60 sm:w-auto"
        >
          {status === 'submitting' ? 'Enviando...' : 'Solicitar Orçamento'}
        </button>
        {status === 'success' && (
          <p className="mt-3 text-sm font-medium text-green-400">Mensagem enviada! Em breve entraremos em contato.</p>
        )}
        {status === 'error' && (
          <p className="mt-3 text-sm font-medium text-red-400">
            Não foi possível enviar agora. Tente novamente ou fale conosco pelo WhatsApp.
          </p>
        )}
      </div>
    </form>
  );
}
