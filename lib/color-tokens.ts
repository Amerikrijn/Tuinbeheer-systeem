export const ColorTokens = {
  // Core semantic colors (Tailwind-like shades as hex)
  blue500: '#3B82F6',
  green500: '#10B981',
  orange500: '#F59E0B',
  red500: '#EF4444',
  purple500: '#8B5CF6',
  gray500: '#6B7280',

  // Flower defaults
  pink400: '#FF69B4',
  orangeRed: '#FF4500',
  gold: '#FFD700',
  mediumPurple: '#9370DB',
  deepPink: '#FF1493',
  orange: '#FFA500',
  yellow: '#FFFF00',
  indigo: '#4B0082',
  coral: '#FF6B6B',
  salmon: '#FF8C69',
  tomato: '#FF6347',
  royalBlue: '#4169E1',
  cornflowerBlue: '#6495ED',
  crimson: '#DC143C',
  white: '#FFFFFF',
  limeGreen: '#32CD32',
  darkTurquoise: '#00CED1',
  plum: '#DDA0DD',
  paleGreen: '#98FB98',

  // UI misc
  gridGray: '#e0e0e0',
  borderGray: '#666666',
  bgLight: '#f5f5f5',

  // Generic fallback
  neutralGray: '#cccccc',
} as const;

export type ColorTokenName = keyof typeof ColorTokens;

export const DEFAULT_FLOWER_COLOR = ColorTokens.pink400;

export const DEFAULT_FLOWER_COLORS: string[] = [
  ColorTokens.pink400,
  ColorTokens.orangeRed,
  ColorTokens.gold,
  ColorTokens.mediumPurple,
  ColorTokens.deepPink,
  ColorTokens.orange,
  ColorTokens.yellow,
  ColorTokens.indigo,
  ColorTokens.coral,
  ColorTokens.salmon,
  ColorTokens.limeGreen,
  ColorTokens.darkTurquoise,
  ColorTokens.tomato,
  ColorTokens.plum,
  ColorTokens.paleGreen,
];

// Dutch color names to hex, used by flower selector and inputs
export const NamedFlowerColors: { [name: string]: string } = {
  'Wit': '#ffffff',
  'Geel': '#ffd700',
  'Roze': '#ffc0cb',
  'Rood': '#ff0000',
  'Paars': '#8a2be2',
  'Blauw': '#0000ff',
  'Oranje': '#ffa500',
  'Groen': '#00ff00',
};