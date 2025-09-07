import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

let configCache = null;
const componentCache = {};

const packageJson = JSON.parse(
  await fs.readFile(path.join(process.cwd(), 'package.json'), 'utf-8')
);
const version = packageJson.version;

async function loadConfig() {
  if (!configCache) {
    const configPath = path.join(process.cwd(), 'app', 'config.yml');
    const raw = await fs.readFile(configPath, 'utf-8');
    configCache = yaml.load(raw);
  }
  return configCache;
}

async function loadComponent(type) {
  const config = await loadConfig();
  const componentsDir = config.ui?.['components-path']
    ? path.join(process.cwd(), config.ui['components-path'])
    : path.join(process.cwd(), 'app', 'assets', 'components');

  const normalizedType = type.trim().toLowerCase();
  if (componentCache[normalizedType]) return componentCache[normalizedType];

  try {
    let filePath = path.join(componentsDir, `${normalizedType}.html`);

    try {
      const html = await fs.readFile(filePath, 'utf-8');
      componentCache[normalizedType] = html;
      console.log('Loaded component:', normalizedType, 'from', filePath);
      return html;
    } catch {
      const files = await fs.readdir(componentsDir);
      const match = files.find(f => f.toLowerCase() === `${normalizedType}.html`);
      if (!match) throw new Error(`Component not found: ${type}`);
      filePath = path.join(componentsDir, match);
      const html = await fs.readFile(filePath, 'utf-8');
      componentCache[normalizedType] = html;
      console.log('Loaded component:', normalizedType, 'from', filePath);
      return html;
    }
  } catch (err) {
    console.warn(err.message);
    return `<div>Unknown component: ${type}</div>`;
  }
}

export async function getFirstPage() {
  const config = await loadConfig();
  const includePages = config.pages?.include || [];
  if (!includePages.length) return null;
  return path.basename(includePages[0], '.yml');
}

export async function renderPage(pageName) {
  const config = await loadConfig();
  const includePages = config.pages?.include || [];
  const pageFile = includePages.find(p => path.basename(p, '.yml') === pageName);
  if (!pageFile) return { status: 404, html: `<h1>Page not found: ${pageName}</h1>` };

  const pagePath = path.join(process.cwd(), 'app', pageFile);
  const pageRaw = await fs.readFile(pagePath, 'utf-8');
  const pageConfig = yaml.load(pageRaw);

  const stylesheet = config.ui?.['stylesheet-path'] || '/assets/common.css';

  let containerClasses = 'container';
  if (pageConfig.align === 'center') containerClasses += ' align-center';
  if (pageConfig.vertical === 'center') containerClasses += ' vertical-center';

  const htmlComponents = await Promise.all(
    (pageConfig.components || []).map(async c => {
      let html = await loadComponent(c.type);
      if (c.placeholder) html = html.replace('{{placeholder}}', c.placeholder);
      return html;
    })
  );

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${pageConfig.title || 'Untitled Page'}</title>
      <link rel="stylesheet" href="${stylesheet}">
    </head>
    <body>
      <div class="${containerClasses}">
        ${htmlComponents.join('')}
      </div>
      <footer>
        <p class="footer-main">
          Pilot <a href="https://github.com/polylogue2/pilot/releases/tag/v${version}" target="_blank">(<span class="highlight">v${version}</span>)</a>
        </p>
      </footer>
    </body>
    </html>
  `;

  return { status: 200, html };
}

export { loadComponent, loadConfig, componentCache };
