import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/ha-room-card.ts',
  output: {
    file: 'dist/ha-room-card.js',
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    typescript(),
    terser({
      format: {
        comments: false,
      },
    }),
  ],
  external: ['home-assistant-js-websocket'],
};