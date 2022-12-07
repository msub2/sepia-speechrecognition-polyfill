import webWorkerLoader from 'rollup-plugin-web-worker-loader';
import inlineCode from 'rollup-plugin-inline-code';
import terser from '@rollup/plugin-terser';

const formats = ['esm', 'esm-min']

export default formats.map(format => {
  const basePath = 'dist/sepia-speechrecognition-polyfill';
  const terserPlugin = format === 'esm' ? () => {} : terser;
  return {
    input: 'src/index.js',
    output: {
      file: `${basePath}.${format === 'esm' ? 'js' : 'min.js'}`,
      format: 'esm'
    },
    plugins: [
      terserPlugin(),
      webWorkerLoader({ targetPlatform: 'browser' }),
      inlineCode()
    ]
  }
});