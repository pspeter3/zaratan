import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {
    sortImports: {},
  },
  lint: {
    categories: { correctness: "error" },
    options: { typeAware: true, typeCheck: true },
    plugins: ["vitest"],
  },
});
