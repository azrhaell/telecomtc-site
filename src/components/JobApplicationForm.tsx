'use client';

import { FormEvent, useState } from 'react';
import { JOB_POSITIONS } from '@/lib/site';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const inputClass =
  'w-full rounded-md border-2 border-brand-pink bg-white px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-pink';

export default function JobApplicationForm() {
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.append('subject', 'Nova candidatura — Trabalhe Conosco TC Telecom');
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
    <form onSubmit={handleSubmit} encType="multipart/form-data" className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="access_key" value={process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? ''} />
      <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

      <div className="sm:col-span-1">
        <label htmlFor="job-name" className="mb-1 block text-sm font-medium text-white">
          Nome
        </label>
        <input id="job-name" name="name" type="text" placeholder="Seu Nome" required className={inputClass} />
      </div>

      <div className="sm:col-span-1">
        <label htmlFor="job-phone" className="mb-1 block text-sm font-medium text-white">
          Telefone
        </label>
        <input id="job-phone" name="phone" type="tel" placeholder="Seu Telefone" required className={inputClass} />
      </div>

      <div className="sm:col-span-1">
        <label htmlFor="job-email" className="mb-1 block text-sm font-medium text-white">
          E-mail
        </label>
        <input id="job-email" name="email" type="email" placeholder="Seu E-mail" required className={inputClass} />
      </div>

      <div className="sm:col-span-1">
        <label htmlFor="job-position" className="mb-1 block text-sm font-medium text-white">
          Cargo Desejado
        </label>
        <select id="job-position" name="position" required className={inputClass}>
          {JOB_POSITIONS.map((position) => (
            <option key={position} value={position}>
              {position}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="job-resume" className="mb-1 block text-sm font-medium text-white">
          Anexe seu currículo:
        </label>
        <input
          id="job-resume"
          name="attachment"
          type="file"
          accept="application/pdf"
          required
          className="w-full rounded-md border-2 border-brand-pink bg-white px-4 py-2.5 text-zinc-900 file:mr-4 file:rounded file:border-0 file:bg-brand-purple file:px-4 file:py-2 file:text-white focus:outline-none"
        />
      </div>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full rounded-full border-2 border-white bg-transparent px-8 py-3 font-bold uppercase text-white transition-colors hover:bg-white hover:text-black disabled:opacity-60 sm:w-auto"
        >
          {status === 'submitting' ? 'Enviando...' : 'Faça um Orçamento'}
        </button>
        {status === 'success' && (
          <p className="mt-3 text-sm font-medium text-green-400">
            Candidatura enviada! Obrigado pelo interesse em fazer parte do nosso time.
          </p>
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
