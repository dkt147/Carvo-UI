
import { defineConfig } from 'vite';
import { dirname, resolve } from 'node:path';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';

const root = process.cwd();

const runtimeAssets = [
  'src/support.js',
  'src/_ds/broadsheet-40f84b71-5edc-425d-b6b9-0bc602d5ebbe/styles.css',
  'src/_ds/broadsheet-40f84b71-5edc-425d-b6b9-0bc602d5ebbe/_ds_bundle.js',
];

const copyCarvoRuntimeAssets = {
  name: 'copy-carvo-runtime-assets',
  apply: 'build',

  writeBundle(outputOptions) {
    const outputDir = resolve(root, outputOptions.dir || 'dist');

    for (const file of runtimeAssets) {
      const source = resolve(root, file);
      const destination = resolve(outputDir, file);

      if (!existsSync(source)) {
        this.error(`[CARVO] Required runtime asset is missing: ${file}`);
      }

      mkdirSync(dirname(destination), { recursive: true });
      copyFileSync(source, destination);
      console.log(`[CARVO] Copied runtime asset: ${file}`);
    }
  },
};

export default defineConfig({
  plugins: [copyCarvoRuntimeAssets],

  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        login: resolve(root, 'login.html'),
        admin: resolve(root, 'admin/index.html'),
        minister: resolve(root, 'minister/index.html'),
        records: resolve(root, 'minister/records.html'),
      },
    },
  },
});
