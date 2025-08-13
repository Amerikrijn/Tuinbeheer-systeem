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
    
    if (!this.shouldError && !this.returnData) {
      this.returnData = { ...mockGardenData, ...data }
    }
    
    return this
  }

  delete() {
    this.chainedMethods.push('delete')
    
    if (!this.shouldError && !this.returnData) {
      this.returnData = mockGardenData
    }
    
    return this
  }

  eq(column: string, value: any) {
    this.chainedMethods.push('eq')
    this.queryData.eq = { column, value }
    return this
  }

  or(conditions: string) {
    this.chainedMethods.push('or')
    this.queryData.or = conditions
    return this
  }

  order(column: string, options?: any) {
    this.chainedMethods.push('order')
    this.queryData.order = { column, options }
    return this
  }

  range(from: number, to: number) {
    this.chainedMethods.push('range')
    this.queryData.range = { from, to }
    
    // Apply range to return data if it's an array
    if (Array.isArray(this.returnData)) {
      this.returnData = this.returnData.slice(from, to + 1)
    }
    
    return this
  }

  limit(count: number) {
    this.chainedMethods.push('limit')
    this.queryData.limit = count
    
    // Handle connection validation case: select('count').limit(1)
    if (this.queryData.columns === 'count' && count === 1) {
      // Return immediately for connection validation
      return Promise.resolve({ 
        data: null, 
        error: this.shouldError ? this.errorData : null,
        count: this.shouldError ? null : 1
      })
    }
    
    return this
  }

  single() {
    this.chainedMethods.push('single')
    
    return Promise.resolve({
      data: this.shouldError ? null : (Array.isArray(this.returnData) ? this.returnData[0] : this.returnData),
      error: this.shouldError ? this.errorData : null
    })
  }

  then(onResolve?: (value: any) => any, onReject?: (reason: any) => any) {
    return new Promise((resolve, reject) => {
      if (this.shouldError) {
        const result = { 
          data: null, 
          error: this.errorData,
          count: null
        }
        if (onReject) {
          resolve(onReject(result))
        } else {
          resolve(result)
        }
      } else {
        let result: any = {
          data: this.returnData,
          error: null
        }

        // Add count for select operations with count option
        if (this.chainedMethods.includes('select') && this.queryData.selectOptions?.count === 'exact') {
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

        if (onResolve) {
          resolve(onResolve(result))
        } else {
          resolve(result)
        }
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
    mockQueryBuilder
  }
}

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