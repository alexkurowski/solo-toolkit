import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";
import { sassPlugin } from "esbuild-sass-plugin";

const banner = `/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/
`;

const watch = process.argv[2] === "watch";

const context = await esbuild.context({
  banner: {
    js: banner,
  },
  entryPoints: ["src/main.ts", "src/styles.scss"],
  bundle: true,
  external: [
    "obsidian",
    "electron",
    "codemirror",
    "@codemirror/autocomplete",
    "@codemirror/closebrackets",
    "@codemirror/collab",
    "@codemirror/commands",
    "@codemirror/comment",
    "@codemirror/fold",
    "@codemirror/gutter",
    "@codemirror/highlight",
    "@codemirror/history",
    "@codemirror/language",
    "@codemirror/lint",
    "@codemirror/matchbrackets",
    "@codemirror/panel",
    "@codemirror/rangeset",
    "@codemirror/rectangular-selection",
    "@codemirror/search",
    "@codemirror/state",
    "@codemirror/stream-parser",
    "@codemirror/text",
    "@codemirror/tooltip",
    "@codemirror/view",
    ...builtins,
  ],
  plugins: [sassPlugin()],
  format: "cjs",
  target: "es2022",
  logLevel: watch ? "info" : "error",
  sourcemap: watch ? "inline" : false,
  minify: true,
  treeShaking: true,
  outdir: "dist",
  logOverride: { "empty-import-meta": "silent" },
});

if (watch) {
  await context.watch();
} else {
  await context.rebuild();
  process.exit(0);
}
