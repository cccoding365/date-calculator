import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './',
  resolve: {
    // 使文件引入不必含后缀
    extensions: [".vue", ".js", "jsx", "ts", "tsx"],
    alias: {
      "@": fileURLToPath(new URL("./src/", import.meta.url)),
    },
  },
});
