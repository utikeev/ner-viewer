import * as React from 'react';
import * as ReactDOM from 'react-dom';
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import postcss from "rollup-plugin-postcss";
import {terser} from "rollup-plugin-terser";

export default {
    plugins: [
        resolve(),
        commonjs({
            include: [
                'node_modules/**'
            ],
            exclude: [
                'node_modules/process-es6/**'
            ],
            namedExports: {
                'react': Object.keys(React),
                'react-dom': Object.keys(ReactDOM),
            }
        }),
        replace({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        postcss({
            extensions: ['.css', '.scss'],
        }),
        terser({
            sourcemap: false
        }),
    ],
};