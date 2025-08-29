import React from 'react';

// Mock Radix UI ToggleGroup component
export const ToggleGroup = React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => {
  return React.createElement('div', { ref, 'data-testid': 'toggle-group', ...props }, children);
});

ToggleGroup.displayName = 'ToggleGroup';