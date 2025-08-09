/**
 * Banking-Grade Design System Tokens
 * Nederlandse Banking Standards voor consistente UI/UX
 * Replaces hardcoded styling values
 */

// ===================================================================
// SPACING SYSTEM (Replace hardcoded px-4, py-2, etc.)
// ===================================================================

export const spacing = {
  // Micro spacing
  xs: 'space-x-1 space-y-1', // 4px
  sm: 'space-x-2 space-y-2', // 8px
  
  // Standard spacing
  md: 'space-x-4 space-y-4', // 16px
  lg: 'space-x-6 space-y-6', // 24px
  xl: 'space-x-8 space-y-8', // 32px
  
  // Layout spacing
  '2xl': 'space-x-12 space-y-12', // 48px
  '3xl': 'space-x-16 space-y-16', // 64px
} as const;

export const padding = {
  xs: 'p-1', // 4px
  sm: 'p-2', // 8px
  md: 'p-4', // 16px
  lg: 'p-6', // 24px
  xl: 'p-8', // 32px
} as const;

export const margin = {
  xs: 'm-1', // 4px
  sm: 'm-2', // 8px
  md: 'm-4', // 16px
  lg: 'm-6', // 24px
  xl: 'm-8', // 32px
} as const;

// ===================================================================
// SIZE SYSTEM (Replace hardcoded w-5, h-5, etc.)
// ===================================================================

export const iconSizes = {
  xs: 'w-3 h-3', // 12px
  sm: 'w-4 h-4', // 16px
  md: 'w-5 h-5', // 20px
  lg: 'w-6 h-6', // 24px
  xl: 'w-8 h-8', // 32px
} as const;

export const containerSizes = {
  sm: 'max-w-sm', // 384px
  md: 'max-w-md', // 448px
  lg: 'max-w-lg', // 512px
  xl: 'max-w-xl', // 576px
  '2xl': 'max-w-2xl', // 672px
  '3xl': 'max-w-3xl', // 768px
  '4xl': 'max-w-4xl', // 896px
  '5xl': 'max-w-5xl', // 1024px
  '6xl': 'max-w-6xl', // 1152px
  '7xl': 'max-w-7xl', // 1280px
  full: 'max-w-full',
  screen: 'max-w-screen-xl',
} as const;

// ===================================================================
// COLOR SYSTEM (Banking-Grade Colors)
// ===================================================================

export const colors = {
  // Primary (Green - Banking/Finance)
  primary: {
    50: 'bg-green-50 text-green-900',
    100: 'bg-green-100 text-green-800',
    500: 'bg-green-500 text-white',
    600: 'bg-green-600 text-white',
    700: 'bg-green-700 text-white',
  },
  
  // Status Colors (Banking Standards)
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  
  // Neutral (Professional Banking UI)
  neutral: {
    50: 'bg-gray-50 text-gray-900',
    100: 'bg-gray-100 text-gray-800',
    200: 'bg-gray-200 text-gray-800',
    300: 'bg-gray-300 text-gray-700',
    600: 'bg-gray-600 text-white',
    900: 'bg-gray-900 text-white',
  }
} as const;

// ===================================================================
// COMPONENT VARIANTS (Replace hardcoded component styling)
// ===================================================================

export const buttonVariants = {
  primary: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500',
  outline: 'border border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-500',
  ghost: 'text-green-600 hover:bg-green-50 focus:ring-green-500',
  danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
} as const;

export const cardVariants = {
  default: 'bg-white border border-gray-200 rounded-lg shadow-sm',
  elevated: 'bg-white border border-gray-200 rounded-lg shadow-md',
  interactive: 'bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer',
} as const;

export const inputVariants = {
  default: 'border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500',
  error: 'border border-red-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500',
  success: 'border border-green-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500',
} as const;

// ===================================================================
// ACCESSIBILITY STANDARDS (WCAG 2.1 AA)
// ===================================================================

export const accessibility = {
  // Focus indicators
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
  
  // Touch targets (minimum 44px)
  touchTarget: 'min-h-[44px] min-w-[44px]',
  
  // Text contrast (4.5:1 ratio)
  highContrast: 'text-gray-900',
  mediumContrast: 'text-gray-700',
  lowContrast: 'text-gray-600',
  
  // Screen reader only
  srOnly: 'sr-only',
  
  // Loading states
  loading: 'animate-pulse bg-gray-200',
} as const;

// ===================================================================
// LAYOUT SYSTEM (Banking UI Standards)
// ===================================================================

export const layout = {
  // Container widths
  container: 'container mx-auto px-4',
  containerLg: 'container mx-auto px-6 lg:px-8',
  
  // Grid systems
  gridCols: {
    1: 'grid grid-cols-1',
    2: 'grid grid-cols-1 md:grid-cols-2',
    3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  },
  
  // Flex layouts
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  flexCol: 'flex flex-col',
  
  // Responsive breakpoints
  responsive: {
    mobile: 'block md:hidden',
    tablet: 'hidden md:block lg:hidden',
    desktop: 'hidden lg:block',
  }
} as const;

// ===================================================================
// TYPOGRAPHY SYSTEM (Banking Standards)
// ===================================================================

export const typography = {
  // Headings
  h1: 'text-3xl font-bold text-gray-900 leading-tight',
  h2: 'text-2xl font-semibold text-gray-900 leading-tight',
  h3: 'text-xl font-semibold text-gray-900 leading-tight',
  h4: 'text-lg font-medium text-gray-900 leading-tight',
  
  // Body text
  body: 'text-base text-gray-700 leading-relaxed',
  bodyLarge: 'text-lg text-gray-700 leading-relaxed',
  bodySmall: 'text-sm text-gray-600 leading-relaxed',
  
  // UI text
  label: 'text-sm font-medium text-gray-700',
  caption: 'text-xs text-gray-500',
  
  // Interactive text
  link: 'text-green-600 hover:text-green-700 underline focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
} as const;

// ===================================================================
// BANKING UI HELPER FUNCTIONS
// ===================================================================

/**
 * Get design token value safely
 */
export function getToken(category: keyof typeof designTokens, key: string): string {
  const tokenCategory = designTokens[category] as Record<string, string>;
  return tokenCategory[key] || '';
}

/**
 * Combine design tokens for component styling
 */
export function combineTokens(...tokens: string[]): string {
  return tokens.filter(Boolean).join(' ');
}

/**
 * Banking-grade component class builder
 */
export function buildBankingClasses(
  base: string,
  variant?: string,
  size?: string,
  state?: 'default' | 'hover' | 'focus' | 'disabled'
): string {
  const classes = [base];
  
  if (variant) classes.push(variant);
  if (size) classes.push(size);
  if (state && state !== 'default') classes.push(state);
  
  // Always add accessibility
  classes.push(accessibility.focusRing);
  
  return classes.join(' ');
}

// ===================================================================
// EXPORT DESIGN TOKENS
// ===================================================================

export const designTokens = {
  spacing,
  padding,
  margin,
  iconSizes,
  containerSizes,
  colors,
  buttonVariants,
  cardVariants,
  inputVariants,
  accessibility,
  layout,
  typography,
} as const;

export default designTokens;