import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

const babelConfig = {
  babelrc: false,
}

export default [
  // CommonJS
  {
    input: `source/index.js`,
    output: {
      file: `build/dispatch-next-action.js`,
      format: `cjs`,
      indent: false,
    },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
    plugins: [
      babel({
        ...babelConfig,
        presets: [
          ['@babel/env', { modules: false, targets: { node: 'current' } }],
        ],
      }),
    ],
  },

  // ES
  {
    input: `source/index.js`,
    output: {
      file: `build/dispatch-next-action.es.js`,
      format: `es`,
      indent: false,
    },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
    plugins: [
      babel({
        ...babelConfig,
        presets: [
          ['@babel/env', { modules: false, targets: { node: 'current' } }],
        ],
      }),
    ],
  },

  // ES for Browsers
  {
    input: `source/index.js`,
    output: {
      file: `build/dispatch-next-action.mjs`,
      format: `es`,
      indent: false,
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      replace({
        'process.env.NODE_ENV': JSON.stringify(`production`),
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false,
        },
      }),
    ],
  },

  // UMD Development
  {
    input: `source/index.js`,
    output: {
      file: `build/dispatch-next-action.umd.js`,
      format: `umd`,
      name: `DispatchNextAction`,
      indent: false,
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      babel({
        ...babelConfig,
        exclude: `node_modules/**`,
        presets: [['@babel/env', { modules: false, targets: { ie: '11' } }]],
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify(`development`),
      }),
    ],
  },

  // UMD Production
  {
    input: `source/index.js`,
    output: {
      file: `build/dispatch-next-action.umd.min.js`,
      format: `umd`,
      name: `DispatchNextAction`,
      indent: false,
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      babel({
        ...babelConfig,
        exclude: `node_modules/**`,
        presets: [['@babel/env', { modules: false, targets: { ie: 11 } }]],
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify(`production`),
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false,
        },
      }),
    ],
  },
]
