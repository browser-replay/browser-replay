const fs = require('fs');
const path = require('path');

// Find all package.json files
function findPackageJson(dir, files = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findPackageJson(fullPath, files);
    } else if (item === 'package.json') {
      files.push(fullPath);
    }
  }
  return files;
}

const packages = findPackageJson('packages');
console.log(`Found ${packages.length} package.json files`);

for (const file of packages) {
  try {
    const content = fs.readFileSync(file, 'utf8');

    // More aggressive JSON cleaning
    let cleaned = content
      // Remove trailing commas before closing braces/brackets
      .replace(/,(\s*[}\]])/g, '$1')
      // Add missing commas after string values that are followed by other properties
      .replace(/"([^"]*)":\s*"([^"]*)"\s*$/gm, '"$1": "$2",')
      // Fix arrays - add commas between array elements
      .replace(/"([^"]*)"\s*$/gm, '"$1",')
      // Remove the last comma in arrays and objects
      .replace(/,(\s*[}\]])/g, '$1')
      // Clean up multiple consecutive commas
      .replace(/,,+/g, ',');

    // Try to parse and format properly
    try {
      const parsed = JSON.parse(cleaned);
      const formatted = JSON.stringify(parsed, null, 2);
      fs.writeFileSync(file, formatted);
      console.log('✅ Fixed:', file);
    } catch (parseError) {
      console.log('❌ Parse failed:', file, parseError.message.substring(0, 100));

      // Last resort: try to reconstruct basic structure
      try {
        const lines = content.split('\n');
        let inObject = false;
        let inArray = false;
        let result = [];

        for (let i = 0; i < lines.length; i++) {
          let line = lines[i].trim();

          if (line.includes('{')) inObject = true;
          if (line.includes('}')) inObject = false;
          if (line.includes('[')) inArray = true;
          if (line.includes(']')) inArray = false;

          // Add commas where missing
          if (inObject && !line.includes('{') && !line.includes('}') && !line.includes(',') && i < lines.length - 1) {
            const nextLine = lines[i + 1].trim();
            if (nextLine && !nextLine.includes('}') && !nextLine.includes(']')) {
              line += ',';
            }
          }

          result.push(lines[i]);
        }

        const reconstructed = result.join('\n');
        const parsed = JSON.parse(reconstructed);
        const formatted = JSON.stringify(parsed, null, 2);
        fs.writeFileSync(file, formatted);
        console.log('✅ Fixed with reconstruction:', file);
      } catch (reconstructError) {
        console.log('❌ Reconstruction failed:', file);
      }
    }
  } catch (e) {
    console.log('❌ Failed to process:', file, e.message);
  }
}