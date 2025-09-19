export function renderPage(config, version) {
  const bg = config.theme?.['background-color'] || '101010';
  const accent = config.theme?.['accent-color'] || 'caa0ff';
  const heading = '#fff';
  const primary = '#a0a0a0';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.title || 'Page'}</title>
  <link rel="stylesheet" href="/src/assets/common.css">
    <style>
    :root {
      --color-bg: #${bg};
      --color-accent: #${accent};
      --color-heading: ${heading};
      --color-primary: ${primary};
    }
  </style>
</head>
<body>
  <footer><span class="color-accent">Pilot</span> (v${version})</footer>
  <script src="https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js"></script>
  <script src="/src/assets/paint.js"></script>
</body>
</html>`;
}
