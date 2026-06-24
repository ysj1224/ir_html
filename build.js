const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'template.html');
const indexPath = path.join(__dirname, 'index.html');
const slidesDir = path.join(__dirname, 'slides');

function build() {
  try {
    if (!fs.existsSync(templatePath)) {
      console.error("Error: template.html not found! Run split.js first to initialize.");
      return false;
    }

    if (!fs.existsSync(slidesDir)) {
      console.error("Error: slides directory not found!");
      return false;
    }

    // Read template
    const template = fs.readFileSync(templatePath, 'utf8');

    // Read and sort slides
    const slideFiles = fs.readdirSync(slidesDir)
      .filter(file => file.endsWith('.html'))
      .sort();

    const slidesContent = slideFiles.map(file => {
      return fs.readFileSync(path.join(slidesDir, file), 'utf8').trim();
    }).join('\n\n    ');

    // Replace placeholder
    const placeholder = '<!-- SLIDES_PLACEHOLDER -->';
    if (!template.includes(placeholder)) {
      console.error("Error: template.html does not contain <!-- SLIDES_PLACEHOLDER -->");
      return false;
    }

    const mergedContent = template.replace(placeholder, slidesContent);

    // Write to index.html
    fs.writeFileSync(indexPath, mergedContent, 'utf8');
    console.log(`[${new Date().toLocaleTimeString()}] Built index.html successfully!`);
    return true;
  } catch (err) {
    console.error("Build failed:", err);
    return false;
  }
}

// Initial Build
build();

// Watch Mode
const args = process.argv.slice(2);
if (args.includes('--watch') || args.includes('watch') || args.includes('-w')) {
  console.log("👀 Watching for changes in template.html and slides/... (Press Ctrl+C to stop)");
  
  let debounceTimeout;
  const triggerBuild = () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      console.log("🔄 Change detected. Rebuilding...");
      build();
    }, 150);
  };

  // Watch template file
  fs.watch(templatePath, triggerBuild);

  // Watch slides directory
  fs.watch(slidesDir, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.html')) {
      triggerBuild();
    }
  });
}
