import express from "express";
import fs from "fs";
import yaml from "js-yaml";
import path from "path";

const app = express();
const port = 3000;

const appDir = path.join(process.cwd(), "app");

app.use("/assets", express.static(path.join(appDir, "assets")));

const configPath = path.join(appDir, "config.yml");
const config = yaml.load(fs.readFileSync(configPath, "utf8"));

const pages = [];

if (config.pages && config.pages.include) {
  for (const pageFile of config.pages.include) {
    const pagePath = path.join(appDir, pageFile);
    if (fs.existsSync(pagePath)) {
      const pageContent = yaml.load(fs.readFileSync(pagePath, "utf8"));
      pages.push(pageContent);
    }
  }
}

app.get("/:page?", (req, res) => {
  const pageName = req.params.page || "dashboard";
  const page = pages.find(p => p.name === pageName);
  if (!page) return res.status(404).send("Page not found");
  const style = `<link rel="stylesheet" href="${config.ui["stylesheet-path"]}">`;
  const accent = `<style>:root { --accent-color: ${config.ui["accent-color"]}; }</style>`;
  res.send(`<!DOCTYPE html><html><head>${style}${accent}</head><body>${page.html}</body></html>`);
});

app.listen(port);
