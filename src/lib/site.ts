export const SITE_URL = 'https://telecomtc.com.br';

export const NAV_ITEMS = [
  { label: 'Início', href: '/' },
  { label: 'Soluções', href: '/servicos/' },
  { label: 'Nossa Empresa', href: '/empresa/' },
  { label: 'Trabalhe Conosco', href: '/fale-conosco/' },
] as const;

export const CONTACT = {
  phone: '(21) 3081-0053',
  phoneHref: 'tel:+552130810053',
  whatsappNumber: '(21) 99991-1628',
  whatsappLink: 'https://wa.link/92ys5g',
  whatsappProposalLink: 'https://wa.me/message/6O5RDKUKKXJ6A1',
  email: 'comercial@telecomtc.com.br',
  address: 'Av. Dom Hélder Câmara, 5644 - 10° Andar - Engenho de Dentro, Rio de Janeiro - RJ, 20771-034',
} as const;

export const COMPANY_LEGAL =
  '© 2018 - TC REPRESENTAÇÃO COMERCIAL LTDA. 31.508.148/0001-65 - Todos os direitos reservados.';

export const SERVICES = [
  {
    id: 'vivo-movel',
    title: 'VIVO MÓVEL',
    summary:
      'Oferecemos as melhores opções para o seu negócio ter mobilidade total na melhor rede móvel do Brasil. Tudo com a qualidade e velocidade da internet VIVO EMPRESAS.',
    image: '/wp-content/uploads/2022/03/mulher-movel.png',
    imageAlt: 'VIVO MÓVEL - TC TELECOM',
  },
  {
    id: 'vivo-fibra',
    title: 'VIVO FIBRA',
    summary:
      'Planos de internet banda larga com a mais rápida fibra ótica, WI-FI e Instalação grátis. Tudo isso e muito mais você adquire através da TC TELECOM.',
    image: '/wp-content/uploads/2022/03/servicos-man.png',
    imageAlt: 'VIVO FIBRA - TC TELECOM',
  },
  {
    id: 'vivo-tech',
    title: 'VIVO TECH',
    summary:
      'Alugue notebooks, desktops, tablets e impressoras, que atendem a demanda da sua empresa. Tudo com manutenção ilimitada, seguro contra roubo e furto, além de suporte 24 horas!',
    image: '/wp-content/uploads/2022/03/mulher-tech.png',
    imageAlt: 'VIVO TECH - TC',
  },
  {
    id: 'fixa-avancada',
    title: 'FIXA AVANÇADA',
    summary:
      'Soluções de fixa avançada para seu negócio. Link dedicado, PABX, PABX 100% em nuvem e outras soluções de TI. Cliente Vivo Empresas tem seu negócio garantido com segurança e estabilidade.',
    image: '/wp-content/uploads/2022/03/fixa-avancada-pessoas.png',
    imageAlt: 'FIXA AVANÇADA - TC TELECOM',
  },
] as const;

export const TEAMS = [
  {
    title: 'COMERCIAL',
    description: 'Nossa equipe está pronta para te atender e oferecer os melhores produtos VIVO.',
  },
  {
    title: 'PÓS-VENDA',
    description: 'Zelamos pela nossa base de clientes e estamos sempre dispostos a ajudar.',
  },
  {
    title: 'BKO',
    description: 'Nosso time de Back Office analisa cautelosamente todos os pedidos.',
  },
  {
    title: 'INTELIGÊNCIA COMERCIAL',
    description:
      'Nosso marketing produz todo o conteúdo digital da empresa e traz novas oportunidades e vantagens aos clientes.',
  },
] as const;

export const JOB_POSITIONS = [
  'Consultor(a) Comercial',
  'Consultor(a) de Pós Venda',
  'Gestor(a) de Negócios',
] as const;
