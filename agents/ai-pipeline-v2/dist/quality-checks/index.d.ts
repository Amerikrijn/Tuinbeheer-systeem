import { CodeIssue } from '../types';
export interface QualityCheck {
    name: string;
    run(targetPath: string): Promise<CodeIssue[]>;
}
export declare class QualityCheckRunner {
    private checks;
    constructor(checkNames?: string[]);
    run(targetPath: string): Promise<CodeIssue[]>;
}
//# sourceMappingURL=index.d.ts.map