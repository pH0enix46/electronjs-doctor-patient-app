"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vite_1 = require("vite");
const path_1 = require("path");
exports.default = (0, vite_1.defineConfig)({
    build: {
        lib: {
            entry: 'electron/preload.ts',
            formats: ['cjs'],
            fileName: () => 'preload.js',
        },
        outDir: 'dist-electron',
        emptyOutDir: false,
        rollupOptions: {
            external: ['electron'],
        },
    },
    resolve: {
        alias: {
            '@': (0, path_1.resolve)(__dirname, '../src'),
        },
    },
});
//# sourceMappingURL=vite.preload.config.js.map