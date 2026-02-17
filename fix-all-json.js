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

    // Try to clean up common JSON issues
    let cleaned = content
      .replace(/,\s*,/g, ',')  // Remove double commas
      .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
      .replace(/(\w+)"\s*"(\w+)/g, '$1", "$2')  // Add missing commas between properties
      .replace(/"(\w+)"\s*"(\w+)":/g, '"$1", "$2":'); // Add commas between string properties

    // Try to parse
    const parsed = JSON.parse(cleaned);
    const formatted = JSON.stringify(parsed, null, 2);
    fs.writeFileSync(file, formatted);
    console.log('✅ Fixed:', file);
  } catch (e) {
    console.log('❌ Failed:', file, e.message.substring(0, 100));
  }
}