/**
 * The editorial content behind the seed.
 *
 * Segment: **reformas e manutenção residencial** — the professional travels to
 * the customer, which is what makes distance, hourly rate and availability
 * meaningful filters rather than decoration.
 *
 * This is hand-written on purpose. Faker's `commerce.productName()` produces
 * things like "Handcrafted Rubber Chair" as a service title, and `lorem` bios
 * are visibly filler; both undercut a catalog whose whole job is to look real.
 * Only names, cities and dates are generated.
 */

export interface ServiceSeed {
  title: string
  durationMinutes: number
  /** Price = hourly rate x this, so a service costs what the pro's time costs. */
  rateMultiplier: [min: number, max: number]
}

export interface ProfessionSeed {
  name: string
  slug: string
  category: string
  /** Realistic 2026 BRL hourly range, in cents. */
  rateCents: [min: number, max: number]
  /** loremflickr keywords used to build this profession's portfolio gallery. */
  photoKeywords: string[]
  specialties: string[]
  services: ServiceSeed[]
}

export const PROFESSIONS: ProfessionSeed[] = [
  {
    name: 'Eletricista',
    slug: 'eletricista',
    category: 'Elétrica e Climatização',
    rateCents: [9000, 18000],
    photoKeywords: ['electrician,wiring', 'electrical,panel', 'lightbulb,ceiling'],
    specialties: ['Quadros de distribuição', 'Aterramento', 'Automação residencial'],
    services: [
      { title: 'Instalação de chuveiro elétrico', durationMinutes: 90, rateMultiplier: [1, 1.6] },
      { title: 'Troca de disjuntor', durationMinutes: 60, rateMultiplier: [0.8, 1.2] },
      { title: 'Instalação de tomadas e interruptores', durationMinutes: 120, rateMultiplier: [1.2, 2] },
      { title: 'Revisão do quadro de distribuição', durationMinutes: 180, rateMultiplier: [2, 3.2] },
      { title: 'Instalação de ventilador de teto', durationMinutes: 90, rateMultiplier: [1, 1.5] },
      { title: 'Aterramento residencial', durationMinutes: 240, rateMultiplier: [2.5, 4] },
    ],
  },
  {
    name: 'Técnico em Ar-Condicionado',
    slug: 'tecnico-em-ar-condicionado',
    category: 'Elétrica e Climatização',
    rateCents: [12000, 25000],
    photoKeywords: ['airconditioner,installation', 'hvac,technician', 'air,conditioning'],
    specialties: ['Split hi-wall', 'Multi-split', 'PMOC'],
    services: [
      { title: 'Instalação de split 9.000 BTUs', durationMinutes: 240, rateMultiplier: [2, 3.5] },
      { title: 'Instalação de split 12.000 BTUs', durationMinutes: 240, rateMultiplier: [2.2, 3.8] },
      { title: 'Limpeza e higienização completa', durationMinutes: 120, rateMultiplier: [1, 1.8] },
      { title: 'Recarga de gás refrigerante', durationMinutes: 90, rateMultiplier: [1.2, 2] },
      { title: 'Manutenção preventiva', durationMinutes: 90, rateMultiplier: [0.9, 1.5] },
      { title: 'Reparo de vazamento na tubulação', durationMinutes: 180, rateMultiplier: [1.8, 3] },
    ],
  },
  {
    name: 'Técnico em Eletrodomésticos',
    slug: 'tecnico-em-eletrodomesticos',
    category: 'Elétrica e Climatização',
    rateCents: [10000, 20000],
    photoKeywords: ['appliance,repair', 'washingmachine,repair', 'refrigerator,technician'],
    specialties: ['Linha branca', 'Refrigeração', 'Máquinas de lavar'],
    services: [
      { title: 'Conserto de máquina de lavar', durationMinutes: 120, rateMultiplier: [1.2, 2.2] },
      { title: 'Reparo de geladeira', durationMinutes: 120, rateMultiplier: [1.3, 2.4] },
      { title: 'Conserto de micro-ondas', durationMinutes: 60, rateMultiplier: [0.8, 1.4] },
      { title: 'Manutenção de lava-louças', durationMinutes: 120, rateMultiplier: [1.2, 2] },
      { title: 'Troca de resistência de secadora', durationMinutes: 90, rateMultiplier: [1, 1.6] },
    ],
  },
  {
    name: 'Encanador',
    slug: 'encanador',
    category: 'Hidráulica',
    rateCents: [9000, 18000],
    photoKeywords: ['plumber,pipe', 'plumbing,sink', 'bathroom,plumbing'],
    specialties: ['Caça-vazamento', 'Desentupimento', 'Hidráulica predial'],
    services: [
      { title: 'Desentupimento de pia ou ralo', durationMinutes: 90, rateMultiplier: [1, 1.6] },
      { title: 'Caça-vazamento não destrutivo', durationMinutes: 180, rateMultiplier: [2, 3.5] },
      { title: 'Troca de registro', durationMinutes: 90, rateMultiplier: [1, 1.5] },
      { title: 'Instalação de vaso sanitário', durationMinutes: 120, rateMultiplier: [1.3, 2.2] },
      { title: 'Troca de sifão e flexíveis', durationMinutes: 60, rateMultiplier: [0.7, 1.2] },
      { title: 'Instalação de filtro de água', durationMinutes: 90, rateMultiplier: [1, 1.6] },
    ],
  },
  {
    name: 'Instalador de Aquecedor',
    slug: 'instalador-de-aquecedor',
    category: 'Hidráulica',
    rateCents: [12000, 26000],
    photoKeywords: ['boiler,installation', 'waterheater,gas', 'solar,waterheater'],
    specialties: ['Aquecedor a gás', 'Aquecimento solar', 'Conversão GN/GLP'],
    services: [
      { title: 'Instalação de aquecedor a gás', durationMinutes: 240, rateMultiplier: [2.2, 3.8] },
      { title: 'Manutenção de aquecedor', durationMinutes: 120, rateMultiplier: [1.2, 2] },
      { title: 'Instalação de boiler solar', durationMinutes: 480, rateMultiplier: [4, 7] },
      { title: 'Conversão de gás GN para GLP', durationMinutes: 120, rateMultiplier: [1.3, 2.2] },
      { title: 'Teste de estanqueidade', durationMinutes: 90, rateMultiplier: [1, 1.6] },
    ],
  },
  {
    name: 'Pedreiro',
    slug: 'pedreiro',
    category: 'Alvenaria e Acabamento',
    rateCents: [8000, 16000],
    photoKeywords: ['bricklayer,masonry', 'construction,brick', 'concrete,work'],
    specialties: ['Alvenaria estrutural', 'Contrapiso', 'Reformas gerais'],
    services: [
      { title: 'Levantamento de parede em alvenaria', durationMinutes: 480, rateMultiplier: [4, 7] },
      { title: 'Execução de contrapiso', durationMinutes: 480, rateMultiplier: [3.5, 6] },
      { title: 'Reboco de parede', durationMinutes: 360, rateMultiplier: [3, 5] },
      { title: 'Demolição de parede', durationMinutes: 240, rateMultiplier: [2, 3.5] },
      { title: 'Reforma de churrasqueira', durationMinutes: 480, rateMultiplier: [4, 6.5] },
    ],
  },
  {
    name: 'Azulejista',
    slug: 'azulejista',
    category: 'Alvenaria e Acabamento',
    rateCents: [9000, 17000],
    photoKeywords: ['tiles,tiling', 'bathroom,tile', 'floor,tiles'],
    specialties: ['Porcelanato retificado', 'Grandes formatos', 'Rejunte epóxi'],
    services: [
      { title: 'Assentamento de porcelanato', durationMinutes: 480, rateMultiplier: [4, 6.5] },
      { title: 'Rejuntamento', durationMinutes: 180, rateMultiplier: [1.5, 2.8] },
      { title: 'Revestimento de box', durationMinutes: 300, rateMultiplier: [2.5, 4.2] },
      { title: 'Nivelamento de piso', durationMinutes: 240, rateMultiplier: [2, 3.5] },
      { title: 'Revestimento de parede 3D', durationMinutes: 360, rateMultiplier: [3, 5] },
    ],
  },
  {
    name: 'Gesseiro',
    slug: 'gesseiro',
    category: 'Alvenaria e Acabamento',
    rateCents: [8000, 15000],
    photoKeywords: ['drywall,ceiling', 'plaster,wall', 'ceiling,construction'],
    specialties: ['Drywall', 'Sanca', 'Forro acartonado'],
    services: [
      { title: 'Forro de gesso acartonado', durationMinutes: 480, rateMultiplier: [4, 6.5] },
      { title: 'Sanca aberta com iluminação LED', durationMinutes: 480, rateMultiplier: [4.5, 7] },
      { title: 'Parede em drywall', durationMinutes: 360, rateMultiplier: [3, 5] },
      { title: 'Nicho em gesso', durationMinutes: 180, rateMultiplier: [1.5, 2.6] },
      { title: 'Reparo de trinca em forro', durationMinutes: 120, rateMultiplier: [1, 1.8] },
    ],
  },
  {
    name: 'Pintor',
    slug: 'pintor',
    category: 'Alvenaria e Acabamento',
    rateCents: [7000, 14000],
    photoKeywords: ['painting,wall', 'housepainter,roller', 'paint,interior'],
    specialties: ['Massa corrida', 'Textura projetada', 'Pintura epóxi'],
    services: [
      { title: 'Pintura de parede interna', durationMinutes: 480, rateMultiplier: [3.5, 6] },
      { title: 'Pintura de fachada', durationMinutes: 480, rateMultiplier: [4.5, 7.5] },
      { title: 'Aplicação de massa corrida e lixamento', durationMinutes: 360, rateMultiplier: [3, 5] },
      { title: 'Textura projetada', durationMinutes: 300, rateMultiplier: [2.5, 4.5] },
      { title: 'Pintura de portas e batentes', durationMinutes: 240, rateMultiplier: [2, 3.2] },
      { title: 'Efeito cimento queimado', durationMinutes: 360, rateMultiplier: [3.2, 5.5] },
    ],
  },
  {
    name: 'Marceneiro',
    slug: 'marceneiro',
    category: 'Marcenaria e Esquadrias',
    rateCents: [10000, 22000],
    photoKeywords: ['carpenter,woodworking', 'woodwork,workshop', 'furniture,wood'],
    specialties: ['MDF', 'Madeira maciça', 'Móveis planejados'],
    services: [
      { title: 'Armário planejado sob medida', durationMinutes: 480, rateMultiplier: [5, 9] },
      { title: 'Painel de TV sob medida', durationMinutes: 360, rateMultiplier: [3.5, 6] },
      { title: 'Closet planejado', durationMinutes: 480, rateMultiplier: [6, 10] },
      { title: 'Bancada em madeira maciça', durationMinutes: 360, rateMultiplier: [3.5, 6.5] },
      { title: 'Restauro de móvel antigo', durationMinutes: 300, rateMultiplier: [2.5, 4.5] },
    ],
  },
  {
    name: 'Montador de Móveis',
    slug: 'montador-de-moveis',
    category: 'Marcenaria e Esquadrias',
    rateCents: [6000, 12000],
    photoKeywords: ['furniture,assembly', 'toolbox,screwdriver', 'wardrobe,furniture'],
    specialties: ['Móveis modulados', 'Desmontagem para mudança', 'Fixação em drywall'],
    services: [
      { title: 'Montagem de guarda-roupa', durationMinutes: 180, rateMultiplier: [1.5, 2.8] },
      { title: 'Montagem de cama box', durationMinutes: 60, rateMultiplier: [0.7, 1.2] },
      { title: 'Montagem de cozinha modulada', durationMinutes: 480, rateMultiplier: [4, 7] },
      { title: 'Desmontagem para mudança', durationMinutes: 180, rateMultiplier: [1.5, 2.6] },
      { title: 'Fixação de painel de TV na parede', durationMinutes: 90, rateMultiplier: [0.9, 1.5] },
    ],
  },
  {
    name: 'Vidraceiro',
    slug: 'vidraceiro',
    category: 'Marcenaria e Esquadrias',
    rateCents: [10000, 20000],
    photoKeywords: ['glass,window', 'mirror,glass', 'glazier,window'],
    specialties: ['Vidro temperado', 'Laminado', 'Espelhos sob medida'],
    services: [
      { title: 'Instalação de box de vidro temperado', durationMinutes: 240, rateMultiplier: [2.5, 4.5] },
      { title: 'Espelho sob medida', durationMinutes: 120, rateMultiplier: [1.2, 2.2] },
      { title: 'Janela de correr em vidro temperado', durationMinutes: 300, rateMultiplier: [3, 5.5] },
      { title: 'Troca de vidro quebrado', durationMinutes: 90, rateMultiplier: [1, 1.8] },
      { title: 'Guarda-corpo de vidro', durationMinutes: 360, rateMultiplier: [4, 7] },
    ],
  },
  {
    name: 'Serralheiro',
    slug: 'serralheiro',
    category: 'Marcenaria e Esquadrias',
    rateCents: [10000, 20000],
    photoKeywords: ['welding,metalwork', 'iron,gate', 'blacksmith,steel'],
    specialties: ['Solda MIG', 'Ferro e alumínio', 'Inox'],
    services: [
      { title: 'Portão de ferro sob medida', durationMinutes: 480, rateMultiplier: [5, 9] },
      { title: 'Grade de proteção para janela', durationMinutes: 240, rateMultiplier: [2.2, 4 ] },
      { title: 'Corrimão em aço', durationMinutes: 300, rateMultiplier: [3, 5] },
      { title: 'Estrutura metálica para cobertura', durationMinutes: 480, rateMultiplier: [5.5, 9] },
      { title: 'Solda e reparo de portão', durationMinutes: 120, rateMultiplier: [1.2, 2.2] },
    ],
  },
  {
    name: 'Chaveiro',
    slug: 'chaveiro',
    category: 'Segurança e Áreas Externas',
    rateCents: [8000, 20000],
    photoKeywords: ['locksmith,key', 'door,lock', 'keys,security'],
    specialties: ['Fechadura digital', 'Chaves codificadas', 'Abertura 24h'],
    services: [
      { title: 'Abertura de porta emergencial', durationMinutes: 60, rateMultiplier: [1, 2 ] },
      { title: 'Troca de segredo de fechadura', durationMinutes: 60, rateMultiplier: [0.8, 1.4] },
      { title: 'Instalação de fechadura digital', durationMinutes: 120, rateMultiplier: [1.5, 2.8] },
      { title: 'Cópia de chave codificada', durationMinutes: 30, rateMultiplier: [0.5, 1] },
      { title: 'Instalação de fechadura tetra-chave', durationMinutes: 90, rateMultiplier: [1.1, 2] },
    ],
  },
  {
    name: 'Jardineiro',
    slug: 'jardineiro',
    category: 'Segurança e Áreas Externas',
    rateCents: [5000, 10000],
    photoKeywords: ['gardener,garden', 'hedge,trimming', 'lawn,mowing'],
    specialties: ['Paisagismo', 'Poda técnica', 'Irrigação automatizada'],
    services: [
      { title: 'Manutenção mensal de jardim', durationMinutes: 240, rateMultiplier: [2, 3.5] },
      { title: 'Poda de árvores', durationMinutes: 300, rateMultiplier: [2.5, 4.5] },
      { title: 'Instalação de grama', durationMinutes: 480, rateMultiplier: [4, 6.5] },
      { title: 'Projeto de paisagismo', durationMinutes: 480, rateMultiplier: [5, 8] },
      { title: 'Sistema de irrigação automatizada', durationMinutes: 360, rateMultiplier: [3.5, 6] },
    ],
  },
]

/** Real coordinates, so a distance sort has something honest to work with. */
export const CITIES = [
  { city: 'São Paulo', state: 'SP', lat: -23.5505, lng: -46.6333, weight: 26 },
  { city: 'Rio de Janeiro', state: 'RJ', lat: -22.9068, lng: -43.1729, weight: 14 },
  { city: 'Belo Horizonte', state: 'MG', lat: -19.9167, lng: -43.9345, weight: 9 },
  { city: 'Brasília', state: 'DF', lat: -15.7939, lng: -47.8828, weight: 8 },
  { city: 'Curitiba', state: 'PR', lat: -25.4284, lng: -49.2733, weight: 8 },
  { city: 'Porto Alegre', state: 'RS', lat: -30.0346, lng: -51.2177, weight: 7 },
  { city: 'Salvador', state: 'BA', lat: -12.9777, lng: -38.5016, weight: 7 },
  { city: 'Recife', state: 'PE', lat: -8.0476, lng: -34.877, weight: 6 },
  { city: 'Fortaleza', state: 'CE', lat: -3.7319, lng: -38.5267, weight: 6 },
  { city: 'Campinas', state: 'SP', lat: -22.9099, lng: -47.0626, weight: 5 },
  { city: 'Goiânia', state: 'GO', lat: -16.6869, lng: -49.2648, weight: 4 },
]

/**
 * Review text is picked by star rating.
 *
 * The previous seed drew comments at random regardless of score, so a one-star
 * review could read "Serviço impecável" — the kind of detail a reviewer notices
 * immediately.
 */
export const REVIEWS_BY_RATING: Record<number, string[]> = {
  1: [
    'Marcou, confirmou e não apareceu. Perdi o dia esperando.',
    'O problema voltou em menos de uma semana e não retornou minhas mensagens.',
    'Cobrou bem acima do orçamento combinado depois do serviço feito.',
    'Deixou a sujeira toda e o serviço pela metade.',
  ],
  2: [
    'Demorou muito mais do que o combinado e o acabamento ficou irregular.',
    'Resolveu em partes, tive que chamar outro profissional para terminar.',
    'Atendimento seco e pouca disposição para explicar o que seria feito.',
    'O serviço até funcionou, mas o preço não compensou.',
  ],
  3: [
    'Serviço razoável. Resolveu o problema, mas o acabamento poderia ser melhor.',
    'Atendeu bem, porém atrasou cerca de duas horas.',
    'Trabalho correto, sem nada de excepcional.',
    'Cumpriu o combinado, mas deixou um pouco de sujeira para trás.',
    'Bom profissional, só faltou explicar melhor o orçamento antes de começar.',
  ],
  4: [
    'Bom trabalho, pontual e organizado. Só achei o valor um pouco acima da média.',
    'Resolveu certinho e explicou o que tinha acontecido. Recomendo.',
    'Profissional atencioso, serviço bem feito. Atrasou um pouco na chegada.',
    'Caprichoso e educado. Voltaria a contratar.',
    'Orçamento claro e sem surpresa no final. Acabamento muito bom.',
    'Fez um serviço sólido e ainda deu dicas de manutenção.',
  ],
  5: [
    'Serviço impecável. Chegou no horário e deixou tudo limpo ao terminar.',
    'Resolveu em uma visita o que dois outros profissionais não conseguiram.',
    'Comunicação excelente do orçamento até a entrega. Preço justo.',
    'Muito caprichoso e honesto. Já contratei três vezes e sempre acerta.',
    'Pontual, rápido e explicou cada etapa do serviço. Recomendo de olhos fechados.',
    'Acabamento perfeito e ainda cobrou menos do que o orçado. Raro de encontrar.',
    'Atendeu no mesmo dia em uma emergência e salvou meu fim de semana.',
    'Profissional de primeira. Deixou o ambiente melhor do que encontrou.',
  ],
}

/**
 * Bio fragments, combined at seed time into credible Portuguese.
 *
 * The openings deliberately name the **category**, never the profession.
 * Profession nouns are gendered in Portuguese (encanador/encanadora,
 * pintor/pintora) and the names come from faker in both genders, so a
 * first-person "Atuo como encanador" lands wrong on half the profiles.
 * Categories are noun phrases that inflect for nobody.
 */
export const BIO_OPENINGS = [
  'Atuo na área de {category} há {years} anos',
  'Trabalho na área de {category} há {years} anos',
  'São {years} anos de experiência na área de {category}',
  'Há {years} anos atendendo na área de {category}',
]

// Also gender-neutral: "especializado/especializada" would need to agree with
// the name, so the phrasing sidesteps the adjective entirely.
export const BIO_FOCUS = [
  'com foco em {s1} e {s2}.',
  'com especialidade em {s1} e bastante experiência em {s2}.',
  'e minha especialidade é {s1}. Também atendo demandas de {s2}.',
]

export const BIO_SERVICE = [
  'Atendo {city} e região num raio de até {radius} km, sempre com orçamento sem compromisso.',
  'Trabalho em {city} e cidades vizinhas, até {radius} km, e o orçamento é gratuito.',
  'Atendo toda a região de {city} dentro de {radius} km. Faço a visita técnica sem custo.',
]

export const BIO_CLOSING = [
  'Prezo por pontualidade, limpeza ao final do serviço e garantia de {warranty} meses no que executo.',
  'Levo a sério horário combinado, organização do ambiente e garantia de {warranty} meses.',
  'Meu compromisso é entregar no prazo, deixar tudo limpo e garantir o serviço por {warranty} meses.',
]
