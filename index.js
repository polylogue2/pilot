import express from 'express';
import { renderPage, getFirstPage } from './render.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use('/app/assets', express.static(path.join(__dirname, 'app', 'assets')));

app.get('/:page', async (req, res) => {
  const { page } = req.params;
  try {
    const { status, html } = await renderPage(page);
    res.status(status).send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send('<h1>Server error</h1>');
  }
});

app.get('/', async (req, res) => {
  try {
    const firstPage = await getFirstPage();
    if (!firstPage) return res.status(404).send('<h1>No pages configured</h1>');
    res.redirect(`/${firstPage}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('<h1>Server error</h1>');
  }
});

app.listen(PORT, () => {
  console.log(`Pilot Dashboard running on http://localhost:${PORT}`);
});
