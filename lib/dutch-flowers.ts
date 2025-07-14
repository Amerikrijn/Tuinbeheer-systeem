// Nederlandse bloemennamen database
// Gebaseerd op web research en populaire tuinbloemen in Nederland

export interface FlowerData {
  name: string;
  scientificName?: string;
  category: 'eenjarig' | 'vaste_planten' | 'bolgewassen' | 'struiken' | 'klimmers' | 'overig';
  bloeiperiode: string;
  kleur: string[];
  popular: boolean;
  description?: string;
}

export const DUTCH_FLOWERS: FlowerData[] = [
  // Populaire eenjarige bloemen
  {
    name: 'Zonnebloem',
    scientificName: 'Helianthus annuus',
    category: 'eenjarig',
    bloeiperiode: 'Juli-Oktober',
    kleur: ['Geel', 'Oranje'],
    popular: true,
    description: 'Grote, vrolijke bloem die de zon volgt'
  },
  {
    name: 'Petunia',
    scientificName: 'Petunia × atkinsiana',
    category: 'eenjarig',
    bloeiperiode: 'Mei-Oktober',
    kleur: ['Wit', 'Roze', 'Paars', 'Rood', 'Blauw'],
    popular: true,
    description: 'Populaire hangplant met rijke bloei'
  },
  {
    name: 'Begonia',
    scientificName: 'Begonia × semperflorens',
    category: 'eenjarig',
    bloeiperiode: 'Mei-Oktober',
    kleur: ['Wit', 'Roze', 'Rood'],
    popular: true,
    description: 'Betrouwbare bedding plant'
  },
  {
    name: 'Impatiens',
    scientificName: 'Impatiens walleriana',
    category: 'eenjarig',
    bloeiperiode: 'Mei-Oktober',
    kleur: ['Wit', 'Roze', 'Rood', 'Paars', 'Oranje'],
    popular: true,
    description: 'Vrolijk voor schaduwrijke plekken'
  },
  {
    name: 'Tagetes',
    scientificName: 'Tagetes patula',
    category: 'eenjarig',
    bloeiperiode: 'Mei-Oktober',
    kleur: ['Geel', 'Oranje', 'Rood'],
    popular: true,
    description: 'Goudsbloem, houdt ongedierte weg'
  },
  {
    name: 'Zinnia',
    scientificName: 'Zinnia elegans',
    category: 'eenjarig',
    bloeiperiode: 'Juni-Oktober',
    kleur: ['Wit', 'Geel', 'Oranje', 'Roze', 'Rood', 'Paars'],
    popular: true,
    description: 'Kleurrijke snijbloem'
  },
  {
    name: 'Cosmea',
    scientificName: 'Cosmos bipinnatus',
    category: 'eenjarig',
    bloeiperiode: 'Juli-Oktober',
    kleur: ['Wit', 'Roze', 'Rood', 'Paars'],
    popular: true,
    description: 'Luchtige bloem voor natuurlijke tuinen'
  },
  {
    name: 'Calendula',
    scientificName: 'Calendula officinalis',
    category: 'eenjarig',
    bloeiperiode: 'Juni-Oktober',
    kleur: ['Geel', 'Oranje'],
    popular: true,
    description: 'Goudsbloem, eetbare bloem'
  },
  {
    name: 'Papaver',
    scientificName: 'Papaver rhoeas',
    category: 'eenjarig',
    bloeiperiode: 'Mei-Juli',
    kleur: ['Rood', 'Roze', 'Wit'],
    popular: true,
    description: 'Klaproos, wilde bloem'
  },
  {
    name: 'Korenbloem',
    scientificName: 'Centaurea cyanus',
    category: 'eenjarig',
    bloeiperiode: 'Juni-Augustus',
    kleur: ['Blauw', 'Wit', 'Roze'],
    popular: true,
    description: 'Traditionele veldbloem'
  },

  // Vaste planten
  {
    name: 'Roos',
    scientificName: 'Rosa species',
    category: 'struiken',
    bloeiperiode: 'Mei-Oktober',
    kleur: ['Wit', 'Roze', 'Rood', 'Geel', 'Paars'],
    popular: true,
    description: 'Koningin van de bloemen'
  },
  {
    name: 'Lavendel',
    scientificName: 'Lavandula angustifolia',
    category: 'vaste_planten',
    bloeiperiode: 'Juni-Augustus',
    kleur: ['Paars', 'Blauw'],
    popular: true,
    description: 'Geurende bloem, trekt bijen aan'
  },
  {
    name: 'Zonnehoed',
    scientificName: 'Echinacea purpurea',
    category: 'vaste_planten',
    bloeiperiode: 'Juli-September',
    kleur: ['Paars', 'Roze', 'Wit'],
    popular: true,
    description: 'Medicijnplant, trekt vlinders aan'
  },
  {
    name: 'Rudbeckia',
    scientificName: 'Rudbeckia fulgida',
    category: 'vaste_planten',
    bloeiperiode: 'Juli-Oktober',
    kleur: ['Geel', 'Oranje'],
    popular: true,
    description: 'Zonnehoed, langbloeiend'
  },
  {
    name: 'Aster',
    scientificName: 'Symphyotrichum species',
    category: 'vaste_planten',
    bloeiperiode: 'Augustus-Oktober',
    kleur: ['Paars', 'Roze', 'Wit', 'Blauw'],
    popular: true,
    description: 'Herfstbloem, trekt vlinders aan'
  },
  {
    name: 'Phlox',
    scientificName: 'Phlox paniculata',
    category: 'vaste_planten',
    bloeiperiode: 'Juli-September',
    kleur: ['Wit', 'Roze', 'Rood', 'Paars'],
    popular: true,
    description: 'Geurende vaste plant'
  },
  {
    name: 'Delphinium',
    scientificName: 'Delphinium elatum',
    category: 'vaste_planten',
    bloeiperiode: 'Juni-Juli',
    kleur: ['Blauw', 'Paars', 'Wit', 'Roze'],
    popular: true,
    description: 'Ridderspoor, hoge bloem'
  },
  {
    name: 'Pioenroos',
    scientificName: 'Paeonia lactiflora',
    category: 'vaste_planten',
    bloeiperiode: 'Mei-Juni',
    kleur: ['Wit', 'Roze', 'Rood'],
    popular: true,
    description: 'Luxe bloem met sterke geur'
  },
  {
    name: 'Iris',
    scientificName: 'Iris germanica',
    category: 'vaste_planten',
    bloeiperiode: 'April-Juni',
    kleur: ['Paars', 'Blauw', 'Wit', 'Geel'],
    popular: true,
    description: 'Elegante bloem, lis'
  },
  {
    name: 'Dagelelie',
    scientificName: 'Hemerocallis species',
    category: 'vaste_planten',
    bloeiperiode: 'Juni-Augustus',
    kleur: ['Geel', 'Oranje', 'Roze', 'Rood'],
    popular: true,
    description: 'Elke bloem duurt één dag'
  },

  // Bolgewassen
  {
    name: 'Tulp',
    scientificName: 'Tulipa species',
    category: 'bolgewassen',
    bloeiperiode: 'Maart-Mei',
    kleur: ['Wit', 'Geel', 'Roze', 'Rood', 'Paars', 'Oranje'],
    popular: true,
    description: 'Nederlandse nationale bloem'
  },
  {
    name: 'Narcis',
    scientificName: 'Narcissus species',
    category: 'bolgewassen',
    bloeiperiode: 'Februari-April',
    kleur: ['Wit', 'Geel'],
    popular: true,
    description: 'Paasbloem, eerste voorjaarsbloem'
  },
  {
    name: 'Hyacint',
    scientificName: 'Hyacinthus orientalis',
    category: 'bolgewassen',
    bloeiperiode: 'Maart-April',
    kleur: ['Wit', 'Roze', 'Rood', 'Paars', 'Blauw'],
    popular: true,
    description: 'Sterk geurende voorjaarsbloem'
  },
  {
    name: 'Krokus',
    scientificName: 'Crocus species',
    category: 'bolgewassen',
    bloeiperiode: 'Februari-Maart',
    kleur: ['Wit', 'Geel', 'Paars', 'Blauw'],
    popular: true,
    description: 'Kleine vroege voorjaarsbloem'
  },
  {
    name: 'Gladiool',
    scientificName: 'Gladiolus species',
    category: 'bolgewassen',
    bloeiperiode: 'Juli-Oktober',
    kleur: ['Wit', 'Geel', 'Roze', 'Rood', 'Paars', 'Oranje'],
    popular: true,
    description: 'Zwaardlelie, snijbloem'
  },
  {
    name: 'Dahlia',
    scientificName: 'Dahlia pinnata',
    category: 'bolgewassen',
    bloeiperiode: 'Juli-Oktober',
    kleur: ['Wit', 'Geel', 'Roze', 'Rood', 'Paars', 'Oranje'],
    popular: true,
    description: 'Kleurrijke herfstbloem'
  },
  {
    name: 'Lelie',
    scientificName: 'Lilium species',
    category: 'bolgewassen',
    bloeiperiode: 'Juni-Augustus',
    kleur: ['Wit', 'Geel', 'Roze', 'Rood', 'Oranje'],
    popular: true,
    description: 'Elegante geurende bloem'
  },
  {
    name: 'Allium',
    scientificName: 'Allium species',
    category: 'bolgewassen',
    bloeiperiode: 'April-Juli',
    kleur: ['Paars', 'Wit', 'Geel', 'Roze'],
    popular: true,
    description: 'Sierui, ronde bloembol'
  },

  // Nederlandse wilde bloemen
  {
    name: 'Madeliefje',
    scientificName: 'Bellis perennis',
    category: 'vaste_planten',
    bloeiperiode: 'Maart-November',
    kleur: ['Wit', 'Roze'],
    popular: true,
    description: 'Nederlandse nationale bloem 2023'
  },
  {
    name: 'Paardenbloem',
    scientificName: 'Taraxacum officinale',
    category: 'vaste_planten',
    bloeiperiode: 'Maart-Oktober',
    kleur: ['Geel'],
    popular: true,
    description: 'Wilde bloem, pluizenbollen'
  },
  {
    name: 'Boterbloem',
    scientificName: 'Ranunculus repens',
    category: 'vaste_planten',
    bloeiperiode: 'April-September',
    kleur: ['Geel'],
    popular: true,
    description: 'Glanst onder de kin'
  },
  {
    name: 'Klaproos',
    scientificName: 'Papaver rhoeas',
    category: 'eenjarig',
    bloeiperiode: 'Mei-Juli',
    kleur: ['Rood'],
    popular: true,
    description: 'Symbool van herinnering'
  },
  {
    name: 'Vergeet-mij-nietje',
    scientificName: 'Myosotis sylvatica',
    category: 'vaste_planten',
    bloeiperiode: 'April-Juni',
    kleur: ['Blauw', 'Wit', 'Roze'],
    popular: true,
    description: 'Kleine blauwe bloem'
  },

  // Struiken
  {
    name: 'Hortensia',
    scientificName: 'Hydrangea macrophylla',
    category: 'struiken',
    bloeiperiode: 'Juni-September',
    kleur: ['Wit', 'Roze', 'Blauw', 'Paars'],
    popular: true,
    description: 'Grote bloemtrossen'
  },
  {
    name: 'Forsythia',
    scientificName: 'Forsythia × intermedia',
    category: 'struiken',
    bloeiperiode: 'Maart-April',
    kleur: ['Geel'],
    popular: true,
    description: 'Eerste gele voorjaarsbloem'
  },
  {
    name: 'Sering',
    scientificName: 'Syringa vulgaris',
    category: 'struiken',
    bloeiperiode: 'Mei',
    kleur: ['Paars', 'Wit', 'Roze'],
    popular: true,
    description: 'Sterk geurende voorjaarsbloem'
  },
  {
    name: 'Rhododendron',
    scientificName: 'Rhododendron ponticum',
    category: 'struiken',
    bloeiperiode: 'Mei-Juni',
    kleur: ['Paars', 'Wit', 'Roze', 'Rood'],
    popular: true,
    description: 'Altijd groene struik'
  },
  {
    name: 'Azalea',
    scientificName: 'Rhododendron species',
    category: 'struiken',
    bloeiperiode: 'April-Mei',
    kleur: ['Wit', 'Roze', 'Rood', 'Paars', 'Geel'],
    popular: true,
    description: 'Vroegbloeiende struik'
  },

  // Klimmers
  {
    name: 'Clematis',
    scientificName: 'Clematis species',
    category: 'klimmers',
    bloeiperiode: 'April-Oktober',
    kleur: ['Wit', 'Roze', 'Paars', 'Blauw', 'Rood'],
    popular: true,
    description: 'Bosrank, klimmende plant'
  },
  {
    name: 'Kamperfoelie',
    scientificName: 'Lonicera periclymenum',
    category: 'klimmers',
    bloeiperiode: 'Mei-September',
    kleur: ['Wit', 'Geel', 'Roze'],
    popular: true,
    description: 'Geurende klimmende plant'
  },
  {
    name: 'Klimroos',
    scientificName: 'Rosa species',
    category: 'klimmers',
    bloeiperiode: 'Mei-Oktober',
    kleur: ['Wit', 'Roze', 'Rood', 'Geel'],
    popular: true,
    description: 'Klimmende roos'
  },

  // Overige populaire bloemen
  {
    name: 'Viooltje',
    scientificName: 'Viola tricolor',
    category: 'eenjarig',
    bloeiperiode: 'April-Oktober',
    kleur: ['Paars', 'Geel', 'Wit', 'Blauw'],
    popular: true,
    description: 'Driekleurig viooltje'
  },
  {
    name: 'Primula',
    scientificName: 'Primula vulgaris',
    category: 'vaste_planten',
    bloeiperiode: 'Februari-April',
    kleur: ['Geel', 'Wit', 'Roze', 'Paars'],
    popular: true,
    description: 'Vroege voorjaarsbloem'
  },
  {
    name: 'Geranium',
    scientificName: 'Pelargonium species',
    category: 'eenjarig',
    bloeiperiode: 'Mei-Oktober',
    kleur: ['Wit', 'Roze', 'Rood', 'Paars'],
    popular: true,
    description: 'Populaire balkonplant'
  },
  {
    name: 'Fuchsia',
    scientificName: 'Fuchsia species',
    category: 'eenjarig',
    bloeiperiode: 'Mei-Oktober',
    kleur: ['Roze', 'Paars', 'Wit', 'Rood'],
    popular: true,
    description: 'Hangende bloem'
  },
  {
    name: 'Salvia',
    scientificName: 'Salvia splendens',
    category: 'eenjarig',
    bloeiperiode: 'Mei-Oktober',
    kleur: ['Rood', 'Paars', 'Wit', 'Roze'],
    popular: true,
    description: 'Salie, trekt bijen aan'
  },
  {
    name: 'Anjer',
    scientificName: 'Dianthus caryophyllus',
    category: 'vaste_planten',
    bloeiperiode: 'Juni-September',
    kleur: ['Wit', 'Roze', 'Rood', 'Paars'],
    popular: true,
    description: 'Geurende snijbloem'
  },
  {
    name: 'Gerbera',
    scientificName: 'Gerbera jamesonii',
    category: 'eenjarig',
    bloeiperiode: 'Mei-Oktober',
    kleur: ['Wit', 'Geel', 'Roze', 'Rood', 'Oranje'],
    popular: true,
    description: 'Vrolijke snijbloem'
  },
  {
    name: 'Chrysant',
    scientificName: 'Chrysanthemum morifolium',
    category: 'vaste_planten',
    bloeiperiode: 'Augustus-November',
    kleur: ['Wit', 'Geel', 'Roze', 'Rood', 'Paars', 'Oranje'],
    popular: true,
    description: 'Herfstbloem'
  },
  {
    name: 'Zinnias',
    scientificName: 'Zinnia elegans',
    category: 'eenjarig',
    bloeiperiode: 'Juni-Oktober',
    kleur: ['Wit', 'Geel', 'Roze', 'Rood', 'Oranje', 'Paars'],
    popular: true,
    description: 'Kleurrijke zomerbloem'
  },
  {
    name: 'Zonnebloem',
    scientificName: 'Helianthus annuus',
    category: 'eenjarig',
    bloeiperiode: 'Juli-September',
    kleur: ['Geel', 'Oranje', 'Rood'],
    popular: true,
    description: 'Grote bloem die de zon volgt'
  }
];

// Utility functies
export const getFlowersByCategory = (category: FlowerData['category']) => {
  return DUTCH_FLOWERS.filter(flower => flower.category === category);
};

export const getPopularFlowers = () => {
  return DUTCH_FLOWERS.filter(flower => flower.popular).sort((a, b) => a.name.localeCompare(b.name));
};

export const getFlowersByColor = (color: string) => {
  return DUTCH_FLOWERS.filter(flower => flower.kleur.includes(color));
};

export const getFlowersByBloomingPeriod = (month: string) => {
  const monthNumbers: { [key: string]: number } = {
    'Januari': 1, 'Februari': 2, 'Maart': 3, 'April': 4, 'Mei': 5, 'Juni': 6,
    'Juli': 7, 'Augustus': 8, 'September': 9, 'Oktober': 10, 'November': 11, 'December': 12
  };
  
  return DUTCH_FLOWERS.filter(flower => {
    const period = flower.bloeiperiode.toLowerCase();
    return period.includes(month.toLowerCase());
  });
};

export const searchFlowers = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return DUTCH_FLOWERS.filter(flower => 
    flower.name.toLowerCase().includes(lowerQuery) ||
    flower.scientificName?.toLowerCase().includes(lowerQuery) ||
    flower.description?.toLowerCase().includes(lowerQuery)
  );
};

export const FLOWER_CATEGORIES = {
  'eenjarig': 'Eenjarige bloemen',
  'vaste_planten': 'Vaste planten',
  'bolgewassen': 'Bolgewassen',
  'struiken': 'Struiken',
  'klimmers': 'Klimmers',
  'overig': 'Overig'
} as const;

export const FLOWER_COLORS = [
  'Wit', 'Geel', 'Roze', 'Rood', 'Paars', 'Blauw', 'Oranje', 'Groen'
] as const;

export const BLOOMING_MONTHS = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
] as const;