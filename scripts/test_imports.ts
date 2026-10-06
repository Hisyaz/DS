import fs from 'fs';

const appCode = fs.readFileSync('./src/App.tsx', 'utf8');
const lines = appCode.split('\n');
const importLines = lines.filter(l => l.startsWith('import ') && l.includes('from '));

async function testImports() {
  for (const line of importLines) {
    const match = line.match(/from\s+['"](.*)['"]/);
    if (match) {
      const imp = match[1];
      if (imp.startsWith('.')) {
        console.log(`Importing: ${imp}...`);
        const start = Date.now();
        try {
          await import(imp);
          console.log(`✓ Imported ${imp} in ${Date.now() - start}ms`);
        } catch (e: any) {
          console.log(`✗ Error importing ${imp}:`, e.message);
        }
      }
    }
  }
  console.log('All imports tested!');
  process.exit(0);
}

testImports();
