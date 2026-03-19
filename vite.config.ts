import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {
    sortImports: {},
  },
  lint: { options: { typeAware: true, typeCheck: true } },
});
