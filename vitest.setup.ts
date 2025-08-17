import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock React for JSX
global.React = require('react');

// Mock jest functions
global.jest = {
  fn: vi.fn,
  clearAllMocks: vi.clearAllMocks,
  restoreAllMocks: vi.restoreAllMocks,
  spyOn: vi.spyOn,
  mock: vi.mock,
  unmock: vi.unmock,
  doMock: vi.doMock,
  dontMock: vi.dontMock,
  resetModules: vi.resetModules,
  isolateModules: vi.isolateModules,
  mockImplementation: vi.mockImplementation,
  mockReturnValue: vi.mockReturnValue,
  mockReturnValueOnce: vi.mockReturnValueOnce,
  mockResolvedValue: vi.mockResolvedValue,
  mockResolvedValueOnce: vi.mockResolvedValueOnce,
  mockRejectedValue: vi.mockRejectedValue,
  mockRejectedValueOnce: vi.mockRejectedValueOnce,
};
