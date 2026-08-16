import type { Metadata } from 'next';
import Image from 'next/image';
import JobApplicationForm from '@/components/JobApplicationForm';
import Reveal from '@/components/Reveal';

export const metadata: Metadata = {
  title: 'Trabalhe Conosco',
  description:
    'Faça parte do time TC Telecom. Envie sua candidatura para nossas vagas comerciais e comece sua carreira com a gente.',
  alternates: { canonical: './' },
};

export default function TrabalheConoscoPage() {
  return (
    <section className="bg-black">
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-6 text-center sm:px-6 md:pt-14">
        <h1 className="neon-text font-heading animate-[tc-up_.8s_cubic-bezier(.2,.7,.3,1)_both] text-5xl sm:text-6xl md:text-7xl">
          Trabalhe Conosco
        </h1>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-14 sm:px-6 md:grid-cols-2 md:items-start md:gap-8 md:pb-20">
        <Reveal kind="left" className="relative mx-auto hidden aspect-[4/5] w-full max-w-md md:block lg:max-w-lg">
          <Image
            src="/wp-content/uploads/2022/04/tc-job-2.png"
            alt="Trabalhe Conosco - TC Telecom"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-contain"
            priority
          />
        </Reveal>

        <Reveal kind="right">
          <JobApplicationForm />
        </Reveal>
      </div>
    </section>
  );
}
