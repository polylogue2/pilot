import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import yaml from 'yaml';
import { renderPage } from './src/render.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const configPath = path.join(__dirname, 'src', 'config.yml');
const config = yaml.parse(fs.readFileSync(configPath, 'utf-8'));

app.use('/src', express.static(path.join(__dirname, 'src')));

app.use((req, res, next) => {
  res.setHeader('Server', 'Pilot');
  next();
});

app.get('/', (req, res) => {
  res.send(renderPage(config, version));
});

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
const version = packageJson.version;

const PORT = config.gen?.port || 3000;
app.listen(PORT, () => {
  console.log(`Pilot v${version} running on http://localhost:${PORT}`);
});
