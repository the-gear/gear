import typescript from 'rollup-plugin-typescript';
import nodeResolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import gearGraphql from '@the-gear/rollup-plugin-gear-graphql';
import pkg from './package.json';

const env = { ...process.env };
const sourcemap = true;
const externals = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

/** @type {(id: string, parentId: string, isResolved: boolean) => boolean} */
const external = (id) => {
  if (externals.includes(id)) return true;
  for (const external of externals) {
    if (id.startsWith(external + '/')) return true;
  }
  return false;
};

// https://github.com/rollup/rollup-plugin-json#usage
const jsonPlugin = json({
  // for tree-shaking, properties will be declared as
  // variables, using either `var` or `const`
  preferConst: true, // Default: false

  // ignores indent and generates the smallest code
  compact: true, // Default: false
});

const gearGraphqlPlugin = gearGraphql();

// https://github.com/rollup/rollup-plugin-replace#usage
const replacePlugin = replace({
  exclude: 'node_modules/**',
  'process.env.NODE_ENV': JSON.stringify(env),
});

// https://github.com/rollup/rollup-plugin-node-resolve#usage
const resolvePlugin = nodeResolve({
  preferBuiltins: true,
  // should be '.ts' here?
  extensions: ['.ts', '.mjs', '.js', '.json'],
});

// https://github.com/rollup/rollup-plugin-commonjs#usage
const commonjsPlugin = commonjs({
  // non-CommonJS modules will be ignored, but you can also
  // specifically include/exclude files
  // include: ['node_modules/**'], // Default: undefined

  // if true then uses of `global` won't be dealt with by this plugin
  // ignoreGlobal: false, // Default: false

  // if false then skip sourceMap generation for CommonJS modules
  sourceMap: !!sourcemap, // Default: true
});

// https://github.com/rollup/rollup-plugin-typescript#usage
const typescriptPlugin = typescript({
  allowSyntheticDefaultImports: true,
  module: 'ES2015',
});

const plugins = [
  jsonPlugin,
  gearGraphqlPlugin,
  replacePlugin,
  // resolvePlugin,
  commonjsPlugin,
  typescriptPlugin,
];

const globals = {
  graphql: 'graphql',
  tslib: 'tslib',
};

/**
 * @type {Config}
 */
const config = {
  input: 'src/index.ts',
  output: {
    file: 'dist/server.js',
    format: 'cjs',
    globals,
    sourcemap,
  },
  plugins,
  external,
};

export default config;
