const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'template.html');
const indexPath = path.join(__dirname, 'index.html');
const slidesDir = path.join(__dirname, 'slides');

if (!fs.existsSync(templatePath)) {
  console.error("Error: template.html not found! Run split.js first to initialize.");
  process.exit(1);
}

if (!fs.existsSync(slidesDir)) {
  console.error("Error: slides directory not found!");
  process.exit(1);
}

// Read template
const template = fs.readFileSync(templatePath, 'utf8');

// Read and sort slides
const slideFiles = fs.readdirSync(slidesDir)
  .filter(file => file.endsWith('.html'))
  .sort();

console.log(`Found ${slideFiles.length} slides to merge...`);

const slidesContent = slideFiles.map(file => {
  console.log(`Reading: ${file}`);
  return fs.readFileSync(path.join(slidesDir, file), 'utf8').trim();
}).join('\n\n    ');

// Replace placeholder
const placeholder = '<!-- SLIDES_PLACEHOLDER -->';
if (!template.includes(placeholder)) {
  console.error("Error: template.html does not contain <!-- SLIDES_PLACEHOLDER -->");
  process.exit(1);
}

const mergedContent = template.replace(placeholder, slidesContent);

// Write to index.html
fs.writeFileSync(indexPath, mergedContent, 'utf8');
console.log("Successfully built index.html!");
