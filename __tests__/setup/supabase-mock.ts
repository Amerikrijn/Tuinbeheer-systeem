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

  reset() {
    this.mockData = null
    this.mockError = null
    this.mockCount = 0
    this.chainedMethods = []
  }

  // Query builder methods that return 'this' for chaining
  select(columns?: string, options?: any) {
    this.chainedMethods.push(`select(${columns || '*'})`)
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
    this.chainedMethods.push(`eq(${column}, ${value})`)
    return this
  }

  or(filter: string) {
    this.chainedMethods.push(`or(${filter})`)
    return this
  }

  order(column: string, options?: any) {
    this.chainedMethods.push(`order(${column})`)
    return this
  }

  range(from: number, to: number) {
    this.chainedMethods.push(`range(${from}, ${to})`)
    return this
  }

  limit(count: number) {
    this.chainedMethods.push(`limit(${count})`)
    
    // For connection validation (select('count').limit(1))
    if (this.chainedMethods.includes('select(count)') && count === 1) {
      return Promise.resolve({ 
        data: null, 
        error: this.mockError,
        count: null 
      })
    }
    
    return this
  }

  // Terminal methods that return promises
  async single() {
    return Promise.resolve({
      data: this.mockData,
      error: this.mockError,
      count: null
    })
  }

  // This is called at the end of query chains for data fetching
  then(onResolve: Function, onReject?: Function) {
    const result = {
      data: this.mockData,
      error: this.mockError,
      count: this.mockCount
    }
    
    if (onResolve) {
      return onResolve(result)
    }
    
    return Promise.resolve(result)
  }

  // Make it thenable so it can be awaited
  catch(onReject: Function) {
    return Promise.resolve({
      data: this.mockData,
      error: this.mockError,
      count: this.mockCount
    }).catch(onReject)
  }

  // Helper method to check what methods were called
  getChainedMethods() {
    return this.chainedMethods
  }
}

// Create mock instances
export const createMockSupabase = () => {
  const queryBuilder = new MockSupabaseQueryBuilder()
  
  return {
    from: jest.fn(() => queryBuilder),
    queryBuilder // Expose for direct manipulation in tests
  }
}