// Banking-grade loading states
export function BankingLoadingState({ 
  type = 'page',
  message = 'Laden...'
}: {
  type?: 'page' | 'component' | 'button' | 'table';
  message?: string;
}) {
  const skeletonConfig = {
    page: { rows: 8, height: 'h-4' },
    component: { rows: 3, height: 'h-3' },
    button: { rows: 1, height: 'h-8' },
    table: { rows: 5, height: 'h-4' }
  };
  
  const config = skeletonConfig[type];
  
  return (
    <div 
      className="banking-loading"
      role="status" 
      aria-live="polite"
      aria-label={message}
    >
      <div className="skeleton-container space-y-2">
        {Array.from({ length: config.rows }, (_, i) => (
          <div 
            key={i}
            className={`skeleton ${config.height} animate-pulse bg-gray-200 rounded mb-2`}
            style={{ width: `${Math.random() * 40 + 60}%` }}
          />
        ))}
      </div>
      
      <span className="sr-only">{message}</span>
    </div>
  );
}

// Backwards compatibility
export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <BankingLoadingState type="component" />
    </div>
  );
}
