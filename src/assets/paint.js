const componentCache = {};
const pilot_version_reg = document.getElementById('pilot-version');

async function loadComponent(name) {
  if (componentCache[name]) {
    console.log(`[component] cache hit for '${name}'`);
    return componentCache[name];
  }

  console.log(`[component] fetching '${name}'`);
  const res = await fetch(`/src/components/${name}.html`);
  if (!res.ok) throw new Error(`Failed to load component: ${name}`);

  const text = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');

  const templateEl = doc.querySelector('template');
  if (!templateEl) throw new Error(`Malformed component: ${name}`);
  const template = templateEl.innerHTML.trim();

  const style = doc.querySelector('style')?.textContent?.trim();
  if (style && !document.querySelector(`style[data-comp="${name}"]`)) {
    console.log(`[component] injecting style for '${name}'`);
    const styleEl = document.createElement('style');
    styleEl.dataset.comp = name;
    styleEl.textContent = style;
    document.head.appendChild(styleEl);
  }

  const script = doc.querySelector('script')?.textContent?.trim() || null;
  if (script) console.log(`[component] found script for '${name}'`);

  componentCache[name] = { template, script };
  console.log(`[component] loaded '${name}'`);
  return componentCache[name];
}

async function makeComponent(c) {
  console.log(`[render] making component '${c.type}' with props:`, c);
  const { template, script } = await loadComponent(c.type);
  const html = template.replace(/{{(\w+)}}/g, (_, key) => c[key] ?? '');
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html.trim();

  const el = document.createElement('div');
  el.classList.add('component');
  while (wrapper.firstChild) el.appendChild(wrapper.firstChild);

  if (script) {
    console.log(`[render] executing script for '${c.type}'`);
    const fn = new Function('el', 'props', script);
    fn(el, c);
  }

  console.log(`[render] created component '${c.type}'`);
  return el;
}

async function render(page) {
  console.log("[render] page render started");
  const container = document.getElementById('pilot-container');
  if (!container) {
    console.warn("[render] no #pilot-container found");
    return;
  }
  container.innerHTML = '';

  if (page.title) {
    document.title = page.title;
    console.log(`[render] page title set "${page.title}"`);
  }

  const layoutWrapper = document.createElement('div');
  layoutWrapper.className = `layout layout-${page.layout || 'default'}`;

  if (page.layout === 'default') {
    const hAlign = page.align?.horizontal || 'center';
    const vAlign = page.align?.vertical || 'top';
    layoutWrapper.classList.add(`align-horizontal-${hAlign}`);
    layoutWrapper.classList.add(`align-vertical-${vAlign}`);
    console.log(`[render] using default layout, align=${hAlign}/${vAlign}`);
  } else if (page.layout === 'three-column') {
    console.log("[render] using three-column layout");
  }

  const comps = page.components || [];
  console.log(`[render] rendering ${comps.length} components`);

  if (page.layout === 'three-column') {
    const left = document.createElement('div');
    left.className = 'side-column';
    const middle = document.createElement('div');
    middle.className = 'main-column';
    const right = document.createElement('div');
    right.className = 'side-column';

    for (let i = 0; i < comps.length; i++) {
      const el = await makeComponent(comps[i]);
      if (i === 0) {
        console.log(`[render] placing first component '${comps[i].type}' in left column`);
        left.appendChild(el);
      } else if (i === comps.length - 1) {
        console.log(`[render] placing last component '${comps[i].type}' in right column`);
        right.appendChild(el);
      } else {
        console.log(`[render] placing middle component '${comps[i].type}'`);
        middle.appendChild(el);
      }
    }

    layoutWrapper.append(left, middle, right);
  } else {
    for (const c of comps) {
      const el = await makeComponent(c);
      console.log(`[render] appending component '${c.type}'`);
      layoutWrapper.appendChild(el);
    }
  }

  container.appendChild(layoutWrapper);
  console.log("[render] page render complete");
}

window.addEventListener('DOMContentLoaded', async () => {
  console.log("[pilot] DOMContentLoaded");
  const config = window.PILOT_CONFIG;
  if (!config.pages || !config.pages.length) {
    console.warn("[pilot] no pages defined in config");
    return;
  }

  console.log(`[pilot] fetching first page config: ${config.pages[0]}`);
  const res = await fetch(config.pages[0]);
  const text = await res.text();
  const page = jsyaml.load(text);
  console.log("[pilot] parsed page config:", page);
  render(page);
});

function checkPilotExt() {
  return new Promise((resolve) => {
    function handler(event) {
      if (event.source !== window) return;
      if (event.data && event.data.type === "PILOT_EXTENSION_PRESENT") {
        window.removeEventListener("message", handler);
        resolve(true);
      }
    }

    window.addEventListener("message", handler);
    window.postMessage({ type: "PILOT_CHECK" }, "*");

    setTimeout(() => {
      window.removeEventListener("message", handler);
      resolve(false);
    }, 500);
  });
}

function getPilotVersion() {
  try {
    return window.PILOT_CONFIG?.version || "unknown";
  } catch {
    return "unknown";
  }
}

checkPilotExt().then(installed => {
  if (installed) {
    console.log("[pilot] extension detected");
  } else {
    const extensionURL = "https://github.com/polylogue2/pilot-enhancer";
    console.warn(`[pilot] extension not detected. Install it on Firefox: %c${extensionURL}`, "color: #101010; text-decoration: none; ");
  }
});