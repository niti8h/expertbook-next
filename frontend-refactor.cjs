const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace src={`https://api.expertbook.in${variable}`} -> src={getImageUrl(variable)}
  // The regex matches src={`https://api.expertbook.in${([^}]+)}`}
  content = content.replace(/src=\{\`https:\/\/api\.expertbook\.in\$\{([^}]+)\}\`\}/g, "src={getImageUrl($1)}");

  // Replace src={`${process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.expertbook.in"}${variable}`}
  content = content.replace(/src=\{\`\$\{process\.env\.NEXT_PUBLIC_BACKEND_URL[^}]*\}\$\{([^}]+)\}\`\}/g, "src={getImageUrl($1)}");

  if (content !== originalContent) {
    // Determine relative path to lib/utils for the import
    const dirDepth = path.dirname(file).replace(path.join(__dirname, 'src'), '').split(path.sep).filter(Boolean).length;
    const relativePath = dirDepth === 0 ? './lib/utils' : '../'.repeat(dirDepth) + 'lib/utils';
    
    // Check if import exists
    if (!content.includes('getImageUrl')) {
        // Just add to the top
        content = `import { getImageUrl } from "${relativePath}";\n` + content;
    } else if (!content.includes('import { getImageUrl }')) {
        content = `import { getImageUrl } from "${relativePath}";\n` + content;
    }

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
