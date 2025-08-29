import React from 'react';

// Mock Radix UI Label component
export const Root = React.forwardRef<HTMLLabelElement, any>(({ children, ...props }, ref) => {
  return React.createElement('label', { ref, 'data-testid': 'radix-label', ...props }, children);
});

Root.displayName = 'Root';