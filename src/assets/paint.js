const componentCache = {};

async function loadComponent(name) {
  if (componentCache[name]) return componentCache[name];

  const res = await fetch(`/src/components/${name}.html`);
  if (!res.ok) throw new Error(`Failed to load component: ${name}`);

  const text = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');

  const templateEl = doc.querySelector('template');
  if (!templateEl) throw new Error(`No <template> in component: ${name}`);
  const template = templateEl.innerHTML.trim();

  const style = doc.querySelector('style')?.textContent?.trim();
  if (style && !document.querySelector(`style[data-comp="${name}"]`)) {
    const styleEl = document.createElement('style');
    styleEl.dataset.comp = name;
    styleEl.textContent = style;
    document.head.appendChild(styleEl);
  }

  const script = doc.querySelector('script')?.textContent?.trim() || null;

  componentCache[name] = { template, script };
  return componentCache[name];
}

async function makeComponent(c) {
  const { template, script } = await loadComponent(c.type);
  const html = template.replace(/{{(\w+)}}/g, (_, key) => c[key] ?? '');
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html.trim();

  const el = document.createElement('div');
  el.classList.add('component');
  while (wrapper.firstChild) el.appendChild(wrapper.firstChild);

  if (script) {
    const fn = new Function('el', 'props', script);
    fn(el, c);
  }

  return el;
}

async function render(page) {
  const container = document.getElementById('pilot-container');
  if (!container) return;
  container.innerHTML = '';

  if (page.title) {
    document.title = page.title;
  }

  const layoutWrapper = document.createElement('div');
  layoutWrapper.className = `layout layout-${page.layout || 'default'}`;

  if (page.layout === 'default') {
    const hAlign = page.align?.horizontal || 'center';
    const vAlign = page.align?.vertical || 'top';
    layoutWrapper.classList.add(`align-horizontal-${hAlign}`);
    layoutWrapper.classList.add(`align-vertical-${vAlign}`);
  }

  const comps = page.components || [];

  if (page.layout === 'three-column') {
    const left = document.createElement('div');
    left.className = 'side-column';
    const middle = document.createElement('div');
    middle.className = 'main-column';
    const right = document.createElement('div');
    right.className = 'side-column';

    for (let i = 0; i < comps.length; i++) {
      const el = await makeComponent(comps[i]);
      if (i === 0) left.appendChild(el);
      else if (i === comps.length - 1) right.appendChild(el);
      else middle.appendChild(el);
    }

    layoutWrapper.append(left, middle, right);
  } else {
    for (const c of comps) {
      const el = await makeComponent(c);
      layoutWrapper.appendChild(el);
    }
  }

  container.appendChild(layoutWrapper);
}


window.addEventListener('DOMContentLoaded', async () => {
  const config = window.PILOT_CONFIG;
  if (!config.pages || !config.pages.length) return;

  const res = await fetch(config.pages[0]);
  const text = await res.text();
  const page = jsyaml.load(text);
  render(page);
});
