import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

const CONFIG_PATH = path.join(process.cwd(), 'app', 'config.yml');

let configCache = null;

async function loadConfig() {
  if (!configCache) {
    const raw = await fs.readFile(CONFIG_PATH, 'utf-8');
    configCache = yaml.load(raw);
  }
  return configCache;
}

export async function getFirstPage() {
  const config = await loadConfig();
  const includePages = config.pages?.include || [];
  if (includePages.length === 0) return null;
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
  const accentColor = config.ui?.['accent-color'] || '#FFF';
  const stylesheet = config.ui?.['stylesheet-path'] || '';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${pageConfig.title || 'Untitled'}</title>
      ${stylesheet ? `<link rel="stylesheet" href="${stylesheet}">` : ''}
      <style>body { --accent-color: ${accentColor}; }</style>
    </head>
    <body>
      ${pageConfig.components?.map(c => c.type === 'searchbar' ? `<input type="text" placeholder="${c.placeholder || ''}">` : '').join('')}
    </body>
    </html>
  `;
  return { status: 200, html };
}
