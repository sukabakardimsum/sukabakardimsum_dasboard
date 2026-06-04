import fs from 'fs';
import path from 'path';

const pagesDir = './src/pages';
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  const toRemove = [
    /^\s*\{\s*id:\s*'orders',\s*label:\s*'Orders'.*?\n/m
  ];
  
  let changed = false;
  toRemove.forEach(regex => {
    if (regex.test(content)) {
      content = content.replace(regex, '');
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log('Updated', file);
  }
});
