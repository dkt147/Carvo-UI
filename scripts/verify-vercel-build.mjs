import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const requiredFiles = [
  "dist/index.html",
  "dist/login.html",
  "dist/admin/index.html",
  "dist/minister/index.html",
  "dist/minister/records.html",
  "dist/src/support.js",
  "dist/src/_ds/broadsheet-40f84b71-5edc-425d-b6b9-0bc602d5ebbe/styles.css",
  "dist/src/_ds/broadsheet-40f84b71-5edc-425d-b6b9-0bc602d5ebbe/_ds_bundle.js",
];

const missing = requiredFiles.filter((file) => {
  const fullPath = resolve(root, file);
  return !existsSync(fullPath) || !statSync(fullPath).isFile() || statSync(fullPath).size === 0;
});

if (missing.length) {
  console.error("[CARVO] Vercel build verification failed. Missing/empty output files:");
  for (const file of missing) console.error(`  - ${file}`);
  process.exit(1);
}

const ministerHtml = readFileSync(resolve(root, "dist/minister/index.html"), "utf8");
for (const expected of [
  "/src/support.js",
  "/src/_ds/broadsheet-40f84b71-5edc-425d-b6b9-0bc602d5ebbe/_ds_bundle.js",
]) {
  if (!ministerHtml.includes(expected)) {
    console.error(`[CARVO] Minister HTML no longer references expected runtime asset: ${expected}`);
    process.exit(1);
  }
}

// Vite hoists stylesheets declared in the custom x-dc document into a hashed
// /assets/*.css output file, so the original /src/.../styles.css href may not
// remain in the built HTML. Verify that a CSS file is actually linked instead.
if (!/<link\b[^>]*href=["'][^"']+\.css(?:\?[^"']*)?["'][^>]*>/i.test(ministerHtml)) {
  console.error("[CARVO] Minister HTML has no linked stylesheet in the production build.");
  process.exit(1);
}

console.log(`[CARVO] Vercel output verified (${requiredFiles.length} required files, 5 HTML routes).`);
