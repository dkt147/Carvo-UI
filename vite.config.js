
import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        login: resolve(process.cwd(), 'login.html'),
        admin: resolve(process.cwd(), 'admin/index.html'),
        minister: resolve(process.cwd(), 'minister/index.html'),
        records: resolve(process.cwd(), 'minister/records.html'),
      },
    },
  },
});
