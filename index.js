const express = require('express');
const { execSync } = require('child_process');
const app = express();
const PORT = 3000;

const { version } = require('./package.json');

let branch = 'unknown';
try {
  branch = execSync('git rev-parse --abbrev-ref HEAD')
    .toString()
    .trim();
} catch (err) {
  console.warn('Could not detect Git branch');
}

app.get('/', (req, res) => {
  res.send('Pilot');
});

app.listen(PORT, () => {
  console.log(`Pilot ${version} (${branch}) running on http://localhost:${PORT}`);
});
