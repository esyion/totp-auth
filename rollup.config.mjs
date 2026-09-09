import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  external: ['crypto'],
  output: [
    { file: 'dist/index.esm.js', format: 'es' },
    { file: 'dist/index.cjs', format: 'cjs', exports: 'named' },
  ],
  plugins: [typescript()],
};
