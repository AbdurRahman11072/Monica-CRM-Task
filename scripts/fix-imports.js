import fs from 'fs';
import path from 'path';

function fixDir(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const full = path.join(dir, file);

    if (fs.statSync(full).isDirectory()) {
      fixDir(full);
      continue;
    }

    if (!file.endsWith('.js')) continue;

    let content = fs.readFileSync(full, 'utf8');

    // Replace your existing content.replace block with this:
    content = content.replace(
      /from\s+["'](\.\.?\/[^"']+)["']/g,
      (match, p1) => {
        // If it already ends in .js, return the match unchanged
        if (p1.endsWith('.js')) return match;

        // Check if this path refers to a directory with an index.js file
        const resolvedPath = path.resolve(path.dirname(full), p1);
        if (
          fs.existsSync(resolvedPath) &&
          fs.statSync(resolvedPath).isDirectory()
        ) {
          const indexPath = path.join(resolvedPath, 'index.js');
          if (fs.existsSync(indexPath)) {
            return match.replace(p1, `${p1}/index.js`);
          }
        }

        // Otherwise, append .js
        return match.replace(p1, `${p1}.js`);
      }
    );

    fs.writeFileSync(full, content);
  }
}

fixDir('./dist');
