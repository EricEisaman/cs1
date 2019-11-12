import css from 'rollup-plugin-css-only';
//import cleanup from 'rollup-plugin-cleanup';
import {terser} from 'rollup-plugin-terser';
import json from 'rollup-plugin-json';
import { string } from "rollup-plugin-string";

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = process.env.BUILD!='dev'?true:false;

export default {
	input: 'src/main.js',
	output: {
		file: 'public/bundle.js',
		format: 'iife', // immediately-invoked function expression — suitable for <script> tags
		sourcemap: true,
	},
	plugins: [
    json(),
    string({
      // Required to be specified
      include: "**/*.html",

      // Undefined by default
      exclude: ["**/index.html"]
    }),
    css({ output: 'public/bundle.css' }),
		//resolve(), // tells Rollup how to find date-fns in node_modules
    //cleanup({comments: 'none'}),
		production && terser(), // minify, but only in production
	]
};
