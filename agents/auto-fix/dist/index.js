"use strict";
// AI Auto-Fix Agent v2.0
// Simple but powerful code analysis and auto-fixing
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportGenerator = exports.Validator = exports.CodeFixer = exports.AutoFixAgent = void 0;
var AutoFixAgent_1 = require("./AutoFixAgent");
Object.defineProperty(exports, "AutoFixAgent", { enumerable: true, get: function () { return AutoFixAgent_1.AutoFixAgent; } });
var CodeFixer_1 = require("./CodeFixer");
Object.defineProperty(exports, "CodeFixer", { enumerable: true, get: function () { return CodeFixer_1.CodeFixer; } });
var Validator_1 = require("./Validator");
Object.defineProperty(exports, "Validator", { enumerable: true, get: function () { return Validator_1.Validator; } });
var ReportGenerator_1 = require("./ReportGenerator");
Object.defineProperty(exports, "ReportGenerator", { enumerable: true, get: function () { return ReportGenerator_1.ReportGenerator; } });
// Types
__exportStar(require("./types"), exports);
// CLI entry point
// export { cli } from './cli'
//# sourceMappingURL=index.js.map