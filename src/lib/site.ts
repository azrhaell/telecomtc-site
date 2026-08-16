export const SITE_URL = 'https://telecomtc.com.br';

// Paleta real do site original (extraída do CSS do Elementor em
// mirror-uol/.../wp-content/uploads/elementor/css/post-{4,613,436,266,167}.css)
export const BRAND = {
  purple: '#65009F', // roxo primário
  purpleDark: '#4E196C', // header/footer
  pink: '#FF0096', // rosa/magenta neon (accent)
  whatsapp: '#25D366',
  black: '#000000',
} as const;

export const NAV_ITEMS = [
  { label: 'Início', href: '/' },
  { label: 'Soluções', href: '/servicos/' },
  { label: 'Nossa Empresa', href: '/empresa/' },
] as const;

export const SOCIAL_LINKS = {
  facebook: 'https://web.facebook.com/TC-Telecom-112885764656490',
  instagram: 'https://www.instagram.com/telecomtc30/',
  linkedin: 'https://www.linkedin.com/company/tc-telecom30',
} as const;

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

export const COOKIE_NOTICE =
  'Usamos cookies em nosso site para fornecer a experiência mais relevante, lembrando suas preferências. Ao clicar em "Aceitar", você concorda com os termos e políticas de privacidades do nosso site.';

export const SERVICES = [
  {
    id: 'vivo-movel',
    title: 'VIVO MÓVEL',
    summary:
      'Oferecemos as melhores opções para o seu negócio ter mobilidade total na melhor rede móvel do Brasil. Tudo com a qualidade e velocidade da internet VIVO EMPRESAS.',
    image: '/wp-content/uploads/2022/03/mulher-movel.png',
    imageAlt: 'VIVO MÓVEL - TC TELECOM',
    badge: '/wp-content/uploads/2022/03/best.png',
    badgeAlt: 'Eleita melhor rede móvel do país pelo prêmio P3 Mobile Bench',
  },
  {
    id: 'vivo-fibra',
    title: 'VIVO FIBRA',
    summary:
      'Planos de internet banda larga com a mais rápida fibra ótica, WI-FI e Instalação grátis. Tudo isso e muito mais você adquire através da TC TELECOM.',
    image: '/wp-content/uploads/2022/03/servicos-man.png',
    imageAlt: 'VIVO FIBRA - TC TELECOM',
    badge: '/wp-content/uploads/2022/03/TESTCHAT.png',
    badgeAlt: 'Compre pelo chat — fale com um de nossos atendentes',
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
