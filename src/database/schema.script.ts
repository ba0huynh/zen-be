import { join } from 'node:path';

// 1. Point to the 'entities' directory relative to this script
const entitiesDir = join(import.meta.dirname, 'entities'); 
// 2. Point to the output 'schema.ts' file in the 'database' root
const schemaOutputFile = join(import.meta.dirname, 'database.schema.ts');

// The recursive glob '**/*.table.ts' will drill down into all subfolders
const glob = new Bun.Glob('**/*.entity.ts');

let exportsLines = '// 🤖 AUTOMATED FILE - DO NOT EDIT MANUALLY\n';

for (const file of glob.scanSync({ cwd: entitiesDir })) {
  // Strip the '.ts' extension 
  const cleanPath = file.replace(/\.ts$/, '');
  
  // 🔧 FIX: Replace Windows backslashes (\) with forward slashes (/)
  const normalizedPath = cleanPath.replace(/\\/g, '/');
  
  // Format the export line securely for all platforms
  exportsLines += `export * from './entities/${normalizedPath}';\n`;
}

// Write the combined exports into ./schema.ts
await Bun.write(schemaOutputFile, exportsLines);
console.log('✅ Schema index successfully generated at ./database.schema.ts!');