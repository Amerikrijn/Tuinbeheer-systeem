import React from 'react';

// Mock Radix UI Label component
export const Root = React.forwardRef<HTMLLabelElement, any>(({ children, ...props }, ref) => (
  <label ref={ref} data-testid="radix-label" {...props}>
    {children}
  </label>
));

Root.displayName = 'Root';