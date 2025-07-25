// Comprehensive Supabase Mock Setup
export class MockSupabaseQueryBuilder {
  private mockData: any = null
  private mockError: any = null
  private mockCount: number = 0
  private chainedMethods: string[] = []

  constructor() {
    // Bind all methods to maintain 'this' context
    this.select = this.select.bind(this)
    this.insert = this.insert.bind(this)
    this.update = this.update.bind(this)
    this.delete = this.delete.bind(this)
    this.eq = this.eq.bind(this)
    this.or = this.or.bind(this)
    this.order = this.order.bind(this)
    this.range = this.range.bind(this)
    this.limit = this.limit.bind(this)
    this.single = this.single.bind(this)
  }

  // Mock data setters for test setup
  setMockData(data: any) {
    this.mockData = data
    return this
  }

  setMockError(error: any) {
    this.mockError = error
    return this
  }

  setMockCount(count: number) {
    this.mockCount = count
    return this
  }

  // Query builder methods that return 'this' for chaining
  select(columns?: string, options?: any) {
    this.chainedMethods.push('select')
    return this
  }

  insert(data: any) {
    this.chainedMethods.push('insert')
    return this
  }

  update(data: any) {
    this.chainedMethods.push('update')
    return this
  }

  delete() {
    this.chainedMethods.push('delete')
    return this
  }

  eq(column: string, value: any) {
    this.chainedMethods.push('eq')
    return this
  }

  or(condition: string) {
    this.chainedMethods.push('or')
    return this
  }

  order(column: string, options?: any) {
    this.chainedMethods.push('order')
    return this
  }

  range(from: number, to: number) {
    this.chainedMethods.push('range')
    return this
  }

  limit(count: number) {
    this.chainedMethods.push('limit')
    return this
  }

  // Terminal methods that return promises
  async single() {
    if (this.mockError) {
      return { data: null, error: this.mockError }
    }
    return { data: this.mockData, error: null }
  }

  // Default promise resolution for query chains
  then(onResolve: any, onReject?: any) {
    if (this.mockError) {
      return Promise.resolve({ data: null, error: this.mockError, count: null }).then(onResolve, onReject)
    }
    
    // Handle different query types based on chained methods
    if (this.chainedMethods.includes('select') && this.chainedMethods.includes('limit') && this.chainedMethods.length === 2) {
      // Connection validation query: select('count').limit(1)
      return Promise.resolve({ data: [{ count: 1 }], error: null, count: null }).then(onResolve, onReject)
    }
    
    if (this.chainedMethods.includes('insert')) {
      return Promise.resolve({ data: this.mockData, error: null, count: null }).then(onResolve, onReject)
    }
    
    if (this.chainedMethods.includes('update')) {
      return Promise.resolve({ data: this.mockData, error: null, count: null }).then(onResolve, onReject)
    }
    
    if (this.chainedMethods.includes('delete')) {
      return Promise.resolve({ data: null, error: null, count: null }).then(onResolve, onReject)
    }
    
    // Default select query with count
    return Promise.resolve({ 
      data: this.mockData || [], 
      error: null, 
      count: this.mockCount 
    }).then(onResolve, onReject)
  }

  // Reset method for test cleanup
  reset() {
    this.mockData = null
    this.mockError = null
    this.mockCount = 0
    this.chainedMethods = []
  }
}

// Create mock instances
export const createMockSupabase = () => {
  const mockQueryBuilder = new MockSupabaseQueryBuilder()
  
  return {
    from: jest.fn(() => mockQueryBuilder),
    mockQueryBuilder, // Expose for direct manipulation in tests
  }
}

// Global mock setup
export const setupSupabaseMocks = () => {
  const mockSupabase = createMockSupabase()
  
  jest.mock('@/lib/supabase', () => ({
    supabase: mockSupabase,
  }))
  
  return mockSupabase
}

// Helper functions for test setup
export const setupMockSuccess = (data: any, count?: number) => {
  mockQueryBuilder.reset()
  mockQueryBuilder.setMockData(data)
  if (count !== undefined) {
    mockQueryBuilder.setMockCount(count)
  }
}

export const setupMockError = (error: any) => {
  mockQueryBuilder.reset()
  mockQueryBuilder.setMockError(error)
}

// Test data helpers
export const createMockGarden = (overrides: any = {}) => ({
  id: '1',
  name: 'Test Garden',
  location: 'Test Location',
  description: 'A beautiful test garden',
  total_area: '100m²',
  garden_type: 'vegetable',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides
})

export const createMockGardens = (count: number = 3) => {
  return Array.from({ length: count }, (_, i) => 
    createMockGarden({ 
      id: (i + 1).toString(), 
      name: `Test Garden ${i + 1}` 
    })
  )
}