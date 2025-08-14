// Mock data for testing
export const mockGardenData = {
  id: '1',
  name: 'Test Garden',
  description: 'A beautiful test garden',
  location: 'Test Location',
  garden_type: 'vegetable',
  total_area: '100m²',
  season_year: 2024,
  is_active: true,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
}

export const mockGardensArray = [
  mockGardenData,
  {
    id: '2',
    name: 'Second Garden',
    description: 'Another test garden',
    location: 'Second Location',
    garden_type: 'flower',
    total_area: '200m²',
    season_year: 2024,
    is_active: true,
    created_at: '2023-01-02T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z'
  }
]

// Mock Supabase Query Builder
export class MockSupabaseQueryBuilder {
  private mockData: unknown = null
  private mockError: unknown = null
  public countValue: number = 0

  // Chainable methods
  select(fields?: string) {
    return this
  }

  insert(data: unknown) {
    return this
  }

  update(data: unknown) {
    return this
  }

  delete() {
    return this
  }

  eq(field: string, value: unknown) {
    return this
  }

  order(field: string, direction?: { ascending: boolean }) {
    return this
  }

  range(from: number, to: number) {
    return this
  }

  or(condition: string) {
    return this
  }

  single() {
    return this
  }

  // Mock response methods
  setData(data: unknown) {
    this.mockData = data
    this.mockError = null
  }

  setError(error: unknown) {
    this.mockError = error
    this.mockData = null
  }

  // Mock the actual response - this is what the service will call
  async then(resolve: (value: unknown) => void, reject?: (reason?: unknown) => void) {
    if (this.mockError) {
      reject?.(this.mockError)
      return Promise.reject(this.mockError)
    }
    
    // Return the standard Supabase response format with count
    const response = { 
      data: this.mockData, 
      error: null, 
      count: this.countValue 
    }
    resolve(response)
    return Promise.resolve(response)
  }

  // Reset mock state
  reset() {
    this.mockData = null
    this.mockError = null
    this.countValue = 0
  }
}

// Create a mock Supabase instance
export function createMockSupabase() {
  const mockQueryBuilder = new MockSupabaseQueryBuilder()

  return {
    from: jest.fn(() => mockQueryBuilder),
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signOut: jest.fn(() => Promise.resolve({ error: null }))
    },
    mockQueryBuilder // Expose for test control
  }
}

// Export a default instance for convenience
export const mockSupabase = createMockSupabase()