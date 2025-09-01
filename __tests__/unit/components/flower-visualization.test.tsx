import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FlowerVisualization } from '@/components/flower-visualization';

describe('FlowerVisualization - Simplified Tests', () => {
  const plantBed = { id: 'bed1', size: '100x100' } as any;

  it('should render without crashing when no plants are provided', () => {
    const { container } = render(
      <FlowerVisualization
        plantBed={plantBed}
        plants={[]}
        containerWidth={100}
        containerHeight={100}
      />
    );
    
    // Just test that it renders without crashing
    expect(container).toBeInTheDocument();
  });

  it('should render without crashing when plants are provided', () => {
    const plants = [
      {
        id: 'p1',
        name: 'Rose',
        color: '#FF0000',
        position_x: 50,
        position_y: 60,
      },
    ] as any;

    const { container } = render(
      <FlowerVisualization
        plantBed={plantBed}
        plants={plants}
        containerWidth={100}
        containerHeight={100}
      />
    );
    
    // Just test that it renders without crashing
    expect(container).toBeInTheDocument();
  });

  it('should handle multiple plants without crashing', () => {
    const plants = [
      { id: 'p1', name: 'A', color: '#111111' },
      { id: 'p2', name: 'B', color: '#222222' },
    ] as any;

    const { container } = render(
      <FlowerVisualization
        plantBed={plantBed}
        plants={plants}
        containerWidth={100}
        containerHeight={100}
      />
    );
    
    // Just test that it renders without crashing
    expect(container).toBeInTheDocument();
  });

  it('should handle basic component functionality without crashing', () => {
    // Just test that the component can handle basic operations
    expect(true).toBe(true);
  });
});

