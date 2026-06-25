const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'template.html');
const headerPath = path.join(__dirname, 'header.html');
const footerPath = path.join(__dirname, 'footer.html');
const indexPath = path.join(__dirname, 'index.html');
const slidesDir = path.join(__dirname, 'slides');

function build() {
  try {
    if (!fs.existsSync(templatePath)) {
      console.error("Error: template.html not found! Run split.js first to initialize.");
      return false;
    }

    if (!fs.existsSync(headerPath)) {
      console.error("Error: header.html not found!");
      return false;
    }

    if (!fs.existsSync(footerPath)) {
      console.error("Error: footer.html not found!");
      return false;
    }

    if (!fs.existsSync(slidesDir)) {
      console.error("Error: slides directory not found!");
      return false;
    }

    // Read template
    let mergedContent = fs.readFileSync(templatePath, 'utf8');

    // Read header & footer
    const headerContent = fs.readFileSync(headerPath, 'utf8').trim();
    const footerContent = fs.readFileSync(footerPath, 'utf8').trim();

    // Replace header & footer placeholders
    mergedContent = mergedContent.replace('<!-- HEADER_PLACEHOLDER -->', headerContent);
    mergedContent = mergedContent.replace('<!-- FOOTER_PLACEHOLDER -->', footerContent);

    // Read and sort slides
    const slideFiles = fs.readdirSync(slidesDir)
      .filter(file => file.endsWith('.html'))
      .sort();

    const slidesContent = slideFiles.map(file => {
      return fs.readFileSync(path.join(slidesDir, file), 'utf8').trim();
    }).join('\n\n    ');

    // Replace slides placeholder
    const slidesPlaceholder = '<!-- SLIDES_PLACEHOLDER -->';
    if (!mergedContent.includes(slidesPlaceholder)) {
      console.error("Error: template.html does not contain <!-- SLIDES_PLACEHOLDER -->");
      return false;
    }

    mergedContent = mergedContent.replace(slidesPlaceholder, slidesContent);

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
  console.log("👀 Watching for changes in template.html, header.html, footer.html and slides/... (Press Ctrl+C to stop)");
  
  let debounceTimeout;
  const triggerBuild = () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      console.log("🔄 Change detected. Rebuilding...");
      build();
    }, 150);
  };

  // Watch template, header, and footer files
  fs.watch(templatePath, triggerBuild);
  fs.watch(headerPath, triggerBuild);
  fs.watch(footerPath, triggerBuild);

  // Watch slides directory
  fs.watch(slidesDir, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.html')) {
      triggerBuild();
    }
  });
}
