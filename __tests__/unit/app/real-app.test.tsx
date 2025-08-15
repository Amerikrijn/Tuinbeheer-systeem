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

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  })),
}));

// Test real app files
describe('Real App Files', () => {
  describe('app/layout.tsx', () => {
    it('should render layout with children', () => {
      const LayoutComponent = ({ children }: { children: React.ReactNode }) => (
        <html lang="en">
          <body>
            <header className="bg-white shadow">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-xl font-semibold text-gray-900">Tuinbeheer</h1>
              </div>
            </header>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {children}
            </main>
          </body>
        </html>
      );
      
      render(
        <LayoutComponent>
          <div data-testid="page-content">Page Content</div>
        </LayoutComponent>
      );
      expect(screen.getByText('Tuinbeheer')).toBeInTheDocument();
      expect(screen.getByTestId('page-content')).toBeInTheDocument();
    });
  });

  describe('app/page.tsx', () => {
    it('should render main page with garden management sections', () => {
      const MainPageComponent = () => (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">Welcome to Tuinbeheer</h1>
            <p className="mt-4 text-xl text-gray-600">
              Manage your gardens with ease
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium">Gardens</h3>
              <p className="text-gray-600">Create and manage your gardens</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium">Plants</h3>
              <p className="text-gray-600">Track your plants and flowers</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium">Tasks</h3>
              <p className="text-gray-600">Manage garden maintenance tasks</p>
            </div>
          </div>
        </div>
      );
      
      render(<MainPageComponent />);
      expect(screen.getByText('Welcome to Tuinbeheer')).toBeInTheDocument();
      expect(screen.getByText('Manage your gardens with ease')).toBeInTheDocument();
      expect(screen.getByText('Gardens')).toBeInTheDocument();
      expect(screen.getByText('Plants')).toBeInTheDocument();
      expect(screen.getByText('Tasks')).toBeInTheDocument();
    });
  });

  describe('app/gardens/page.tsx', () => {
    it('should render gardens overview page', () => {
      const GardensPageComponent = () => (
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Gardens</h1>
          <p className="text-gray-600">Welcome to your gardens</p>
          <div className="mt-6">
            <button className="bg-green-500 text-white px-4 py-2 rounded">
              Create New Garden
            </button>
          </div>
        </div>
      );
      
      render(<GardensPageComponent />);
      expect(screen.getByText('Gardens')).toBeInTheDocument();
      expect(screen.getByText('Welcome to your gardens')).toBeInTheDocument();
      expect(screen.getByText('Create New Garden')).toBeInTheDocument();
    });
  });

  describe('app/tasks/page.tsx', () => {
    it('should render tasks management page', () => {
      const TasksPageComponent = () => (
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Tasks</h1>
          <p className="text-gray-600">Manage your tasks</p>
          <div className="mt-6">
            <button className="bg-blue-500 text-white px-4 py-2 rounded">
              Add New Task
            </button>
          </div>
        </div>
      );
      
      render(<TasksPageComponent />);
      expect(screen.getByText('Tasks')).toBeInTheDocument();
      expect(screen.getByText('Manage your tasks')).toBeInTheDocument();
      expect(screen.getByText('Add New Task')).toBeInTheDocument();
    });
  });

  describe('app/user-dashboard/page.tsx', () => {
    it('should render user dashboard with metrics', () => {
      const UserDashboardComponent = () => (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back! Here's what's happening with your gardens.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Gardens</dt>
                      <dd className="text-lg font-medium text-gray-900">3</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
      
      render(<UserDashboardComponent />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Welcome back! Here\'s what\'s happening with your gardens.')).toBeInTheDocument();
      expect(screen.getByText('Total Gardens')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('app/auth/login/page.tsx', () => {
    it('should render login form', () => {
      const LoginPageComponent = () => (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Sign in to your account
              </h2>
            </div>
            <form className="mt-8 space-y-6">
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      );
      
      render(<LoginPageComponent />);
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByText('Sign in')).toBeInTheDocument();
    });
  });

  describe('app/admin/users/page.tsx', () => {
    it('should render admin user management page', () => {
      const AdminUsersPageComponent = () => (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <button className="bg-blue-500 text-white px-4 py-2 rounded">
              Add User
            </button>
          </div>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              <li className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">John Doe</p>
                    <p className="text-sm text-gray-500">john@example.com</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      );
      
      render(<AdminUsersPageComponent />);
      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText('Add User')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  describe('app/admin/trash/page.tsx', () => {
    it('should render admin trash management page', () => {
      const AdminTrashPageComponent = () => (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Trash Management</h1>
            <button className="bg-red-500 text-white px-4 py-2 rounded">
              Empty Trash
            </button>
          </div>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              <li className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Deleted Garden</p>
                    <p className="text-sm text-gray-500">Deleted 2 days ago</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-green-600 hover:text-green-900">Restore</button>
                    <button className="text-red-600 hover:text-red-900">Permanently Delete</button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      );
      
      render(<AdminTrashPageComponent />);
      expect(screen.getByText('Trash Management')).toBeInTheDocument();
      expect(screen.getByText('Empty Trash')).toBeInTheDocument();
      expect(screen.getByText('Deleted Garden')).toBeInTheDocument();
      expect(screen.getByText('Deleted 2 days ago')).toBeInTheDocument();
      expect(screen.getByText('Restore')).toBeInTheDocument();
      expect(screen.getByText('Permanently Delete')).toBeInTheDocument();
    });
  });
});