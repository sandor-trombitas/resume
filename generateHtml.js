const fs = require('fs').promises;
const handlebars = require('handlebars');
const puppeteer = require('puppeteer');
const Turndown = require('turndown');

function htmlToMarkdown(html) {
  let markdown = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return markdown;
}

async function generateResume() {
  try {
    // Ensure the dist folder exists
    await fs.mkdir('dist', { recursive: true });

    // Read JSON data
    const resumeData = JSON.parse(await fs.readFile('resume.json', 'utf8'));

    // Read HTML template
    const templateHtml = await fs.readFile('template.hbs', 'utf8');

    // Compile template
    const template = handlebars.compile(templateHtml);

    // Render HTML with data
    const html = template(resumeData);

    // Save HTML file to dist folder
    await fs.writeFile('dist/resume.html', html);
    console.log('HTML generated successfully in dist folder');

    // Generate PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({ path: 'dist/resume.pdf', format: 'A4' });
    await browser.close();
    console.log('PDF generated successfully in dist folder');

    // Convert HTML to Markdown
    const turndown = new Turndown();
    const markdown = turndown.remove('style').turndown(html);

    // Save Markdown file to readme
    await fs.writeFile('README.md', markdown);
    console.log('Markdown generated successfully in README.md');
  } catch (error) {
    console.error('Error generating resume:', error);
  }
}

generateResume();
