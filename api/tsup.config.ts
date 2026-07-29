import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["esm"],
  clean: true,
  external: [
    "pg", 
    /generated[\\/]prisma/ // This regex matches "generated\prisma" (Windows) or "generated/prisma" (Mac/Linux)
  ],
});