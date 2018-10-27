import nodeResolve from "rollup-plugin-node-resolve"
import commonjs from "rollup-plugin-commonjs"
import babel from "rollup-plugin-babel"
import replace from "rollup-plugin-replace"
import { terser } from "rollup-plugin-terser"

import pkg from "./package.json"

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
    plugins: [ babel() ],
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
    plugins: [ babel() ],
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
      nodeResolve({
        jsnext: true,
      }),
      commonjs(),
      replace({
        "process.env.NODE_ENV": JSON.stringify(`production`),
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
      name: `DNA`,
      indent: false,
    },
    plugins: [
      nodeResolve({
        jsnext: true,
      }),
      commonjs(),
      babel({
        exclude: `node_modules/**`,
      }),
      replace({
        "process.env.NODE_ENV": JSON.stringify(`development`),
      }),
    ],
  },

  // UMD Production
  {
    input: `source/index.js`,
    output: {
      file: `build/dispatch-next-action.umd.min.js`,
      format: `umd`,
      name: `DNA`,
      indent: false,
    },
    plugins: [
      nodeResolve({
        jsnext: true,
      }),
      commonjs(),
      babel({
        exclude: `node_modules/**`,
      }),
      replace({
        "process.env.NODE_ENV": JSON.stringify(`production`),
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
