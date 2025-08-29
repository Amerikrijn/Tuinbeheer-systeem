import React from 'react';

// Mock Radix UI ToggleGroup component
export const ToggleGroup = React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => {
  return (
    <div ref={ref} data-testid="toggle-group" {...props}>
      {children}
    </div>
  );
});

ToggleGroup.displayName = 'ToggleGroup';