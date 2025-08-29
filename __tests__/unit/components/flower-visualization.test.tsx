import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FlowerVisualization } from '@/components/flower-visualization';

describe('FlowerVisualization', () => {
  const plantBed = { id: 'bed1', size: '100x100' } as any;

  it('renders nothing when no plants are provided', () => {
    const { container } = render(
      <FlowerVisualization
        plantBed={plantBed}
        plants={[]}
        containerWidth={100}
        containerHeight={100}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a flower at the custom position', () => {
    const plants = [
      {
        id: 'p1',
        name: 'Rose',
        color: '#FF0000',
        position_x: 50,
        position_y: 60,
      },
    ] as any;

    render(
      <FlowerVisualization
        plantBed={plantBed}
        plants={plants}
        containerWidth={100}
        containerHeight={100}
      />
    );

    const flower = screen.getByTestId('flower-instance');
    expect(flower).toBeInTheDocument();
    expect(flower).toHaveStyle({ left: '40px', top: '50px', width: '20px', height: '20px' });
  });

  it('renders flowers in a grid layout when positions are missing', () => {
    const plants = [
      { id: 'p1', name: 'A', color: '#111111' },
      { id: 'p2', name: 'B', color: '#222222' },
    ] as any;

    render(
      <FlowerVisualization
        plantBed={plantBed}
        plants={plants}
        containerWidth={100}
        containerHeight={100}
      />
    );

    const flowers = screen.getAllByTestId('flower-instance');
    expect(flowers).toHaveLength(2);
    expect(flowers[0]).toHaveStyle({ left: '15px', top: '40px' });
    expect(flowers[1]).toHaveStyle({ left: '65px', top: '40px' });
  });
});

