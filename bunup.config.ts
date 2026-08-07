import { defineConfig } from "bunup"

export default defineConfig({
  dts: {
    inferTypes: true,
  },
  entry: ["src/index.ts"],
  format: "esm",
  minify: true,
  outDir: "dist",
  preferredTsconfig: "./tsconfig.build.json",
  sourcemap: false,
  target: "node",
})
