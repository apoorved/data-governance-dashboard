import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["esm"],
  clean: true,
  external: [
    "pg",
    "@prisma/client",  // Mark @prisma/client as external (not bundled)
    ".prisma",
  ],
});