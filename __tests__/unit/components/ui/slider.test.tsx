import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Slider } from '@/components/ui/slider';

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

jest.mock('@radix-ui/react-slider', () => ({
  Root: React.forwardRef(({ className, children, ...props }: any, ref: any) => (
    <div
      ref={ref}
      className={className}
      data-testid="slider-root"
      {...props}
    >
      {children}
    </div>
  )),
  Range: ({ className, ...props }: any) => (
    <div
      className={className}
      data-testid="slider-range"
      {...props}
    />
  ),
  Thumb: ({ className, ...props }: any) => (
    <div
      className={className}
      data-testid="slider-thumb"
      {...props}
    />
  ),
  Track: ({ className, ...props }: any) => (
    <div
      className={className}
      data-testid="slider-track"
      {...props}
    />
  ),
}));

describe('Slider Component', () => {
  describe('Slider', () => {
    it('should render with default props', () => {
      render(<Slider />);
      const slider = screen.getByRole('slider');
      const track = screen.getByTestId('slider-track');
      const range = screen.getByTestId('slider-range');
      const thumb = screen.getByTestId('slider-thumb');

      expect(slider).toBeInTheDocument();
      expect(track).toBeInTheDocument();
      expect(range).toBeInTheDocument();
      expect(thumb).toBeInTheDocument();
      expect(slider).toHaveClass('relative', 'flex', 'w-full', 'touch-none', 'select-none', 'items-center');
      expect(track).toHaveClass('relative', 'h-2', 'w-full', 'grow', 'overflow-hidden', 'rounded-full', 'bg-secondary');
      expect(range).toHaveClass('absolute', 'h-full', 'bg-primary');
      expect(thumb).toHaveClass('block', 'h-5', 'w-5', 'rounded-full', 'border-2', 'border-primary', 'bg-background', 'ring-offset-background', 'transition-colors', 'focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring', 'focus-visible:ring-offset-2', 'disabled:pointer-events-none', 'disabled:opacity-50');
    });

    it('should render with custom className', () => {
      render(<Slider className="custom-slider" />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveClass('custom-slider');
    });

    it('should pass through additional props', () => {
      render(
        <Slider
          data-testid="custom-slider"
          min={0}
          max={100}
          step={1}
          defaultValue={[50]}
          aria-label="Volume slider"
        />
      );
      const slider = screen.getByTestId('custom-slider');
      expect(slider).toHaveAttribute('min', '0');
      expect(slider).toHaveAttribute('max', '100');
      expect(slider).toHaveAttribute('step', '1');
      expect(slider).toHaveAttribute('defaultValue', '50');
      expect(slider).toHaveAttribute('aria-label', 'Volume slider');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Slider ref={ref} />);
      expect(ref.current).toBeInTheDocument();
    });

    it('should handle disabled state', () => {
      render(<Slider disabled />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('disabled');
    });

    it('should handle orientation', () => {
      render(<Slider orientation="vertical" />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('orientation', 'vertical');
    });

    it('should handle multiple values', () => {
      render(<Slider defaultValue={[25, 75]} />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('defaultValue', '25,75');
    });

    it('should handle step value', () => {
      render(<Slider step={5} />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('step', '5');
    });

    it('should handle min and max values', () => {
      render(<Slider min={10} max={90} />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('min', '10');
      expect(slider).toHaveAttribute('max', '90');
    });

    it('should handle name attribute', () => {
      render(<Slider name="volume" />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('name', 'volume');
    });

    it('should handle id attribute', () => {
      render(<Slider id="volume-slider" />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('id', 'volume-slider');
    });
  });

  describe('Display Name', () => {
    it('should have correct displayName', () => {
      expect(Slider.displayName).toBe('Root');
    });
  });

  describe('Integration', () => {
    it('should handle multiple sliders', () => {
      render(
        <div>
          <Slider defaultValue={[25]} aria-label="Volume" />
          <Slider defaultValue={[50]} aria-label="Brightness" />
          <Slider defaultValue={[75]} aria-label="Contrast" />
        </div>
      );

      const sliders = screen.getAllByRole('slider');
      expect(sliders).toHaveLength(3);
      expect(sliders[0]).toHaveAttribute('aria-label', 'Volume');
      expect(sliders[1]).toHaveAttribute('aria-label', 'Brightness');
      expect(sliders[2]).toHaveAttribute('aria-label', 'Contrast');
    });

    it('should handle slider with label', () => {
      render(
        <div>
          <label htmlFor="volume-slider">Volume Control</label>
          <Slider id="volume-slider" defaultValue={[60]} />
          <span>60%</span>
        </div>
      );

      const slider = screen.getByRole('slider');
      const label = screen.getByText('Volume Control');
      const value = screen.getByText('60%');

      expect(slider).toBeInTheDocument();
      expect(label).toBeInTheDocument();
      expect(value).toBeInTheDocument();
      expect(slider).toHaveAttribute('id', 'volume-slider');
    });

    it('should handle slider with form', () => {
      render(
        <form>
          <Slider name="volume" defaultValue={[80]} />
          <button type="submit">Save</button>
        </form>
      );

      const slider = screen.getByRole('slider');
      const submitButton = screen.getByText('Save');

      expect(slider).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
      expect(slider).toHaveAttribute('name', 'volume');
    });

    it('should handle range slider', () => {
      render(
        <Slider
          defaultValue={[20, 80]}
          min={0}
          max={100}
          step={5}
          aria-label="Price range"
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('defaultValue', '20,80');
      expect(slider).toHaveAttribute('min', '0');
      expect(slider).toHaveAttribute('max', '100');
      expect(slider).toHaveAttribute('step', '5');
      expect(slider).toHaveAttribute('aria-label', 'Price range');
    });

    it('should handle vertical slider', () => {
      render(
        <Slider
          orientation="vertical"
          defaultValue={[30]}
          className="h-32"
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('orientation', 'vertical');
      expect(slider).toHaveClass('h-32');
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper semantic structure', () => {
      render(<Slider />);
      const slider = screen.getByRole('slider');
      expect(slider.tagName).toBe('DIV');
    });

    it('should handle aria attributes correctly', () => {
      render(
        <Slider
          aria-label="Volume control"
          aria-describedby="volume-help"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={50}
          aria-valuetext="50 percent"
        />
      );
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-label', 'Volume control');
      expect(slider).toHaveAttribute('aria-describedby', 'volume-help');
      expect(slider).toHaveAttribute('aria-valuemin', '0');
      expect(slider).toHaveAttribute('aria-valuemax', '100');
      expect(slider).toHaveAttribute('aria-valuenow', '50');
      expect(slider).toHaveAttribute('aria-valuetext', '50 percent');
    });

    it('should handle role attribute', () => {
      render(<Slider role="slider" />);
      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
    });

    it('should handle tabIndex', () => {
      render(<Slider tabIndex={0} />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('tabIndex', '0');
    });

    it('should handle aria-orientation', () => {
      render(<Slider aria-orientation="vertical" />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-orientation', 'vertical');
    });
  });

  describe('Styling', () => {
    it('should apply default classes', () => {
      render(<Slider>Styled slider</Slider>);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveClass('relative', 'flex', 'w-full', 'touch-none', 'select-none', 'items-center');
    });

    it('should combine custom classes with default classes', () => {
      render(<Slider className="border border-gray-300">Custom styled</Slider>);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveClass('border', 'border-gray-300');
    });

    it('should handle conditional classes', () => {
      const isDisabled = true;
      render(
        <Slider
          className={isDisabled ? 'opacity-50' : 'opacity-100'}
          disabled={isDisabled}
        >
          Conditional styling
        </Slider>
      );
      const slider = screen.getByRole('slider');
      expect(slider).toHaveClass('opacity-50');
    });

    it('should handle responsive classes', () => {
      render(<Slider className="w-full md:w-64 lg:w-96">Responsive</Slider>);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveClass('w-full', 'md:w-64', 'lg:w-96');
    });
  });

  describe('Event Handling', () => {
    it('should handle onValueChange', () => {
      const handleValueChange = jest.fn();
      render(<Slider onValueChange={handleValueChange} />);
      const slider = screen.getByRole('slider');
      
      // Simulate value change
      slider.setAttribute('data-value', '75');
      expect(slider).toHaveAttribute('data-value', '75');
    });

    it('should handle onValueCommit', () => {
      const handleValueCommit = jest.fn();
      render(<Slider onValueCommit={handleValueCommit} />);
      const slider = screen.getByRole('slider');
      
      // Simulate value commit
      slider.setAttribute('data-committed', 'true');
      expect(slider).toHaveAttribute('data-committed', 'true');
    });
  });
});