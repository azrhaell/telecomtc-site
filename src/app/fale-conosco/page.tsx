import type { Metadata } from 'next';
import JobApplicationForm from '@/components/JobApplicationForm';

export const metadata: Metadata = {
  title: 'Trabalhe Conosco',
  description: 'Faça parte do time TC Telecom. Envie sua candidatura para nossas vagas comerciais.',
  alternates: { canonical: './' },
};

export default function TrabalheConoscoPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-[#4a0072] to-[#7c2ae8] py-16 text-center text-white">
        <h1 className="text-3xl font-extrabold uppercase sm:text-4xl">Trabalhe Conosco</h1>
        <p className="mt-3 text-lg text-purple-100">Venha fazer parte do time TC Telecom.</p>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <JobApplicationForm />
        </div>
      </section>
    </>
  );
}
