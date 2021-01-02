export default [{
    input: "src/rollup-plugin-webes/index.js",
    output: {
        name: 'rollup-plugin-webes',
        file: "dist/jsm/rollup-plugin-webes.js",
        sourcemap: "inline",
        format: "es"
    }
},{
    input: "src/rollup-plugin-webes/index.js",
    output: {
        name: 'rollup-plugin-webes',
        file: "dist/cjs/rollup-plugin-webes.js",
        sourcemap: "inline",
        format: "cjs"
    }
}]
