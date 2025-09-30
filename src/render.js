export function renderPage(config, version) {
  const bg = config.theme?.['background-color'] || '101010';
  const accent = config.theme?.['accent-color'] || 'caa0ff';
  const heading = '#fff';
  const outline = '#202020'
  const primary = '#aaa';
  const placeholder = '#707070';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page</title>
  <link rel="icon" href="/src/assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/src/assets/common.css">
  <style>
    :root {
      --color-bg: #${bg};
      --color-accent: #${accent};
      --color-heading: ${heading};
      --color-primary: ${primary};
      --color-outline: ${outline};
      --color-placeholder: ${placeholder};
    }
  </style>
</head>
<body>
  <div id="pilot-container"></div>
  <footer>
    <span class="color-accent" id="pilot-version"><a href="https://github.com/polylogue2/pilot/releases/tag/v${version}">Pilot</a></span> (${version})
  </footer>

  <script src="https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js"></script>
  <script src="/src/assets/paint.js"></script>
  <script>
    window.PILOT_CONFIG = ${JSON.stringify(config)};
    window.PILOT_VERSION = "${version}";
  </script>
</body>
</html>`;
}
