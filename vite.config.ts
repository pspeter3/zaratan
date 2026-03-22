import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {
    sortImports: {},
    sortTailwindcss: {},
  },
  lint: {
    categories: { correctness: "error", restriction: "error" },
    options: { typeAware: true, typeCheck: true },
    plugins: ["vitest"],
    rules: {
      "no-use-before-define": "off",
      "no-plusplus": "off",
      "no-bitwise": "off",
      "no-undefined": "off",
      "default-case": "off",
    },
  },
  plugins: [tailwindcss()],
});
