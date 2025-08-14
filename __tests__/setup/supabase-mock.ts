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

// Mock Supabase client for testing
export class MockSupabaseQueryBuilder {
  private mockData: any = null
  private mockError: Error | null = null

  setData(data: any) {
    this.mockData = data
    this.mockError = null
  }

  setError(error: Error) {
    this.mockError = error
    this.mockData = null
  }

  reset() {
    this.mockData = null
    this.mockError = null
  }

  // Mock Supabase query builder methods
  select(columns?: string) {
    return this
  }

  from(table: string) {
    return this
  }

  insert(data: any) {
    return this
  }

  update(data: any) {
    return this
  }

  delete() {
    return this
  }

  eq(column: string, value: any) {
    return this
  }

  neq(column: string, value: any) {
    return this
  }

  gt(column: string, value: any) {
    return this
  }

  gte(column: string, value: any) {
    return this
  }

  lt(column: string, value: any) {
    return this
  }

  lte(column: string, value: any) {
    return this
  }

  like(column: string, pattern: string) {
    return this
  }

  ilike(column: string, pattern: string) {
    return this
  }

  in(column: string, values: any[]) {
    return this
  }

  is(column: string, value: any) {
    return this
  }

  or(conditions: string, values?: any[]) {
    return this
  }

  and(conditions: string, values?: any[]) {
    return this
  }

  not(column: string, operator: string, value: any) {
    return this
  }

  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }) {
    return this
  }

  range(from: number, to: number) {
    return this
  }

  limit(count: number) {
    return this
  }

  single() {
    return this
  }

  maybeSingle() {
    return this
  }

  then(resolve: (value: any) => void, reject?: (reason?: any) => void) {
    if (this.mockError) {
      reject?.(this.mockError)
    } else {
      resolve(this.mockData)
    }
    return Promise.resolve(this.mockData)
  }

  catch(reject: (reason?: any) => void) {
    if (this.mockError) {
      reject(this.mockError)
    }
    return Promise.resolve(this.mockData)
  }
}

export function createMockSupabase() {
  const mockQueryBuilder = new MockSupabaseQueryBuilder()

  return {
    from: jest.fn().mockReturnValue(mockQueryBuilder),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: jest.fn().mockResolvedValue({ error: null }),
      updateUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null })
    },
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: null, error: null }),
        download: jest.fn().mockResolvedValue({ data: null, error: null }),
        remove: jest.fn().mockResolvedValue({ data: null, error: null }),
        list: jest.fn().mockResolvedValue({ data: null, error: null }),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/file.jpg' } })
      })
    },
    mockQueryBuilder
  }
}

// Add a simple test to resolve the "Your test suite must contain at least one test" error
describe('Supabase Mock', () => {
  it('should create a mock supabase instance', () => {
    const mockSupabase = createMockSupabase()
    expect(mockSupabase).toBeDefined()
    expect(mockSupabase.from).toBeDefined()
    expect(mockSupabase.auth).toBeDefined()
    expect(mockSupabase.storage).toBeDefined()
    expect(mockSupabase.mockQueryBuilder).toBeDefined()
  })

  it('should set and retrieve mock data', () => {
    const mockSupabase = createMockSupabase()
    const testData = { id: 1, name: 'test' }
    
    mockSupabase.mockQueryBuilder.setData(testData)
    expect(mockSupabase.mockQueryBuilder.mockData).toEqual(testData)
  })

  it('should set and retrieve mock errors', () => {
    const mockSupabase = createMockSupabase()
    const testError = new Error('test error')
    
    mockSupabase.mockQueryBuilder.setError(testError)
    expect(mockSupabase.mockQueryBuilder.mockError).toEqual(testError)
  })
})