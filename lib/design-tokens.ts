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
  // Banking-compliant semantic colors that adapt to light/dark mode
  green: {
    50: 'bg-green-50 dark:bg-green-950/20 text-green-900 dark:text-green-100',
    100: 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-200',
    200: 'bg-green-200 dark:bg-green-950/40 text-green-800 dark:text-green-200',
    300: 'bg-green-300 dark:bg-green-950/50 text-green-700 dark:text-green-300',
    500: 'bg-green-500 text-white dark:text-white',
    600: 'bg-green-600 text-white dark:text-white',
    700: 'bg-green-700 text-white dark:text-white',
  },
  
  // Semantic grays that adapt to theme
  gray: {
    50: 'bg-muted text-foreground',
    100: 'bg-muted text-foreground',
    200: 'bg-muted text-foreground',
    300: 'bg-muted text-muted-foreground',
    600: 'bg-muted-foreground text-background',
    900: 'bg-foreground text-background',
  }
}

export const buttons = {
  // Banking-standard button variants with dark mode support
  primary: 'bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-primary',
  secondary: 'bg-secondary hover:bg-secondary/90 text-secondary-foreground focus:ring-secondary',
  outline: 'border border-border bg-background hover:bg-muted text-foreground focus:ring-primary',
  ghost: 'hover:bg-muted text-foreground focus:ring-primary',
  danger: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground focus:ring-destructive',
}

export const cards = {
  default: 'bg-card border border-border rounded-lg shadow-sm',
  elevated: 'bg-card border border-border rounded-lg shadow-md',
  interactive: 'bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer',
}

// Banking accessibility standards for text contrast
export const textContrast = {
  // WCAG AA compliant contrast ratios (4.5:1 minimum)
  primary: 'text-foreground', // Highest contrast
  secondary: 'text-muted-foreground', // Medium contrast
  tertiary: 'text-muted-foreground/80', // Lower contrast but still readable
  
  // Legacy mappings - use semantic colors instead
  highContrast: 'text-foreground',
  mediumContrast: 'text-muted-foreground',
  lowContrast: 'text-muted-foreground/80',
}

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
  default: 'bg-card border border-border rounded-lg shadow-sm',
  elevated: 'bg-card border border-border rounded-lg shadow-md',
  interactive: 'bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer',
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
  h1: 'text-3xl font-bold text-foreground leading-tight',
  h2: 'text-2xl font-semibold text-foreground leading-tight',
  h3: 'text-xl font-semibold text-foreground leading-tight',
  h4: 'text-lg font-medium text-foreground leading-tight',
  
  // Body text
  body: 'text-base text-foreground leading-relaxed',
  bodyLarge: 'text-lg text-foreground leading-relaxed',
  bodySmall: 'text-sm text-muted-foreground leading-relaxed',
  
  // UI text
  label: 'text-sm font-medium text-foreground',
  caption: 'text-xs text-muted-foreground',
  
  // Interactive text
  link: 'text-primary hover:text-primary/80 underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
} as const;

// Loading states with semantic colors
export const loading = {
  skeleton: 'animate-pulse bg-muted',
  spinner: 'animate-spin border-primary',
}

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
  loading,
} as const;

export default designTokens;