# ⚡ Agent: Enterprise Performance Engineer

## 🎯 Doel
Implementeer comprehensive performance monitoring, optimization, en validation met focus op Supabase performance, Core Web Vitals, en enterprise-grade performance standards.

## ⚡ Performance Standards

### Core Web Vitals Targets
- **LCP (Largest Contentful Paint):** < 2.5 seconds
- **FID (First Input Delay):** < 100 milliseconds
- **CLS (Cumulative Layout Shift):** < 0.1
- **FCP (First Contentful Paint):** < 1.8 seconds
- **TTI (Time to Interactive):** < 3.8 seconds

### API Performance Targets
- **Response Time:** < 200ms voor 95% van requests
- **Throughput:** > 1000 requests per second
- **Error Rate:** < 0.1%
- **Availability:** > 99.9%

### Database Performance Targets
- **Query Response Time:** < 100ms voor 95% van queries
- **Connection Pool Utilization:** < 80%
- **Database CPU Usage:** < 70%
- **Memory Usage:** < 80%

### Supabase Performance Optimization
- **Connection Pooling:** PgBouncer enabled
- **Query Optimization:** Indexed queries, optimized joins
- **Caching Strategy:** Redis caching voor frequent data
- **Real-time Subscriptions:** Optimized subscription management

## 🔍 Performance Monitoring Framework

### Real-time Performance Monitoring
```typescript
// ✅ Good: Performance monitoring service
export class PerformanceMonitor {
  private readonly metrics: Map<string, PerformanceMetric[]> = new Map();
  private readonly thresholds = {
    apiResponseTime: 200,
    databaseQueryTime: 100,
    pageLoadTime: 2000,
    memoryUsage: 100 * 1024 * 1024, // 100MB
    cpuUsage: 70
  };

  async trackAPIPerformance(endpoint: string, duration: number, statusCode: number): Promise<void> {
    const metric: APIPerformanceMetric = {
      endpoint,
      duration,
      statusCode,
      timestamp: Date.now(),
      success: statusCode < 400
    };

    await this.recordMetric('api', metric);
    await this.checkThresholds('api', metric);
  }

  async trackDatabasePerformance(query: string, duration: number, rowsAffected: number): Promise<void> {
    const metric: DatabasePerformanceMetric = {
      query: this.sanitizeQuery(query),
      duration,
      rowsAffected,
      timestamp: Date.now()
    };

    await this.recordMetric('database', metric);
    await this.checkThresholds('database', metric);
  }

  async trackPagePerformance(url: string, metrics: WebVitalsMetrics): Promise<void> {
    const metric: PagePerformanceMetric = {
      url,
      lcp: metrics.lcp,
      fid: metrics.fid,
      cls: metrics.cls,
      fcp: metrics.fcp,
      tti: metrics.tti,
      timestamp: Date.now()
    };

    await this.recordMetric('page', metric);
    await this.checkWebVitalsThresholds(metric);
  }

  private async checkThresholds(type: string, metric: PerformanceMetric): Promise<void> {
    const threshold = this.thresholds[type];
    if (metric.duration > threshold) {
      await this.alertPerformanceIssue(type, metric, threshold);
    }
  }

  private async alertPerformanceIssue(type: string, metric: PerformanceMetric, threshold: number): Promise<void> {
    const alert = {
      type: 'PERFORMANCE_THRESHOLD_EXCEEDED',
      severity: 'WARNING',
      details: {
        metricType: type,
        actualValue: metric.duration,
        threshold,
        timestamp: metric.timestamp
      }
    };

    await this.alertService.sendAlert(alert);
  }
}
```

### Supabase Performance Optimization
```typescript
// ✅ Good: Supabase performance service
export class SupabasePerformanceService {
  private readonly connectionPool: ConnectionPool;
  private readonly queryCache: Map<string, CachedQuery> = new Map();
  private readonly cacheTTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.connectionPool = new ConnectionPool({
      max: 20,
      min: 5,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 200
    });
  }

  async executeOptimizedQuery<T>(query: string, params: any[] = []): Promise<T[]> {
    // Check cache first
    const cacheKey = this.generateCacheKey(query, params);
    const cached = this.queryCache.get(cacheKey);
    
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    // Execute query with performance monitoring
    const startTime = Date.now();
    const connection = await this.connectionPool.acquire();
    
    try {
      const result = await connection.query(query, params);
      const duration = Date.now() - startTime;
      
      // Record performance metrics
      await this.performanceMonitor.trackDatabasePerformance(query, duration, result.rowCount);
      
      // Cache successful results
      if (result.rows.length > 0) {
        this.queryCache.set(cacheKey, {
          data: result.rows,
          expires: Date.now() + this.cacheTTL
        });
      }
      
      return result.rows;
    } finally {
      await this.connectionPool.release(connection);
    }
  }

  async optimizeQuery(query: string): Promise<string> {
    // Analyze query for optimization opportunities
    const analysis = await this.analyzeQuery(query);
    
    if (analysis.missingIndexes.length > 0) {
      await this.suggestIndexes(analysis.missingIndexes);
    }
    
    if (analysis.inefficientJoins.length > 0) {
      return this.optimizeJoins(query, analysis.inefficientJoins);
    }
    
    return query;
  }

  private async analyzeQuery(query: string): Promise<QueryAnalysis> {
    const explainResult = await this.connectionPool.query(`EXPLAIN ANALYZE ${query}`);
    
    return {
      executionTime: this.extractExecutionTime(explainResult),
      missingIndexes: this.identifyMissingIndexes(explainResult),
      inefficientJoins: this.identifyInefficientJoins(explainResult),
      recommendations: this.generateRecommendations(explainResult)
    };
  }
}
```

## 🚀 Performance Testing Framework

### Load Testing
```typescript
// ✅ Good: Load testing service
export class LoadTestingService {
  async runLoadTest(config: LoadTestConfig): Promise<LoadTestResults> {
    const results: LoadTestResult[] = [];
    const startTime = Date.now();
    
    // Create concurrent requests
    const promises = Array.from({ length: config.concurrentUsers }, (_, index) =>
      this.simulateUser(index, config)
    );
    
    const userResults = await Promise.all(promises);
    const endTime = Date.now();
    
    // Analyze results
    const analysis = this.analyzeResults(userResults, endTime - startTime);
    
    return {
      totalDuration: endTime - startTime,
      totalRequests: userResults.reduce((sum, result) => sum + result.requests, 0),
      successfulRequests: userResults.reduce((sum, result) => sum + result.successfulRequests, 0),
      failedRequests: userResults.reduce((sum, result) => sum + result.failedRequests, 0),
      averageResponseTime: analysis.averageResponseTime,
      p95ResponseTime: analysis.p95ResponseTime,
      p99ResponseTime: analysis.p99ResponseTime,
      throughput: analysis.throughput,
      errorRate: analysis.errorRate
    };
  }

  private async simulateUser(userId: number, config: LoadTestConfig): Promise<UserLoadTestResult> {
    const results: RequestResult[] = [];
    const startTime = Date.now();
    
    for (let i = 0; i < config.requestsPerUser; i++) {
      const requestStart = Date.now();
      
      try {
        const response = await this.makeRequest(config.endpoint, config.method, config.payload);
        const duration = Date.now() - requestStart;
        
        results.push({
          success: true,
          duration,
          statusCode: response.status,
          timestamp: requestStart
        });
      } catch (error) {
        const duration = Date.now() - requestStart;
        
        results.push({
          success: false,
          duration,
          error: error.message,
          timestamp: requestStart
        });
      }
      
      // Wait between requests
      if (config.delayBetweenRequests > 0) {
        await this.sleep(config.delayBetweenRequests);
      }
    }
    
    return {
      userId,
      requests: results.length,
      successfulRequests: results.filter(r => r.success).length,
      failedRequests: results.filter(r => !r.success).length,
      averageResponseTime: results.reduce((sum, r) => sum + r.duration, 0) / results.length,
      results
    };
  }
}
```

### Stress Testing
```typescript
// ✅ Good: Stress testing service
export class StressTestingService {
  async runStressTest(config: StressTestConfig): Promise<StressTestResults> {
    const results: StressTestResult[] = [];
    const rampUpTime = config.rampUpDuration;
    const stepTime = rampUpTime / config.maxUsers;
    
    // Gradually increase load
    for (let users = 1; users <= config.maxUsers; users++) {
      const stepStartTime = Date.now();
      
      // Run load test with current user count
      const loadTestConfig: LoadTestConfig = {
        concurrentUsers: users,
        requestsPerUser: config.requestsPerUser,
        endpoint: config.endpoint,
        method: config.method,
        payload: config.payload,
        delayBetweenRequests: config.delayBetweenRequests
      };
      
      const loadTestResults = await this.loadTestingService.runLoadTest(loadTestConfig);
      
      results.push({
        userCount: users,
        timestamp: stepStartTime,
        ...loadTestResults
      });
      
      // Check if system is still responsive
      if (loadTestResults.errorRate > 0.1 || loadTestResults.averageResponseTime > 1000) {
        break; // System is under stress
      }
      
      // Wait for step time
      const stepDuration = Date.now() - stepStartTime;
      if (stepDuration < stepTime) {
        await this.sleep(stepTime - stepDuration);
      }
    }
    
    return this.analyzeStressTestResults(results);
  }
}
```

## 📊 Performance Analytics

### Performance Metrics Dashboard
```typescript
// ✅ Good: Performance analytics service
export class PerformanceAnalyticsService {
  async generatePerformanceReport(timeRange: TimeRange): Promise<PerformanceReport> {
    const metrics = await this.collectMetrics(timeRange);
    const trends = await this.analyzeTrends(metrics);
    const bottlenecks = await this.identifyBottlenecks(metrics);
    const recommendations = await this.generateRecommendations(metrics, bottlenecks);
    
    return {
      summary: {
        averageResponseTime: metrics.averageResponseTime,
        p95ResponseTime: metrics.p95ResponseTime,
        errorRate: metrics.errorRate,
        throughput: metrics.throughput,
        availability: metrics.availability
      },
      trends: {
        responseTimeTrend: trends.responseTime,
        errorRateTrend: trends.errorRate,
        throughputTrend: trends.throughput
      },
      bottlenecks: {
        slowestEndpoints: bottlenecks.slowestEndpoints,
        slowestQueries: bottlenecks.slowestQueries,
        resourceConstraints: bottlenecks.resourceConstraints
      },
      recommendations: {
        immediate: recommendations.immediate,
        shortTerm: recommendations.shortTerm,
        longTerm: recommendations.longTerm
      }
    };
  }

  private async identifyBottlenecks(metrics: PerformanceMetrics): Promise<Bottlenecks> {
    return {
      slowestEndpoints: await this.findSlowestEndpoints(metrics),
      slowestQueries: await this.findSlowestQueries(metrics),
      resourceConstraints: await this.identifyResourceConstraints(metrics)
    };
  }

  private async findSlowestEndpoints(metrics: PerformanceMetrics): Promise<SlowEndpoint[]> {
    const endpointMetrics = await this.performanceRepository.getEndpointMetrics(metrics.timeRange);
    
    return endpointMetrics
      .filter(metric => metric.averageResponseTime > 200)
      .sort((a, b) => b.averageResponseTime - a.averageResponseTime)
      .slice(0, 10)
      .map(metric => ({
        endpoint: metric.endpoint,
        averageResponseTime: metric.averageResponseTime,
        requestCount: metric.requestCount,
        errorRate: metric.errorRate
      }));
  }
}
```

## 🔧 Performance Optimization

### Database Query Optimization
```typescript
// ✅ Good: Query optimization service
export class QueryOptimizationService {
  async optimizeDatabaseQueries(): Promise<OptimizationReport> {
    const slowQueries = await this.identifySlowQueries();
    const optimizationResults: QueryOptimization[] = [];
    
    for (const query of slowQueries) {
      const optimization = await this.optimizeQuery(query);
      optimizationResults.push(optimization);
    }
    
    return {
      totalQueriesAnalyzed: slowQueries.length,
      optimizedQueries: optimizationResults.filter(r => r.improvement > 0).length,
      averageImprovement: this.calculateAverageImprovement(optimizationResults),
      recommendations: this.generateOptimizationRecommendations(optimizationResults)
    };
  }

  private async optimizeQuery(query: SlowQuery): Promise<QueryOptimization> {
    const originalExecutionTime = query.averageExecutionTime;
    
    // Analyze query execution plan
    const executionPlan = await this.analyzeExecutionPlan(query.sql);
    
    // Apply optimizations
    let optimizedSQL = query.sql;
    let improvements: string[] = [];
    
    // Add missing indexes
    if (executionPlan.missingIndexes.length > 0) {
      const indexSuggestions = await this.suggestIndexes(executionPlan.missingIndexes);
      improvements.push(`Add indexes: ${indexSuggestions.join(', ')}`);
    }
    
    // Optimize JOINs
    if (executionPlan.inefficientJoins.length > 0) {
      optimizedSQL = await this.optimizeJoins(optimizedSQL, executionPlan.inefficientJoins);
      improvements.push('Optimized JOIN operations');
    }
    
    // Optimize WHERE clauses
    if (executionPlan.inefficientWhereClauses.length > 0) {
      optimizedSQL = await this.optimizeWhereClauses(optimizedSQL, executionPlan.inefficientWhereClauses);
      improvements.push('Optimized WHERE clauses');
    }
    
    // Test optimized query
    const optimizedExecutionTime = await this.testQueryPerformance(optimizedSQL);
    const improvement = ((originalExecutionTime - optimizedExecutionTime) / originalExecutionTime) * 100;
    
    return {
      originalSQL: query.sql,
      optimizedSQL,
      originalExecutionTime,
      optimizedExecutionTime,
      improvement,
      improvements
    };
  }
}
```

### Caching Strategy
```typescript
// ✅ Good: Intelligent caching service
export class IntelligentCachingService {
  private readonly cache: Map<string, CacheEntry> = new Map();
  private readonly accessPatterns: Map<string, AccessPattern> = new Map();
  private readonly maxCacheSize = 1000;
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if expired
    if (entry.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    
    // Update access pattern
    this.updateAccessPattern(key);
    
    // Update LRU
    entry.lastAccessed = Date.now();
    
    return entry.data;
  }

  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    const expires = Date.now() + (ttl || this.defaultTTL);
    
    // Check cache size
    if (this.cache.size >= this.maxCacheSize) {
      await this.evictLeastRecentlyUsed();
    }
    
    const entry: CacheEntry = {
      data,
      expires,
      lastAccessed: Date.now(),
      accessCount: 1
    };
    
    this.cache.set(key, entry);
    this.updateAccessPattern(key);
  }

  private async evictLeastRecentlyUsed(): Promise<void> {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    // Remove 10% of least recently used entries
    const toRemove = Math.ceil(entries.length * 0.1);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  private updateAccessPattern(key: string): void {
    const pattern = this.accessPatterns.get(key) || {
      key,
      accessCount: 0,
      lastAccessed: Date.now(),
      frequency: 0
    };
    
    pattern.accessCount++;
    pattern.lastAccessed = Date.now();
    pattern.frequency = pattern.accessCount / (Date.now() - pattern.firstAccessed);
    
    this.accessPatterns.set(key, pattern);
  }
}
```

## 📋 Performance Reporting

### Performance Report Generation
```typescript
// ✅ Good: Performance report generator
export class PerformanceReportGenerator {
  async generatePerformanceReport(timeRange: TimeRange): Promise<PerformanceReport> {
    const metrics = await this.collectPerformanceMetrics(timeRange);
    const analysis = await this.analyzePerformance(metrics);
    const recommendations = await this.generateRecommendations(analysis);
    
    return {
      executiveSummary: this.generateExecutiveSummary(metrics, analysis),
      detailedMetrics: {
        apiPerformance: metrics.apiPerformance,
        databasePerformance: metrics.databasePerformance,
        frontendPerformance: metrics.frontendPerformance,
        infrastructurePerformance: metrics.infrastructurePerformance
      },
      trends: {
        responseTimeTrend: analysis.responseTimeTrend,
        errorRateTrend: analysis.errorRateTrend,
        throughputTrend: analysis.throughputTrend,
        userExperienceTrend: analysis.userExperienceTrend
      },
      bottlenecks: {
        critical: analysis.criticalBottlenecks,
        warning: analysis.warningBottlenecks,
        info: analysis.infoBottlenecks
      },
      recommendations: {
        immediate: recommendations.immediate,
        shortTerm: recommendations.shortTerm,
        longTerm: recommendations.longTerm
      },
      nextReviewDate: this.calculateNextReviewDate()
    };
  }

  private generateExecutiveSummary(metrics: PerformanceMetrics, analysis: PerformanceAnalysis): ExecutiveSummary {
    return {
      overallHealth: this.calculateOverallHealth(metrics),
      keyMetrics: {
        averageResponseTime: metrics.averageResponseTime,
        errorRate: metrics.errorRate,
        availability: metrics.availability,
        userSatisfaction: metrics.userSatisfaction
      },
      criticalIssues: analysis.criticalBottlenecks.length,
      performanceTrend: analysis.overallTrend,
      recommendations: analysis.recommendations.length
    };
  }
}
```

## 🚨 Quality Gates
- [ ] **Core Web Vitals:** LCP < 2.5s, FID < 100ms, CLS < 0.1
- [ ] **API Performance:** Response time < 200ms voor 95% van requests
- [ ] **Database Performance:** Query time < 100ms voor 95% van queries
- [ ] **Supabase Optimization:** Connection pooling enabled, queries optimized
- [ ] **Load Testing:** System handles expected load without degradation
- [ ] **Stress Testing:** System gracefully handles peak load
- [ ] **Performance Monitoring:** Real-time monitoring active
- [ ] **Caching Strategy:** Intelligent caching implemented
- [ ] **Performance Report:** Comprehensive performance report generated
