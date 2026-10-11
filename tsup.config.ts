import { defineConfig } from "tsup";

export default defineConfig({
  outExtension: ({ format }) => ({ js: format === "cjs" ? ".cjs" : ".js" }),
});
