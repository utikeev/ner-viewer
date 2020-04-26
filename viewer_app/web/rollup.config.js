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
                'react-router-dom': ['BrowserRouter', 'Switch', 'Route'],
                'react-is': ['isValidElementType']
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
    onwarn: (warning, warn) => {
        // For some weird reason Bazel doesn't allow to use select() with sourcemap attribute of the rule
        // So we'll supress that warning
        if (/sourcemap/.test(warning)) return;
        // And again some weird warning about undefined this because of the transpilers
        if ( warning.code === 'THIS_IS_UNDEFINED' ) return;
        warn(warning);
    }
};
