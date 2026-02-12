"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="vitest" />
const config_1 = require("vitest/config");
const vitest_config_1 = __importDefault(require("../../vitest.config"));
exports.default = (0, config_1.mergeConfig)(vitest_config_1.default, (0, config_1.defineProject)({
    test: {
        environment: 'node',
    },
}));
//# sourceMappingURL=vitest.config.js.map