"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeScriptAnalyzer = void 0;
const ts = __importStar(require("typescript"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class TypeScriptAnalyzer {
    constructor(configPath) {
        this.configPath = configPath;
        this.program = null;
        this.checker = null;
        this.sourceFiles = new Map();
    }
    /**
     * Initialize TypeScript compiler program
     */
    async initialize() {
        try {
            const configPath = this.configPath || this.findTsConfig();
            if (!configPath) {
                throw new Error('No tsconfig.json found');
            }
            const config = this.parseTsConfig(configPath);
            const host = this.createCompilerHost(config);
            this.program = ts.createProgram(config.fileNames, config.options, host);
            this.checker = this.program.getTypeChecker();
            // Store source files for analysis
            this.program.getSourceFiles().forEach(sourceFile => {
                if (!sourceFile.isDeclarationFile) {
                    this.sourceFiles.set(sourceFile.fileName, sourceFile);
                }
            });
            console.log(`✅ TypeScript program initialized with ${this.sourceFiles.size} source files`);
        }
        catch (error) {
            console.error('❌ Failed to initialize TypeScript program:', error);
            throw error;
        }
    }
    /**
     * Analyze a specific file using TypeScript compiler API
     */
    async analyzeFile(filePath) {
        if (!this.program || !this.checker) {
            throw new Error('TypeScript program not initialized');
        }
        const sourceFile = this.sourceFiles.get(filePath);
        if (!sourceFile) {
            throw new Error(`Source file not found: ${filePath}`);
        }
        const diagnostics = this.program.getSemanticDiagnostics(sourceFile);
        const symbols = this.extractSymbols(sourceFile);
        const imports = this.extractImports(sourceFile);
        const exports = this.extractExports(sourceFile);
        const typeInfo = this.extractTypeInfo(sourceFile);
        return {
            ast: sourceFile,
            diagnostics: this.convertDiagnostics(diagnostics),
            symbols,
            imports,
            exports,
            typeInfo
        };
    }
    /**
     * Generate fixes for TypeScript issues
     */
    async generateFixes(analysis) {
        const fixes = [];
        for (const diagnostic of analysis.diagnostics) {
            const fix = await this.generateFixForDiagnostic(diagnostic, analysis);
            if (fix) {
                fixes.push(fix);
            }
        }
        return fixes;
    }
    /**
     * Generate a specific fix for a diagnostic
     */
    async generateFixForDiagnostic(diagnostic, analysis) {
        const sourceFile = analysis.ast;
        const start = diagnostic.start || 0;
        const length = diagnostic.length || 0;
        // Get the node at the diagnostic position
        const node = this.findNodeAtPosition(sourceFile, start);
        if (!node)
            return null;
        // Generate fix based on diagnostic code
        const fix = await this.generateFixByCode(diagnostic.code, node, sourceFile);
        if (!fix)
            return null;
        return {
            id: `ts-${diagnostic.code}-${start}`,
            filePath: sourceFile.fileName,
            lineNumber: diagnostic.line,
            issueType: 'typescript',
            severity: this.mapSeverity(diagnostic.category),
            description: diagnostic.message,
            originalCode: sourceFile.text.substring(start, start + length),
            fixedCode: fix,
            confidence: 0.9,
            validationRules: [{
                    type: 'typescript',
                    condition: 'TypeScript compilation passes',
                    message: 'Fix must pass TypeScript compilation'
                }],
            dependencies: [],
            estimatedEffort: 'low',
            risk: 'low',
            tags: ['typescript', `ts-${diagnostic.code}`],
            createdAt: new Date().toISOString(),
            typescriptNode: node
        };
    }
    /**
     * Generate fix based on TypeScript diagnostic code
     */
    async generateFixByCode(code, node, sourceFile) {
        switch (code) {
            case 2339: // Property does not exist on type
                return this.fixPropertyAccess(node, sourceFile);
            case 2345: // Argument not assignable to parameter
                return this.fixTypeMismatch(node, sourceFile);
            case 2304: // Cannot find name
                return this.fixUndefinedVariable(node, sourceFile);
            case 2322: // Type not assignable to type
                return this.fixTypeAssignment(node, sourceFile);
            case 2366: // Function lacks return type annotation
                return this.fixMissingReturnType(node, sourceFile);
            case 7006: // Parameter implicitly has an 'any' type
                return this.fixImplicitAny(node, sourceFile);
            default:
                return null;
        }
    }
    /**
     * Fix property access issues
     */
    fixPropertyAccess(node, sourceFile) {
        if (ts.isPropertyAccessExpression(node)) {
            const type = this.checker?.getTypeAtLocation(node.expression);
            if (type) {
                const properties = this.checker?.getPropertiesOfType(type) || [];
                const suggestions = properties.map(p => p.name);
                if (suggestions.length > 0) {
                    // Suggest the most likely property
                    const suggestedProperty = suggestions[0];
                    return sourceFile.text.substring(0, node.end - 1) +
                        suggestedProperty +
                        sourceFile.text.substring(node.end);
                }
            }
        }
        return null;
    }
    /**
     * Fix type mismatch issues
     */
    fixTypeMismatch(node, sourceFile) {
        if (ts.isCallExpression(node)) {
            const signature = this.checker?.getResolvedSignature(node);
            if (signature) {
                const parameters = signature.getParameters();
                const args = node.arguments;
                // Add type assertions or fix argument types
                let fixedCode = sourceFile.text;
                args.forEach((arg, index) => {
                    if (index < parameters.length) {
                        const paramType = parameters[index].valueDeclaration;
                        if (paramType && ts.isParameter(paramType) && paramType.type) {
                            const typeText = paramType.type.getText(sourceFile);
                            fixedCode = fixedCode.replace(arg.getText(sourceFile), `(${arg.getText(sourceFile)} as ${typeText})`);
                        }
                    }
                });
                return fixedCode;
            }
        }
        return null;
    }
    /**
     * Fix undefined variable issues
     */
    fixUndefinedVariable(node, sourceFile) {
        if (ts.isIdentifier(node)) {
            // Look for similar variable names in scope
            const similarNames = this.findSimilarNames(node.text, sourceFile);
            if (similarNames.length > 0) {
                return sourceFile.text.replace(node.text, similarNames[0]);
            }
        }
        return null;
    }
    /**
     * Fix missing return type annotations
     */
    fixTypeAssignment(node, sourceFile) {
        if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) {
            if (!node.type) {
                const returnType = this.inferReturnType(node);
                if (returnType) {
                    const functionText = node.getText(sourceFile);
                    const insertPos = functionText.indexOf(')') + 1;
                    return functionText.substring(0, insertPos) +
                        `: ${returnType}` +
                        functionText.substring(insertPos);
                }
            }
        }
        return null;
    }
    /**
     * Fix implicit any types
     */
    fixImplicitAny(node, sourceFile) {
        if (ts.isParameter(node) && !node.type) {
            const inferredType = this.inferParameterType(node);
            if (inferredType) {
                const paramText = node.getText(sourceFile);
                return paramText + `: ${inferredType}`;
            }
        }
        return null;
    }
    /**
     * Find similar names in the source file
     */
    findSimilarNames(name, sourceFile) {
        const names = [];
        const visit = (node) => {
            if (ts.isVariableDeclaration(node) || ts.isParameterDeclaration(node)) {
                if (ts.isIdentifier(node.name)) {
                    const nodeName = node.name.text;
                    if (nodeName !== name && this.calculateSimilarity(name, nodeName) > 0.7) {
                        names.push(nodeName);
                    }
                }
            }
            ts.forEachChild(node, visit);
        };
        visit(sourceFile);
        return names;
    }
    /**
     * Calculate similarity between two strings
     */
    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        if (longer.length === 0)
            return 1.0;
        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }
    /**
     * Calculate Levenshtein distance
     */
    levenshteinDistance(str1, str2) {
        const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
        for (let i = 0; i <= str1.length; i++)
            matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++)
            matrix[j][0] = j;
        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(matrix[j][i - 1] + 1, matrix[j - 1][i] + 1, matrix[j - 1][i - 1] + indicator);
            }
        }
        return matrix[str2.length][str1.length];
    }
    /**
     * Infer return type for a function
     */
    inferReturnType(node) {
        if (this.checker) {
            const signature = this.checker.getSignatureFromDeclaration(node);
            if (signature) {
                const returnType = this.checker.getReturnTypeOfSignature(signature);
                return this.checker.typeToString(returnType);
            }
        }
        return null;
    }
    /**
     * Infer parameter type
     */
    inferParameterType(node) {
        if (this.checker) {
            const type = this.checker.getTypeAtLocation(node);
            return this.checker.typeToString(type);
        }
        return null;
    }
    /**
     * Find node at specific position
     */
    findNodeAtPosition(sourceFile, position) {
        let result = null;
        const visit = (node) => {
            if (node.getStart(sourceFile) <= position && position <= node.getEnd()) {
                result = node;
                ts.forEachChild(node, visit);
            }
        };
        visit(sourceFile);
        return result;
    }
    /**
     * Extract symbols from source file
     */
    extractSymbols(sourceFile) {
        const symbols = [];
        if (this.checker) {
            const visit = (node) => {
                if (ts.isVariableDeclaration(node) || ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) {
                    if (ts.isIdentifier(node.name)) {
                        const type = this.checker.getTypeAtLocation(node);
                        symbols.push({
                            name: node.name.text,
                            kind: ts.SyntaxKind[node.kind],
                            location: { start: node.getStart(sourceFile), end: node.getEnd() },
                            type: this.checker.typeToString(type),
                            documentation: this.extractDocumentation(node)
                        });
                    }
                }
                ts.forEachChild(node, visit);
            };
            visit(sourceFile);
        }
        return symbols;
    }
    /**
     * Extract imports from source file
     */
    extractImports(sourceFile) {
        const imports = [];
        const visit = (node) => {
            if (ts.isImportDeclaration(node)) {
                const moduleSpecifier = node.moduleSpecifier.getText(sourceFile).replace(/['"]/g, '');
                const namedBindings = [];
                let defaultBinding;
                if (node.importClause) {
                    if (node.importClause.name) {
                        defaultBinding = node.importClause.name.text;
                    }
                    if (node.importClause.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
                        node.importClause.namedBindings.elements.forEach(element => {
                            namedBindings.push(element.name.text);
                        });
                    }
                }
                imports.push({
                    moduleSpecifier,
                    namedBindings,
                    defaultBinding,
                    location: { start: node.getStart(sourceFile), end: node.getEnd() }
                });
            }
            ts.forEachChild(node, visit);
        };
        visit(sourceFile);
        return imports;
    }
    /**
     * Extract exports from source file
     */
    extractExports(sourceFile) {
        const exports = [];
        const visit = (node) => {
            if (ts.isExportDeclaration(node)) {
                if (node.exportClause && ts.isNamedExports(node.exportClause)) {
                    node.exportClause.elements.forEach(element => {
                        exports.push({
                            name: element.name.text,
                            kind: 'export',
                            location: { start: element.getStart(sourceFile), end: element.getEnd() },
                            type: 'any'
                        });
                    });
                }
            }
            else if (ts.isVariableStatement(node) && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
                node.declarationList.declarations.forEach(decl => {
                    if (ts.isIdentifier(decl.name)) {
                        exports.push({
                            name: decl.name.text,
                            kind: 'export',
                            location: { start: decl.getStart(sourceFile), end: decl.getEnd() },
                            type: 'any'
                        });
                    }
                });
            }
            ts.forEachChild(node, visit);
        };
        visit(sourceFile);
        return exports;
    }
    /**
     * Extract type information
     */
    extractTypeInfo(sourceFile) {
        return {
            type: 'mixed',
            isPrimitive: false,
            isUnion: false,
            isIntersection: false,
            isGeneric: false,
            genericTypes: []
        };
    }
    /**
     * Extract documentation from node
     */
    extractDocumentation(node) {
        const docs = [];
        if (node.parent && ts.isVariableStatement(node.parent)) {
            const trivia = node.parent.getLeadingTriviaWidth(node.parent.getSourceFile());
            if (trivia > 0) {
                const triviaText = node.parent.getSourceFile().text.substring(node.parent.getStart() - trivia, node.parent.getStart());
                const lines = triviaText.split('\n');
                lines.forEach(line => {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('//') || trimmed.startsWith('/*')) {
                        docs.push(trimmed);
                    }
                });
            }
        }
        return docs;
    }
    /**
     * Convert TypeScript diagnostics to our format
     */
    convertDiagnostics(diagnostics) {
        return diagnostics.map(diagnostic => ({
            code: diagnostic.code,
            category: diagnostic.category === ts.DiagnosticCategory.Error ? 'error' :
                diagnostic.category === ts.DiagnosticCategory.Warning ? 'warning' : 'suggestion',
            message: diagnostic.messageText,
            start: diagnostic.start || 0,
            length: diagnostic.length || 0,
            line: diagnostic.file ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start || 0).line + 1 : 0,
            character: diagnostic.file ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start || 0).character + 1 : 0,
            file: diagnostic.file?.fileName || ''
        }));
    }
    /**
     * Map TypeScript severity to our format
     */
    mapSeverity(category) {
        switch (category) {
            case ts.DiagnosticCategory.Error:
                return 'high';
            case ts.DiagnosticCategory.Warning:
                return 'medium';
            case ts.DiagnosticCategory.Suggestion:
                return 'low';
            default:
                return 'low';
        }
    }
    /**
     * Find tsconfig.json file
     */
    findTsConfig() {
        let currentDir = process.cwd();
        while (currentDir !== path.dirname(currentDir)) {
            const configPath = path.join(currentDir, 'tsconfig.json');
            if (fs.existsSync(configPath)) {
                return configPath;
            }
            currentDir = path.dirname(currentDir);
        }
        return null;
    }
    /**
     * Parse tsconfig.json
     */
    parseTsConfig(configPath) {
        const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
        if (configFile.error) {
            throw new Error(`Failed to read tsconfig.json: ${configFile.error.messageText}`);
        }
        const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(configPath));
        if (parsed.errors.length > 0) {
            throw new Error(`Failed to parse tsconfig.json: ${parsed.errors.map(e => e.messageText).join(', ')}`);
        }
        return parsed;
    }
    /**
     * Create compiler host
     */
    createCompilerHost(config) {
        return {
            ...ts.createCompilerHost(config.options),
            getSourceFile: (fileName, languageVersion) => {
                if (fs.existsSync(fileName)) {
                    const sourceText = fs.readFileSync(fileName, 'utf8');
                    return ts.createSourceFile(fileName, sourceText, languageVersion);
                }
                return undefined;
            },
            readFile: (fileName) => {
                if (fs.existsSync(fileName)) {
                    return fs.readFileSync(fileName, 'utf8');
                }
                return undefined;
            },
            fileExists: (fileName) => fs.existsSync(fileName),
            getCurrentDirectory: () => process.cwd(),
            getDirectories: (path) => {
                try {
                    return fs.readdirSync(path, { withFileTypes: true })
                        .filter(dirent => dirent.isDirectory())
                        .map(dirent => dirent.name);
                }
                catch {
                    return [];
                }
            }
        };
    }
    /**
     * Cleanup resources
     */
    dispose() {
        this.program = null;
        this.checker = null;
        this.sourceFiles.clear();
    }
}
exports.TypeScriptAnalyzer = TypeScriptAnalyzer;
//# sourceMappingURL=TypeScriptAnalyzer.js.map