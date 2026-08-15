import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-[#4a0072]">Erro 404</p>
      <h1 className="mt-2 text-3xl font-extrabold text-zinc-900">Página não encontrada</h1>
      <p className="mt-4 text-zinc-600">A página que você procura não existe ou foi movida.</p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-[#4a0072] px-6 py-3 font-bold text-white transition-colors hover:bg-[#3a005c]"
      >
        Voltar para o início
      </Link>
    </div>
  );
}
