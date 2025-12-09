import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

// Plugin pour copier le schéma JSON après le build
const copySchema = {
  name: 'copy-schema',
  writeBundle() {
    const schemaPath = 'ha-room-card-schema.json';
    const distPath = 'dist/ha-room-card-schema.json';

    if (existsSync(schemaPath)) {
      copyFileSync(schemaPath, distPath);
      console.log('✅ Schema JSON copied to dist/');
    }
  }
};

export default {
  input: 'src/ha-room-card.ts',
  output: {
    file: 'dist/ha-room-card.js',
    format: 'es',
    sourcemap: true,
    sourcemapFile: 'dist/ha-room-card.js.map',
  },
  plugins: [
    nodeResolve(),
    typescript(),
    copySchema,
    terser({
      format: {
        comments: false,
      },
      compress: {
        drop_console: false,
        drop_debugger: false,
      },
    }),
  ],
  external: ['home-assistant-js-websocket'],
};