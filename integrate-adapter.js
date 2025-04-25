const fs = require('fs');
const path = require('path');

// Path to the OpenNext worker file
const workerPath = path.join(process.cwd(), '.open-next', 'worker.js');
// Path to output our custom files
const outputDir = path.join(process.cwd(), '.open-next');

// Read the generated worker.js file
console.log('Reading OpenNext worker file...');
let workerContent = fs.readFileSync(workerPath, 'utf8');

// Copy our API functions and adapter to the output directory
console.log('Copying API functions and adapter...');
fs.copyFileSync(
  path.join(process.cwd(), 'api-functions.js'),
  path.join(outputDir, 'api-functions.js')
);
fs.copyFileSync(
  path.join(process.cwd(), 'worker-adapter.js'),
  path.join(outputDir, 'worker-adapter.js')
);

// Modify the worker.js file to use our adapter
console.log('Integrating the adapter into worker.js...');

// Add the adapter import
const importStatement = `import { createWorkerAdapter } from './worker-adapter.js';\n`;
workerContent = importStatement + workerContent;

// Find the export default statement and wrap it with our adapter
const exportPattern = /export default {([\s\S]*?)};/;
const match = workerContent.match(exportPattern);

if (match) {
  const originalExport = match[0];
  const workerObject = match[1];
  
  // Create the new export that uses our adapter
  const newExport = `const originalWorker = {${workerObject}};

// Create the adapted fetch function
const adaptedFetch = createWorkerAdapter(originalWorker.fetch.bind(originalWorker));

// Export the worker with the adapted fetch function
export default {
  ...originalWorker,
  fetch: adaptedFetch
};`;
  
  // Replace the original export with our new one
  workerContent = workerContent.replace(originalExport, newExport);
  
  // Write the modified content back to the worker.js file
  fs.writeFileSync(workerPath, workerContent);
  
  console.log('Successfully integrated adapter into worker.js');
} else {
  console.error('Failed to find export default statement in worker.js');
  process.exit(1);
} 