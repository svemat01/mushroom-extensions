// @ts-check
// import typescript from 'rollup-plugin-typescript2';
// import commonjs from '@rollup/plugin-commonjs';
// import { nodeResolve } from '@rollup/plugin-node-resolve';
// import terser from '@rollup/plugin-terser';
// // @ts-ignore
// import serve from 'rollup-plugin-serve';
// import json from '@rollup/plugin-json';

// // @ts-ignore
// const dev = process.env.ROLLUP_WATCH;

// const serveopts = {
//     contentBase: ['./dist'],
//     host: '0.0.0.0',
//     port: 3210,
//     allowCrossOrigin: true,
//     headers: {
//         'Access-Control-Allow-Origin': '*',
//     },
// };

// const plugins = [
//     nodeResolve({}),
//     commonjs(),
//     typescript(),
//     json(),
//     dev && serve(serveopts),
//     !dev && terser(),
// ];

// export default [
//     {
//         input: 'src/boilerplate-card.ts',
//         output: {
//             dir: 'dist',
//             format: 'es',
//         },
//         plugins: [...plugins],
//     },
// ];

import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import serve from "rollup-plugin-serve";

const dev = process.env.ROLLUP_WATCH;

const serveOptions = {
    contentBase: ["./dist"],
    host: "0.0.0.0",
    port: 4000,
    allowCrossOrigin: true,
    headers: {
        "Access-Control-Allow-Origin": "*",
    },
};

const plugins = [
    typescript({
        declaration: false,
    }),
    nodeResolve(),
    json(),
    commonjs(),
    babel({
        babelHelpers: "bundled",
    }),
    ...(dev ? [serve(serveOptions)] : [terser()]),
];

export default [
    {
        input: "src/mushroom-extensions.ts",
        output: {
            dir: "dist",
            format: "es",
            inlineDynamicImports: true,
        },
        plugins,
    },
];