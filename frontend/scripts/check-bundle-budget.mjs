import { gzipSync } from 'node:zlib';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const assetDirectory = new URL('../dist/assets/', import.meta.url);
const assetPath = fileURLToPath(assetDirectory);
const files = readdirSync(assetDirectory);
const entryScripts = files.filter((file) => /^index-.*\.js$/.test(file));
const initialJavaScriptGzip = entryScripts.reduce((total, file) => total + gzipSync(readFileSync(new URL(file, assetDirectory))).length, 0);
const images = files.filter((file) => /\.(png|jpe?g|webp|avif|svg)$/i.test(file));
const largestImage = Math.max(0, ...images.map((file) => statSync(join(assetPath, file)).size));

const limits = { initialJavaScriptGzip: 200 * 1024, largestImage: 500 * 1024 };
const measurements = { initialJavaScriptGzip, largestImage };
for (const [name, value] of Object.entries(measurements)) {
  if (value > limits[name]) throw new Error(`${name} is ${value} bytes; budget is ${limits[name]} bytes`);
}
console.log(`Bundle budgets pass: initial JS ${Math.round(initialJavaScriptGzip / 1024)} KiB gzip; largest image ${Math.round(largestImage / 1024)} KiB.`);
