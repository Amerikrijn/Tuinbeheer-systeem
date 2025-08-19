import { TypeScriptAnalysis, CodeFix } from './types';
export declare class TypeScriptAnalyzer {
    private configPath?;
    private program;
    private checker;
    private sourceFiles;
    constructor(configPath?: string | undefined);
    /**
     * Initialize TypeScript compiler program
     */
    initialize(): Promise<void>;
    /**
     * Analyze a specific file using TypeScript compiler API
     */
    analyzeFile(filePath: string): Promise<TypeScriptAnalysis>;
    /**
     * Generate fixes for TypeScript issues
     */
    generateFixes(analysis: TypeScriptAnalysis): Promise<CodeFix[]>;
    /**
     * Generate a specific fix for a diagnostic
     */
    private generateFixForDiagnostic;
    /**
     * Generate fix based on TypeScript diagnostic code
     */
    private generateFixByCode;
    /**
     * Fix property access issues
     */
    private fixPropertyAccess;
    /**
     * Fix type mismatch issues
     */
    private fixTypeMismatch;
    /**
     * Fix undefined variable issues
     */
    private fixUndefinedVariable;
    /**
     * Fix missing return type annotations
     */
    private fixTypeAssignment;
    /**
     * Fix implicit any types
     */
    private fixImplicitAny;
    /**
     * Find similar names in the source file
     */
    private findSimilarNames;
    /**
     * Calculate similarity between two strings
     */
    private calculateSimilarity;
    /**
     * Calculate Levenshtein distance
     */
    private levenshteinDistance;
    /**
     * Infer return type for a function
     */
    private inferReturnType;
    /**
     * Infer parameter type
     */
    private inferParameterType;
    /**
     * Find node at specific position
     */
    private findNodeAtPosition;
    /**
     * Extract symbols from source file
     */
    private extractSymbols;
    /**
     * Extract imports from source file
     */
    private extractImports;
    /**
     * Extract exports from source file
     */
    private extractExports;
    /**
     * Extract type information
     */
    private extractTypeInfo;
    /**
     * Extract documentation from node
     */
    private extractDocumentation;
    /**
     * Convert TypeScript diagnostics to our format
     */
    private convertDiagnostics;
    /**
     * Map TypeScript severity to our format
     */
    private mapSeverity;
    /**
     * Find tsconfig.json file
     */
    private findTsConfig;
    /**
     * Parse tsconfig.json
     */
    private parseTsConfig;
    /**
     * Create compiler host
     */
    private createCompilerHost;
    /**
     * Cleanup resources
     */
    dispose(): void;
}
//# sourceMappingURL=TypeScriptAnalyzer.d.ts.map