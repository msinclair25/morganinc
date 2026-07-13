/**
 * Parse content/*.md → public/data/site.json for the static portfolio.
 * Frontmatter is simple YAML (key: value, arrays, nested links).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const contentDir = path.join(root, "content");
const outDir = path.join(root, "public", "data");
const outFile = path.join(outDir, "site.json");

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw.trim() };

  const yaml = match[1];
  const body = match[2].trim();
  const data = {};
  const lines = yaml.split(/\r?\n/);
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith("#")) {
      i++;
      continue;
    }

    // Nested block: key:\n  child: value
    const nest = line.match(/^([A-Za-z0-9_]+):\s*$/);
    if (nest) {
      const key = nest[1];
      const obj = {};
      i++;
      while (i < lines.length) {
        const child = lines[i].match(/^\s+([A-Za-z0-9_]+):\s*(.*)$/);
        if (!child) break;
        obj[child[1]] = coerce(child[2]);
        i++;
      }
      data[key] = obj;
      continue;
    }

    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (kv) {
      data[kv[1]] = coerce(kv[2]);
    }
    i++;
  }

  return { data, body };
}

function coerce(value) {
  const v = value.trim();
  if (v === "" || v === "null" || v === "~") return null;
  if (v === "true") return true;
  if (v === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  // [a, b, c]
  if (v.startsWith("[") && v.endsWith("]")) {
    const inner = v.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((s) => s.trim().replace(/^["']|["']$/g, ""));
  }
  return v.replace(/^["']|["']$/g, "");
}

function readMd(rel) {
  const full = path.join(contentDir, rel);
  if (!fs.existsSync(full)) return null;
  const raw = fs.readFileSync(full, "utf8");
  return parseFrontmatter(raw);
}

function loadProjects() {
  const dir = path.join(contentDir, "projects");
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), "utf8");
      const { data, body } = parseFrontmatter(raw);
      return {
        slug: f.replace(/\.md$/, ""),
        ...data,
        body,
      };
    })
    .filter((p) => p.title)
    .sort((a, b) => {
      const ao = a.order ?? 99;
      const bo = b.order ?? 99;
      if (ao !== bo) return ao - bo;
      return String(a.title).localeCompare(String(b.title));
    });
}

const about = readMd("about.md") || { data: {}, body: "" };
const contact = readMd("contact.md") || { data: {}, body: "" };
const projects = loadProjects();

const site = {
  generatedAt: new Date().toISOString(),
  about: {
    ...about.data,
    body: about.body,
  },
  contact: {
    ...contact.data,
    body: contact.body,
  },
  projects: projects.map((p) => ({
    slug: p.slug,
    title: p.title,
    status: p.status ?? "wip",
    featured: p.featured !== false,
    order: p.order ?? 99,
    stack: p.stack ?? [],
    links: p.links ?? {},
    summary: p.summary ?? "",
    body: p.body ?? "",
  })),
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(site, null, 2) + "\n", "utf8");
console.log(
  `Wrote ${path.relative(root, outFile)} (${site.projects.length} projects)`,
);
