import { defineConfig } from "vite";
import viteCompression from "vite-plugin-compression";
import fs from "fs";
import path from "path";

function generateComponentEntries() {
  const entries = {};
  const componentsDir = path.resolve(__dirname, "templates/components");

  if (!fs.existsSync(componentsDir)) return entries;

  fs.readdirSync(componentsDir).forEach((dir) => {
    const scriptPath = path.join(componentsDir, dir, "script.js");
    if (fs.existsSync(scriptPath)) {
      entries[`js/components/${dir}`] = scriptPath;
    }
  });

  return entries;
}

function generatePageScriptEntries(basePath, outputPrefix) {
  const entries = {};
  if (!fs.existsSync(basePath)) return entries;

  const walk = (dir) => {
    fs.readdirSync(dir).forEach((file) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (file === "script.js") {
        const relative = path.relative(basePath, path.dirname(fullPath));
        const key = `${outputPrefix}/${relative.replace(/\\/g, "/")}`;
        entries[key] = fullPath;
      }
    });
  };

  walk(basePath);
  return entries;
}

const componentEntries = generateComponentEntries();
const pageScriptEntries = generatePageScriptEntries(
  path.resolve(__dirname, "templates/pages"),
  "js/pages",
);

// Manual entries (si quieres agregar más a mano)
const manualEntries = {
  app: path.resolve(__dirname, "src/js/app.js"),
};

export default defineConfig(({ command }) => ({
  base: command === "serve" ? "" : "/dist/",
  build: {
    manifest: true,
    outDir: "web/dist",
    emptyOutDir: false,
    rollupOptions: {
      input: {
        ...componentEntries,
        ...pageScriptEntries,
        ...manualEntries,
      },
      output: {
        entryFileNames: `[name].[hash].js`,
        assetFileNames: `[name].[hash].[ext]`,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@components": path.resolve(__dirname, "templates/components"),
      "@partials": path.resolve(__dirname, "templates/partials"),
    },
  },
  plugins: [
    viteCompression({
      filter: /\.(js|mjs|json|css|map)$/i,
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    origin: `${process.env.DDEV_PRIMARY_URL?.replace(/:\d+$/, "")}:5173`,
    cors: {
      origin: /https?:\/\/([A-Za-z0-9\-\.]+)?(\.ddev\.site)(?::\d+)?$/,
    },
  },
}));
