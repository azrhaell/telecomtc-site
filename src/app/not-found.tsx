import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="animate-[tc-up_.6s_ease_both] text-sm font-bold uppercase tracking-widest text-brand-purple">
        Erro 404
      </p>
      <h1
        style={{ animationDelay: '.1s' }}
        className="mt-2 animate-[tc-up_.6s_ease_both] text-3xl font-extrabold text-zinc-900"
      >
        Página não encontrada
      </h1>
      <p style={{ animationDelay: '.2s' }} className="mt-4 animate-[tc-up_.6s_ease_both] text-zinc-600">
        A página que você procura não existe ou foi movida.
      </p>
      <Link
        href="/"
        style={{ animationDelay: '.3s' }}
        className="mt-8 animate-[tc-up_.6s_ease_both] rounded-full bg-brand-purple px-6 py-3 font-bold text-white transition-colors hover:bg-brand-purple-dark"
      >
        Voltar para o início
      </Link>
    </div>
  );
}
