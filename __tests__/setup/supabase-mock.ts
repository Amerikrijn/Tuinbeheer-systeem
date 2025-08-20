// Mock data for testing
export const mockGardenData = {
  id: '1',
  name: 'Test Garden',
  description: 'A beautiful test garden',
  location: 'Test Location',
  garden_type: 'vegetable',
  total_area: '100m²',
  length: '10m',
  width: '10m',
  established_date: '2023-01-01',
  season_year: 2024,
  notes: 'Test garden notes',
  is_active: true,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  canvas_width: 800,
  canvas_height: 600,
  grid_size: 20,
  default_zoom: 1,
  show_grid: true,
  snap_to_grid: true,
  background_color: '#f0f0f0'
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
    length: '20m',
    width: '10m',
    established_date: '2023-01-02',
    season_year: 2024,
    notes: 'Second garden notes',
    is_active: true,
    created_at: '2023-01-02T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
    canvas_width: 1000,
    canvas_height: 800,
    grid_size: 25,
    default_zoom: 1,
    show_grid: true,
    snap_to_grid: false,
    background_color: '#e0e0e0'
  }
]

// Mock Supabase Query Builder
export class MockSupabaseQueryBuilder {
  private chainedMethods: string[] = []
  private queryData: any = {}
  private shouldError = false
  private errorData: any = null
  private returnData: any = null
  public countValue: number | null = null

  constructor() {
    this.reset()
  }

  reset() {
    this.chainedMethods = []
    this.queryData = {}
    this.shouldError = false
    this.errorData = null
    this.returnData = null
    this.countValue = null
    return this
  }

  from(table: string) {
    this.chainedMethods.push('from')
    this.queryData.table = table
    return this
  }

  select(columns?: string, options?: any) {
    this.chainedMethods.push('select')
    this.queryData.columns = columns
    this.queryData.selectOptions = options
    
    // Handle count queries specifically
    if (columns === 'count') {
      this.countValue = 1 // For connection validation
      this.returnData = { count: 1 }
    } else if (options?.count === 'exact') {
      this.countValue = this.shouldError ? null : (this.returnData ? (Array.isArray(this.returnData) ? this.returnData.length : 1) : mockGardensArray.length)
      if (!this.returnData) {
        this.returnData = mockGardensArray
      }
    } else {
      // For regular select queries, return the data directly
      if (!this.returnData) {
        this.returnData = mockGardensArray
      }
    }
    
    return this
  }

  insert(data: any) {
    this.chainedMethods.push('insert')
    this.queryData.insertData = data
    
    if (!this.shouldError && !this.returnData) {
      // Return the inserted data with an ID
      if (Array.isArray(data)) {
        this.returnData = data.map((item, index) => ({
          ...item,
          id: `new-${index + 1}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
      } else {
        this.returnData = {
          ...data,
          id: 'new-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    }
    
    return this
  }

  update(data: any) {
    this.chainedMethods.push('update')
    this.queryData.updateData = data
    return this
  }

  delete() {
    this.chainedMethods.push('delete')
    return this
  }

  eq(field: string, value: any) {
    this.chainedMethods.push('eq')
    this.queryData.filters = this.queryData.filters || {}
    this.queryData.filters[field] = value
    return this
  }

  neq(field: string, value: any) {
    this.chainedMethods.push('neq')
    this.queryData.filters = this.queryData.filters || {}
    this.queryData.filters[`${field}_neq`] = value
    return this
  }

  gt(field: string, value: any) {
    this.chainedMethods.push('gt')
    this.queryData.filters = this.queryData.filters || {}
    this.queryData.filters[`${field}_gt`] = value
    return this
  }

  gte(field: string, value: any) {
    this.chainedMethods.push('gte')
    this.queryData.filters = this.queryData.filters || {}
    this.queryData.filters[`${field}_gte`] = value
    return this
  }

  lt(field: string, value: any) {
    this.chainedMethods.push('lt')
    this.queryData.filters = this.queryData.filters || {}
    this.queryData.filters[`${field}_lt`] = value
    return this
  }

  lte(field: string, value: any) {
    this.chainedMethods.push('lte')
    this.queryData.filters = this.queryData.filters || {}
    this.queryData.filters[`${field}_lte`] = value
    return this
  }

  like(field: string, value: any) {
    this.chainedMethods.push('like')
    this.queryData.filters = this.queryData.filters || {}
    this.queryData.filters[`${field}_like`] = value
    return this
  }

  ilike(field: string, value: any) {
    this.chainedMethods.push('ilike')
    this.queryData.filters = this.queryData.filters || {}
    this.queryData.filters[`${field}_ilike`] = value
    return this
  }

  in(field: string, values: any[]) {
    this.chainedMethods.push('in')
    this.queryData.filters = this.queryData.filters || {}
    this.queryData.filters[`${field}_in`] = values
    return this
  }

  or(condition: string) {
    this.chainedMethods.push('or')
    this.queryData.orCondition = condition
    return this
  }

  and(condition: string) {
    this.chainedMethods.push('and')
    this.queryData.andCondition = condition
    return this
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.chainedMethods.push('order')
    this.queryData.orderBy = { field, ascending: options?.ascending ?? false }
    return this
  }

  limit(count: number) {
    this.chainedMethods.push('limit')
    this.queryData.limit = count
    return this
  }

  range(from: number, to: number) {
    this.chainedMethods.push('range')
    this.queryData.range = { from, to }
    return this
  }

  single() {
    this.chainedMethods.push('single')
    if (Array.isArray(this.returnData)) {
      this.returnData = this.returnData[0] || null
    }
    return this
  }

  then(onResolve?: (value: any) => any, onReject?: (reason: any) => any) {
    return new Promise((resolve, reject) => {
      if (this.shouldError) {
        const result = { 
          data: null, 
          error: this.errorData,
          count: null
        }
        resolve(result)
      } else {
        let result: any = {
          data: this.returnData,
          error: null
        }

        // Add count for select operations with count option
        if (this.queryData.selectOptions?.count === 'exact') {
          result.count = this.countValue !== null ? this.countValue : (Array.isArray(this.returnData) ? this.returnData.length : 1)
        }

        // Handle connection validation case
        if (this.queryData.columns === 'count' && this.queryData.limit === 1) {
          result = { 
            data: null, 
            error: null,
            count: 1
          }
        }

        // Handle the specific case for TuinService.getAll
        if (this.queryData.columns === '*' && this.queryData.selectOptions?.count === 'exact') {
          result.count = this.countValue !== null ? this.countValue : (Array.isArray(this.returnData) ? this.returnData.length : 0)
        }

        resolve(result)
      }
    })
  }

  catch(onReject: (reason: any) => any) {
    return this.then(undefined, onReject)
  }

  // Helper methods for test setup
  mockError(error: any) {
    this.shouldError = true
    this.errorData = error
    return this
  }

  mockSuccess(data?: any) {
    this.shouldError = false
    this.errorData = null
    if (data !== undefined) {
      this.returnData = data
    }
    return this
  }

  mockEmpty() {
    this.shouldError = false
    this.errorData = null
    this.returnData = []
    this.countValue = 0
    return this
  }
}

// Factory function to create fresh mock instances
export function createMockSupabase() {
  const mockQueryBuilder = new MockSupabaseQueryBuilder()
  
  return {
    from: jest.fn().mockReturnValue(mockQueryBuilder),
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null
      })
    },
    rpc: jest.fn().mockResolvedValue({ error: null }),
    mockQueryBuilder
  }
}

// Mock the supabase module
jest.mock('@/lib/supabase', () => {
  const { createMockSupabase } = require('@/__tests__/setup/supabase-mock')
  return {
    getSupabaseClient: jest.fn(() => createMockSupabase()),
  }
})

// Helper functions for common test setups
export function setupMockSuccess(mockSupabase: any, data?: any) {
  mockSupabase.mockQueryBuilder.mockSuccess(data)
  return mockSupabase
}

export function setupMockError(mockSupabase: any, error: any) {
  mockSupabase.mockQueryBuilder.mockError(error)
  return mockSupabase
}

export function setupMockEmpty(mockSupabase: any) {
  mockSupabase.mockQueryBuilder.mockEmpty()
  return mockSupabase
}

// This is just a utility file, but Jest requires at least one test
// Adding a dummy test to prevent Jest from failing
describe('Supabase Mock Setup', () => {
  it('should export mock utilities', () => {
    expect(createMockSupabase).toBeDefined()
    expect(MockSupabaseQueryBuilder).toBeDefined()
    expect(mockGardenData).toBeDefined()
    expect(mockGardensArray).toBeDefined()
  })
})