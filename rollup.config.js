import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';

export default {
  input: 'src/index.js',
  output: {
    file: 'datalib.js',
    format: 'umd',
    sourcemap: true,
    name: 'dl'
  },
  plugins: [
    resolve({browser: true}),
    commonjs(),
    json()
  ]
};
