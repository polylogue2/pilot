const configUrl = '/src/config.yml';
let pages = {};
let currentPage = null;

async function loadConfig() {
  const res = await fetch(configUrl);
  const text = await res.text();
  const config = jsyaml.load(text);
  const pageFiles = config.pages || [];
  for (const file of pageFiles) {
    const pageRes = await fetch(`/src/${file}`);
    const pageText = await pageRes.text();
    pages[file] = jsyaml.load(pageText);
  }
  return config;
}

function render(page) {
  const root = document.body;
  root.innerHTML = '';
  const h1 = document.createElement('h1');
  h1.textContent = page.title || 'Untitled';
  root.appendChild(h1);
}

async function init() {
  const config = await loadConfig();
  const firstPageFile = config.pages[0];
  currentPage = pages[firstPageFile];
  render(currentPage);
}

function changePage(file) {
  if (!pages[file]) return;
  currentPage = pages[file];
  render(currentPage);
}

window.changePage = changePage;
init();
