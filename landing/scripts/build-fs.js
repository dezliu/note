/**
 * Build script: scans docs/ directory and generates file system JSON
 * for the terminal's virtual file system.
 *
 * Run: node scripts/build-fs.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.resolve(__dirname, '..', '..', 'docs');
const OUTPUT_FILE = path.resolve(__dirname, '..', 'src', 'data', 'fileSystem.json');
// md files are copied here (served statically) so the terminal can fetch them
const PUBLIC_MD_DIR = path.resolve(__dirname, '..', 'public', 'md');

function buildTree(dirPath, relativePath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const result = [];

  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    const entryRelative = path.join(relativePath, entry.name);

    if (entry.isDirectory()) {
      // Skip hidden directories
      if (entry.name.startsWith('.')) continue;
      result.push({
        name: entry.name,
        type: 'dir',
        children: buildTree(entryPath, entryRelative),
      });
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const stat = fs.statSync(entryPath);
      // Copy md to public/md/ for runtime fetching (keeps fileSystem.json small)
      const targetPath = path.join(PUBLIC_MD_DIR, entryRelative);
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      fs.copyFileSync(entryPath, targetPath);
      result.push({
        name: entry.name,
        type: 'file',
        path: entryRelative,
        size: stat.size,
      });
    }
  }

  // Sort: directories first, then files, both alphabetically
  result.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return result;
}

// Ensure output directory exists
const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Reset public/md/ to avoid stale copies
if (fs.existsSync(PUBLIC_MD_DIR)) {
  fs.rmSync(PUBLIC_MD_DIR, { recursive: true, force: true });
}
fs.mkdirSync(PUBLIC_MD_DIR, { recursive: true });

const tree = buildTree(DOCS_DIR, '');
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(tree, null, 2));
console.log(`Generated file system: ${OUTPUT_FILE} (${tree.length} top-level entries)`);
