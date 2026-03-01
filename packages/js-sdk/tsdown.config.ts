import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/regex/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
})
