import { CodeFix, ValidationRule } from './types';
export declare class Validator {
    private validationRules;
    constructor();
    private initializeDefaultRules;
    validateFixes(fixes: CodeFix[], originalCode: string): Promise<any[]>;
    private validateSingleFix;
    addCustomRule(rule: ValidationRule): void;
    getValidationSummary(validationResults: any[]): any;
}
//# sourceMappingURL=Validator.d.ts.map