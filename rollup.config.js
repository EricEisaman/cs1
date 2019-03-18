import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
//import { uglify } from 'rollup-plugin-uglify';
import css from 'rollup-plugin-css-only';
import cleanup from 'rollup-plugin-cleanup';
import uglify from 'rollup-plugin-uglify-es';
import json from 'rollup-plugin-json';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/main.js',
	output: {
		file: 'public/bundle.js',
		format: 'iife', // immediately-invoked function expression — suitable for <script> tags
		sourcemap: true,
	},
	plugins: [
    json(),
    cleanup({comments: 'none'}),
    css({ output: 'public/bundle.css' }),
		resolve(), // tells Rollup how to find date-fns in node_modules
		production && uglify(), // minify, but only in production
	]
};
