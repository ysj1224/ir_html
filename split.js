const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'index.html');
const templatePath = path.join(__dirname, 'template.html');
const slidesDir = path.join(__dirname, 'slides');

if (!fs.existsSync(slidesDir)) {
  fs.mkdirSync(slidesDir);
}

const content = fs.readFileSync(inputPath, 'utf8');

// Find all slides using boundary split
const slideBoundaries = [
  { name: '01_cover.html', marker: '<!-- SLIDE 1: COVER -->' },
  { name: '02_problem.html', marker: '<!-- SLIDE 2: MARKET PROBLEM -->' },
  { name: '03_solution.html', marker: '<!-- SLIDE 3: SOLUTION (CENTRAL KITCHEN) -->' },
  { name: '04_trajectory.html', marker: '<!-- SLIDE 4: TRAJECTORY & PORTFOLIO -->' },
  { name: '05_economics.html', marker: '<!-- SLIDE 5: UNIT ECONOMICS (SIMULATION) -->' },
  { name: '06_growth.html', marker: '<!-- SLIDE 6: SCALE & VISION (RULE OF 56) -->' },
  { name: '07_financials.html', marker: '<!-- SLIDE 7: FINANCIALS & VALUATION -->' },
  { name: '08_investment.html', marker: '<!-- SLIDE 8: INVESTMENT & USE OF FUNDS -->' },
  { name: '09_outro.html', marker: '<!-- SLIDE 9: OUTRO -->' }
];

let currentIndex = content.indexOf(slideBoundaries[0].marker);
if (currentIndex === -1) {
  console.error("Could not find Slide 1 marker in index.html");
  process.exit(1);
}

const headerText = content.substring(0, currentIndex);

for (let i = 0; i < slideBoundaries.length; i++) {
  const current = slideBoundaries[i];
  const startIdx = content.indexOf(current.marker);
  
  let endIdx;
  if (i < slideBoundaries.length - 1) {
    endIdx = content.indexOf(slideBoundaries[i + 1].marker);
  } else {
    endIdx = content.indexOf('</main>');
  }

  if (startIdx === -1 || endIdx === -1) {
    console.error(`Error locating boundaries for ${current.name}`);
    process.exit(1);
  }

  const slideContent = content.substring(startIdx, endIdx).trim();
  fs.writeFileSync(path.join(slidesDir, current.name), slideContent + '\n', 'utf8');
  console.log(`Extracted: slides/${current.name}`);
}

const footerText = content.substring(content.indexOf('</main>'));

const templateContent = `${headerText}    <!-- SLIDES_PLACEHOLDER -->\n\n  ${footerText}`;
fs.writeFileSync(templatePath, templateContent, 'utf8');
console.log(`Created template.html`);
