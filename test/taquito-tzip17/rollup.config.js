"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rollup_plugin_sourcemaps_1 = __importDefault(require("rollup-plugin-sourcemaps"));
const lodash_camelcase_1 = __importDefault(require("lodash.camelcase"));
const rollup_plugin_typescript2_1 = __importDefault(require("rollup-plugin-typescript2"));
const rollup_plugin_json_1 = __importDefault(require("rollup-plugin-json"));
const pkg = require('./package.json');
const libraryName = 'taquito-tzip17';
exports.default = {
    input: `src/${libraryName}.ts`,
    output: [
        { file: pkg.main, name: (0, lodash_camelcase_1.default)(libraryName), format: 'umd', sourcemap: true },
        { file: pkg.module, format: 'es', sourcemap: true },
    ],
    // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
    external: [],
    watch: {
        include: 'src/**',
    },
    plugins: [
        // Allow json resolution
        (0, rollup_plugin_json_1.default)(),
        // Compile TypeScript files
        (0, rollup_plugin_typescript2_1.default)({ tsconfig: './tsconfig.prod.json', useTsconfigDeclarationDir: true }),
        // Resolve source maps to the original source
        (0, rollup_plugin_sourcemaps_1.default)(),
    ],
};
