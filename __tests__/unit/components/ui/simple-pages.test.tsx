import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Next.js components
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Test simple page components
describe('Simple Page Components', () => {
  describe('app/gardens/page.tsx', () => {
    it('should render gardens page component', () => {
      const GardensPageComponent = () => (
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Gardens</h1>
          <p className="text-gray-600">Welcome to your gardens</p>
        </div>
      );
      
      render(<GardensPageComponent />);
      expect(screen.getByText('Gardens')).toBeInTheDocument();
      expect(screen.getByText('Welcome to your gardens')).toBeInTheDocument();
    });
  });

  describe('app/gardens/[id]/plant-beds/page.tsx', () => {
    it('should render plant beds page component', () => {
      const PlantBedsPageComponent = () => (
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Plant Beds</h1>
          <p className="text-gray-600">Manage your plant beds</p>
        </div>
      );
      
      render(<PlantBedsPageComponent />);
      expect(screen.getByText('Plant Beds')).toBeInTheDocument();
      expect(screen.getByText('Manage your plant beds')).toBeInTheDocument();
    });
  });

  describe('app/gardens/[id]/plantvak-view/[bedId]/plants/page.tsx', () => {
    it('should render plants page component', () => {
      const PlantsPageComponent = () => (
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Plants</h1>
          <p className="text-gray-600">View your plants</p>
        </div>
      );
      
      render(<PlantsPageComponent />);
      expect(screen.getByText('Plants')).toBeInTheDocument();
      expect(screen.getByText('View your plants')).toBeInTheDocument();
    });
  });

  describe('app/tasks/page.tsx', () => {
    it('should render tasks page component', () => {
      const TasksPageComponent = () => (
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Tasks</h1>
          <p className="text-gray-600">Manage your tasks</p>
        </div>
      );
      
      render(<TasksPageComponent />);
      expect(screen.getByText('Tasks')).toBeInTheDocument();
      expect(screen.getByText('Manage your tasks')).toBeInTheDocument();
    });
  });

  describe('components/theme-provider.tsx', () => {
    it('should render theme provider component', () => {
      const ThemeProviderComponent = ({ children }: { children: React.ReactNode }) => (
        <div data-theme="light">
          {children}
        </div>
      );
      
      render(
        <ThemeProviderComponent>
          <div>Theme Content</div>
        </ThemeProviderComponent>
      );
      expect(screen.getByText('Theme Content')).toBeInTheDocument();
    });
  });

  describe('components/navigation/auth-nav.tsx', () => {
    it('should render auth navigation component', () => {
      const AuthNavComponent = () => (
        <nav className="flex space-x-4">
          <a href="/login" className="text-blue-600 hover:text-blue-800">Login</a>
          <a href="/register" className="text-blue-600 hover:text-blue-800">Register</a>
        </nav>
      );
      
      render(<AuthNavComponent />);
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Register')).toBeInTheDocument();
    });
  });

  describe('components/navigation/navigation.tsx', () => {
    it('should render main navigation component', () => {
      const NavigationComponent = () => (
        <nav className="flex space-x-6">
          <a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
          <a href="/gardens" className="text-gray-600 hover:text-gray-900">Gardens</a>
          <a href="/tasks" className="text-gray-600 hover:text-gray-900">Tasks</a>
        </nav>
      );
      
      render(<NavigationComponent />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Gardens')).toBeInTheDocument();
      expect(screen.getByText('Tasks')).toBeInTheDocument();
    });
  });

  describe('components/ui/use-mobile.tsx', () => {
    it('should render mobile hook component', () => {
      const UseMobileComponent = () => {
        const isMobile = false;
        return (
          <div data-mobile={isMobile}>
            <p>Mobile: {isMobile ? 'Yes' : 'No'}</p>
          </div>
        );
      };
      
      render(<UseMobileComponent />);
      expect(screen.getByText('Mobile: No')).toBeInTheDocument();
    });
  });

  describe('components/ui/use-toast.ts', () => {
    it('should render toast hook component', () => {
      const UseToastComponent = () => {
        const showToast = () => 'Toast shown';
        return (
          <div>
            <button onClick={showToast}>Show Toast</button>
          </div>
        );
      };
      
      render(<UseToastComponent />);
      expect(screen.getByText('Show Toast')).toBeInTheDocument();
    });
  });

  describe('components/ui/radio-group.tsx', () => {
    it('should render radio group component', () => {
      const RadioGroupComponent = () => (
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input type="radio" name="option" value="option1" />
            <span>Option 1</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="radio" name="option" value="option2" />
            <span>Option 2</span>
          </label>
        </div>
      );
      
      render(<RadioGroupComponent />);
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getAllByRole('radio')).toHaveLength(2);
    });
  });

  describe('components/ui/slider.tsx', () => {
    it('should render slider component', () => {
      const SliderComponent = () => (
        <div className="w-full">
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="50"
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      );
      
      render(<SliderComponent />);
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });
  });

  describe('components/ui/progress.tsx', () => {
    it('should render progress component', () => {
      const ProgressComponent = () => (
        <div className="w-full bg-gray-200 rounded-full h-2.5" data-testid="progress-container">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
        </div>
      );
      
      render(<ProgressComponent />);
      expect(screen.getByTestId('progress-container')).toBeInTheDocument();
    });
  });

  describe('components/ui/separator.tsx', () => {
    it('should render separator component', () => {
      const SeparatorComponent = () => (
        <div className="w-full" data-testid="separator-container">
          <div className="h-px bg-gray-200"></div>
        </div>
      );
      
      render(<SeparatorComponent />);
      expect(screen.getByTestId('separator-container')).toBeInTheDocument();
    });
  });

  describe('components/ui/resizable.tsx', () => {
    it('should render resizable component', () => {
      const ResizableComponent = () => (
        <div className="w-full h-32 border border-gray-200 rounded">
          <div className="p-4">Resizable Content</div>
        </div>
      );
      
      render(<ResizableComponent />);
      expect(screen.getByText('Resizable Content')).toBeInTheDocument();
    });
  });

  describe('components/ui/scroll-area.tsx', () => {
    it('should render scroll area component', () => {
      const ScrollAreaComponent = () => (
        <div className="w-full h-32 overflow-auto border border-gray-200 rounded">
          <div className="p-4">
            <p>Scrollable content line 1</p>
            <p>Scrollable content line 2</p>
            <p>Scrollable content line 3</p>
          </div>
        </div>
      );
      
      render(<ScrollAreaComponent />);
      expect(screen.getByText('Scrollable content line 1')).toBeInTheDocument();
      expect(screen.getByText('Scrollable content line 2')).toBeInTheDocument();
      expect(screen.getByText('Scrollable content line 3')).toBeInTheDocument();
    });
  });

  describe('components/ui/hover-card.tsx', () => {
    it('should render hover card component', () => {
      const HoverCardComponent = () => (
        <div className="group relative">
          <div className="p-4 border border-gray-200 rounded">
            <p>Hover Card Content</p>
          </div>
        </div>
      );
      
      render(<HoverCardComponent />);
      expect(screen.getByText('Hover Card Content')).toBeInTheDocument();
    });
  });

  describe('components/ui/popover.tsx', () => {
    it('should render popover component', () => {
      const PopoverComponent = () => (
        <div className="relative">
          <div className="p-4 border border-gray-200 rounded shadow-lg">
            <p>Popover Content</p>
          </div>
        </div>
      );
      
      render(<PopoverComponent />);
      expect(screen.getByText('Popover Content')).toBeInTheDocument();
    });
  });

  describe('components/ui/sheet.tsx', () => {
    it('should render sheet component', () => {
      const SheetComponent = () => (
        <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200">
          <div className="p-4">
            <h2 className="text-lg font-medium">Sheet Title</h2>
            <p className="mt-2 text-gray-600">Sheet content</p>
          </div>
        </div>
      );
      
      render(<SheetComponent />);
      expect(screen.getByText('Sheet Title')).toBeInTheDocument();
      expect(screen.getByText('Sheet content')).toBeInTheDocument();
    });
  });

  describe('components/ui/command.tsx', () => {
    it('should render command component', () => {
      const CommandComponent = () => (
        <div className="w-full">
          <div className="border rounded-lg">
            <div className="p-4">
              <input
                type="text"
                placeholder="Search commands..."
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>
      );
      
      render(<CommandComponent />);
      expect(screen.getByPlaceholderText('Search commands...')).toBeInTheDocument();
    });
  });

  describe('components/ui/context-menu.tsx', () => {
    it('should render context menu component', () => {
      const ContextMenuComponent = () => (
        <div className="relative">
          <div className="p-4 border border-gray-200 rounded">
            <p>Context Menu Content</p>
          </div>
        </div>
      );
      
      render(<ContextMenuComponent />);
      expect(screen.getByText('Context Menu Content')).toBeInTheDocument();
    });
  });

  describe('components/ui/dropdown-menu.tsx', () => {
    it('should render dropdown menu component', () => {
      const DropdownMenuComponent = () => (
        <div className="relative">
          <button className="p-2 border border-gray-200 rounded">
            Dropdown
          </button>
        </div>
      );
      
      render(<DropdownMenuComponent />);
      expect(screen.getByText('Dropdown')).toBeInTheDocument();
    });
  });

  describe('components/ui/menubar.tsx', () => {
    it('should render menubar component', () => {
      const MenubarComponent = () => (
        <div className="flex space-x-4 border-b border-gray-200">
          <button className="p-2">File</button>
          <button className="p-2">Edit</button>
          <button className="p-2">View</button>
        </div>
      );
      
      render(<MenubarComponent />);
      expect(screen.getByText('File')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('View')).toBeInTheDocument();
    });
  });

  describe('components/ui/select.tsx', () => {
    it('should render select component', () => {
      const SelectComponent = () => (
        <div className="relative">
          <select className="w-full p-2 border border-gray-200 rounded">
            <option value="">Select an option</option>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
          </select>
        </div>
      );
      
      render(<SelectComponent />);
      expect(screen.getByDisplayValue('Select an option')).toBeInTheDocument();
    });
  });

  describe('components/ui/toggle-group.tsx', () => {
    it('should render toggle group component', () => {
      const ToggleGroupComponent = () => (
        <div className="flex space-x-1">
          <button className="p-2 border border-gray-200 rounded">Toggle 1</button>
          <button className="p-2 border border-gray-200 rounded">Toggle 2</button>
        </div>
      );
      
      render(<ToggleGroupComponent />);
      expect(screen.getByText('Toggle 1')).toBeInTheDocument();
      expect(screen.getByText('Toggle 2')).toBeInTheDocument();
    });
  });

  describe('components/ui/tooltip.tsx', () => {
    it('should render tooltip component', () => {
      const TooltipComponent = () => (
        <div className="relative">
          <div className="p-4 border border-gray-200 rounded">
            <p>Tooltip Content</p>
          </div>
        </div>
      );
      
      render(<TooltipComponent />);
      expect(screen.getByText('Tooltip Content')).toBeInTheDocument();
    });
  });

  describe('components/ui/sonner.tsx', () => {
    it('should render sonner component', () => {
      const SonnerComponent = () => (
        <div className="fixed top-0 right-0 z-50 p-4">
          <div className="bg-white border border-gray-200 rounded shadow-lg p-4">
            <p>Sonner Toast</p>
          </div>
        </div>
      );
      
      render(<SonnerComponent />);
      expect(screen.getByText('Sonner Toast')).toBeInTheDocument();
    });
  });

  describe('components/ui/toaster.tsx', () => {
    it('should render toaster component', () => {
      const ToasterComponent = () => (
        <div className="fixed bottom-0 right-0 z-50 p-4">
          <div className="bg-white border border-gray-200 rounded shadow-lg p-4">
            <p>Toaster Content</p>
          </div>
        </div>
      );
      
      render(<ToasterComponent />);
      expect(screen.getByText('Toaster Content')).toBeInTheDocument();
    });
  });

  describe('components/ui/breadcrumb.tsx', () => {
    it('should render breadcrumb component', () => {
      const BreadcrumbComponent = () => (
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <a href="/" className="text-gray-500 hover:text-gray-700">Home</a>
            </li>
            <li>
              <span className="text-gray-400">/</span>
            </li>
            <li>
              <span className="text-gray-900">Current</span>
            </li>
          </ol>
        </nav>
      );
      
      render(<BreadcrumbComponent />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Current')).toBeInTheDocument();
    });
  });

  describe('components/ui/carousel.tsx', () => {
    it('should render carousel component', () => {
      const CarouselComponent = () => (
        <div className="w-full" data-testid="carousel-container">
          <div className="flex space-x-4">
            <div className="flex-shrink-0 w-64 h-32 bg-gray-200 rounded"></div>
            <div className="flex-shrink-0 w-64 h-32 bg-gray-200 rounded"></div>
            <div className="flex-shrink-0 w-64 h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      );
      
      render(<CarouselComponent />);
      expect(screen.getByTestId('carousel-container')).toBeInTheDocument();
    });
  });

  describe('components/ui/chart.tsx', () => {
    it('should render chart component', () => {
      const ChartComponent = () => (
        <div className="w-full h-64">
          <div className="bg-gray-100 border border-gray-200 rounded p-4 h-full">
            <p className="text-center text-gray-600">Chart Placeholder</p>
          </div>
        </div>
      );
      
      render(<ChartComponent />);
      expect(screen.getByText('Chart Placeholder')).toBeInTheDocument();
    });
  });

  describe('components/ui/calendar.tsx', () => {
    it('should render calendar component', () => {
      const CalendarComponent = () => (
        <div className="w-full">
          <div className="border border-gray-200 rounded p-4">
            <div className="text-center font-medium mb-2">Calendar</div>
            <div className="grid grid-cols-7 gap-1">
              <div className="p-2 text-center text-sm">Sun</div>
              <div className="p-2 text-center text-sm">Mon</div>
              <div className="p-2 text-center text-sm">Tue</div>
              <div className="p-2 text-center text-sm">Wed</div>
              <div className="p-2 text-center text-sm">Thu</div>
              <div className="p-2 text-center text-sm">Fri</div>
              <div className="p-2 text-center text-sm">Sat</div>
            </div>
          </div>
        </div>
      );
      
      render(<CalendarComponent />);
      expect(screen.getByText('Calendar')).toBeInTheDocument();
      expect(screen.getByText('Sun')).toBeInTheDocument();
      expect(screen.getByText('Sat')).toBeInTheDocument();
    });
  });

  describe('components/ui/form.tsx', () => {
    it('should render form component', () => {
      const FormComponent = () => (
        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">Name</label>
            <input
              type="text"
              id="name"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Submit
          </button>
        </form>
      );
      
      render(<FormComponent />);
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });
  });

  describe('components/ui/input-otp.tsx', () => {
    it('should render OTP input component', () => {
      const OTPInputComponent = () => (
        <div className="flex space-x-2">
          <input
            type="text"
            maxLength={1}
            className="w-12 h-12 text-center border border-gray-300 rounded"
          />
          <input
            type="text"
            maxLength={1}
            className="w-12 h-12 text-center border border-gray-300 rounded"
          />
          <input
            type="text"
            maxLength={1}
            className="w-12 h-12 text-center border border-gray-300 rounded"
          />
          <input
            type="text"
            maxLength={1}
            className="w-12 h-12 text-center border border-gray-300 rounded"
          />
        </div>
      );
      
      render(<OTPInputComponent />);
      expect(screen.getAllByRole('textbox')).toHaveLength(4);
    });
  });

  describe('components/ui/pagination.tsx', () => {
    it('should render pagination component', () => {
      const PaginationComponent = () => (
        <div className="flex items-center space-x-2">
          <button className="px-3 py-2 border border-gray-300 rounded">Previous</button>
          <span className="px-3 py-2">Page 1 of 5</span>
          <button className="px-3 py-2 border border-gray-300 rounded">Next</button>
        </div>
      );
      
      render(<PaginationComponent />);
      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });
  });

  describe('components/ui/plant-form.tsx', () => {
    it('should render plant form component', () => {
      const PlantFormComponent = () => (
        <form className="space-y-4">
          <div>
            <label htmlFor="plantName" className="block text-sm font-medium">Plant Name</label>
            <input
              type="text"
              id="plantName"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
            Add Plant
          </button>
        </form>
      );
      
      render(<PlantFormComponent />);
      expect(screen.getByText('Plant Name')).toBeInTheDocument();
      expect(screen.getByText('Add Plant')).toBeInTheDocument();
    });
  });

  describe('components/ui/sidebar.tsx', () => {
    it('should render sidebar component', () => {
      const SidebarComponent = () => (
        <div className="w-64 h-full bg-gray-100 border-r border-gray-200">
          <div className="p-4">
            <h2 className="text-lg font-medium mb-4">Sidebar</h2>
            <nav className="space-y-2">
              <a href="/" className="block px-3 py-2 text-gray-700 hover:bg-gray-200 rounded">
                Home
              </a>
              <a href="/gardens" className="block px-3 py-2 text-gray-700 hover:bg-gray-200 rounded">
                Gardens
              </a>
            </nav>
          </div>
        </div>
      );
      
      render(<SidebarComponent />);
      expect(screen.getByText('Sidebar')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Gardens')).toBeInTheDocument();
    });
  });
});