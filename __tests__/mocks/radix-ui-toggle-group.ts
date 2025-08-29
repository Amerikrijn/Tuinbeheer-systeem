import React from 'react';

// Mock Radix UI ToggleGroup component
export const ToggleGroup = React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => (
  <div ref={ref} data-testid="toggle-group" {...props}>
    {children}
  </div>
));

export const ToggleGroupItem = React.forwardRef<HTMLButtonElement, any>(({ children, ...props }, ref) => (
  <button ref={ref} data-testid="toggle-group-item" {...props}>
    {children}
  </button>
));

ToggleGroup.displayName = 'ToggleGroup';
ToggleGroupItem.displayName = 'ToggleGroupItem';