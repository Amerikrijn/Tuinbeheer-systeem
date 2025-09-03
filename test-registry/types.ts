/**
 * Test Registry Types voor Cursor Pipeline → CI/CD Integratie
 * 
 * Dit bestand definieert de types voor het synchroniseren van test cases
 * tussen de Cursor pipeline en de bestaande CI/CD regressie tests.
 */

export interface TestCase {
  id: string;
  name: string;
  type: 'unit' | 'integration' | 'e2e' | 'security' | 'performance';
  category: string;
  description: string;
  testFile: string;
  testFunction: string;
  coverage: {
    lines: number;
    functions: number;
    branches: number;
  };
  bankingCompliance: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies?: string[];
  environment?: string[];
}

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  testCases: TestCase[];
  bankingCompliance: boolean;
  coverage: {
    lines: number;
    functions: number;
    branches: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RegressionSuite {
  id: string;
  name: string;
  description: string;
  testSuites: TestSuite[];
  cursorTests: TestCase[];
  existingTests: TestCase[];
  bankingCompliance: boolean;
  totalCoverage: {
    lines: number;
    functions: number;
    branches: number;
  };
  lastSync: string;
  syncStatus: 'pending' | 'synced' | 'failed' | 'validated';
}

export interface TestRegistry {
  regressionSuite: RegressionSuite;
  cursorTests: TestCase[];
  existingTests: TestCase[];
  syncHistory: SyncRecord[];
  bankingCompliance: boolean;
  lastUpdated: string;
}

export interface SyncRecord {
  id: string;
  timestamp: string;
  action: 'sync' | 'validate' | 'update';
  testCasesAdded: number;
  testCasesUpdated: number;
  testCasesRemoved: number;
  bankingComplianceValidated: boolean;
  coverageAchieved: boolean;
  status: 'success' | 'failed' | 'partial';
  details: string;
  errors?: string[];
}

export interface BankingComplianceCheck {
  testCaseId: string;
  complianceChecks: {
    auditLogging: boolean;
    securityPatterns: boolean;
    dataProtection: boolean;
    errorHandling: boolean;
    typeSafety: boolean;
  };
  overallCompliance: boolean;
  issues: string[];
  recommendations: string[];
}

export interface TestSyncReport {
  syncId: string;
  timestamp: string;
  summary: {
    totalTests: number;
    cursorTests: number;
    existingTests: number;
    newTests: number;
    updatedTests: number;
    removedTests: number;
  };
  coverage: {
    lines: number;
    functions: number;
    branches: number;
    target: {
      lines: number;
      functions: number;
      branches: number;
    };
    achieved: boolean;
  };
  bankingCompliance: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    complianceRate: number;
    issues: string[];
  };
  recommendations: string[];
  nextSteps: string[];
}

