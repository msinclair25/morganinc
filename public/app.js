const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function bodyToHtml(body) {
  if (!body) return "";
  return body
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed || trimmed.startsWith("##") || trimmed.startsWith("###")) {
        return "";
      }
      if (trimmed.startsWith("- ")) return "";
      const html = escapeHtml(trimmed).replace(
        /\*\*(.+?)\*\*/g,
        "<strong>$1</strong>",
      );
      return `<p>${html.replaceAll("\n", "<br />")}</p>`;
    })
    .filter(Boolean)
    .join("");
}

function statusLabel(status) {
  return (
    {
      shipped: "Shipped",
      wip: "In progress",
      archived: "Archived",
    }[status] || status || ""
  );
}

function contactItems(contact) {
  const items = [];
  if (contact?.email) {
    items.push({ href: `mailto:${contact.email}`, label: "Email", full: contact.email });
  }
  if (contact?.github) {
    items.push({ href: contact.github, label: "GitHub", external: true });
  }
  if (contact?.linkedin) {
    items.push({ href: contact.linkedin, label: "LinkedIn", external: true });
  }
  if (contact?.x) {
    items.push({ href: contact.x, label: "X", external: true });
  }
  return items;
}

function extAttrs(item) {
  return item.external ? ` target="_blank" rel="noopener noreferrer"` : "";
}

function renderImpact(items) {
  const list = document.getElementById("impact-list");
  if (!list) return;

  if (!items?.length) {
    list.innerHTML = "";
    return;
  }

  list.innerHTML = items
    .map(
      (m) => `
      <li>
        <span class="metric-value">${escapeHtml(m.value)}</span>
        <span class="metric-label">${escapeHtml(m.label)}</span>
      </li>
    `,
    )
    .join("");
}

function renderProjects(projects) {
  const grid = document.getElementById("project-grid");
  if (!grid) return;

  const featured = (projects || []).filter((p) => p.featured !== false);
  if (!featured.length) {
    grid.innerHTML = `<li class="work-empty">Projects coming soon.</li>`;
    return;
  }

  grid.innerHTML = featured
    .map((p) => {
      const tags =
        Array.isArray(p.stack) && p.stack.length
          ? `<ul class="work-tags">${p.stack
              .map((s) => `<li>${escapeHtml(s)}</li>`)
              .join("")}</ul>`
          : "";

      const links = [];
      if (p.links?.live) {
        links.push(
          `<a href="${escapeHtml(p.links.live)}" target="_blank" rel="noopener noreferrer">Live</a>`,
        );
      }
      if (p.links?.repo) {
        links.push(
          `<a href="${escapeHtml(p.links.repo)}" target="_blank" rel="noopener noreferrer">Repo</a>`,
        );
      }

      const statusClass =
        p.status === "wip" ? "status-wip" : p.status === "shipped" ? "status-shipped" : "";

      return `
        <li class="work-item">
          <div class="work-top">
            <h3>${escapeHtml(p.title)}</h3>
            ${p.track ? `<span class="badge">${escapeHtml(p.track)}</span>` : ""}
            ${
              p.status
                ? `<span class="badge ${statusClass}">${escapeHtml(statusLabel(p.status))}</span>`
                : ""
            }
          </div>
          <p class="summary">${escapeHtml(p.summary || "")}</p>
          ${tags}
          ${links.length ? `<div class="work-links">${links.join("")}</div>` : ""}
        </li>
      `;
    })
    .join("");
}

function renderAbout(about) {
  if (about?.headline) {
    const el = document.getElementById("hero-eyebrow");
    if (el) el.textContent = about.headline;
  }
  if (about?.tagline) {
    const el = document.getElementById("hero-tagline");
    if (el) el.textContent = about.tagline;
  }
  if (about?.body) {
    const el = document.getElementById("about-body");
    if (el) el.innerHTML = bodyToHtml(about.body);
  }
}

function renderContact(contact) {
  const items = contactItems(contact);

  const html = (fullEmail) => {
    if (!items.length) {
      return `<li><a href="https://github.com/msinclair25" target="_blank" rel="noopener noreferrer">GitHub</a></li>`;
    }
    return items
      .map((item) => {
        const label =
          fullEmail && item.label === "Email" ? item.full : item.label;
        return `<li><a href="${escapeHtml(item.href)}"${extAttrs(item)}>${escapeHtml(label)}</a></li>`;
      })
      .join("");
  };

  const header = document.getElementById("header-socials");
  if (header) header.innerHTML = html(false);

  const contactList = document.getElementById("contact-links");
  if (contactList) contactList.innerHTML = html(true);

  if (contact?.body) {
    const intro = document.getElementById("contact-intro");
    if (intro) intro.textContent = contact.body.split("\n")[0] || intro.textContent;
  }
}

const CLI_SCRIPT = [
  { type: "cmd", text: "whoami" },
  { type: "out", text: "morgan sinclair", cls: "ok" },
  { type: "cmd", text: "uptime" },
  { type: "out", text: "~30 years building infrastructure that scales", cls: "dim" },
  { type: "cmd", text: "focus" },
  { type: "out", text: "infra  ·  ai  ·  devops  ·  cloud", cls: "ok" },
  { type: "cmd", text: "status" },
  { type: "out", text: "ops ready", cls: "ok" },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function renderCliStatic(el) {
  const lines = [];
  for (const step of CLI_SCRIPT) {
    if (step.type === "cmd") {
      lines.push(
        `<span class="prompt">$</span> ${escapeHtml(step.text)}`,
      );
    } else {
      const cls = step.cls ? ` class="${step.cls}"` : "";
      lines.push(`<span${cls}>${escapeHtml(step.text)}</span>`);
    }
  }
  el.innerHTML = `${lines.join("\n")}\n<span class="prompt">$</span> <span class="cli-cursor" aria-hidden="true"></span>`;
}

async function runCliAnimation() {
  const el = document.getElementById("cli-body");
  if (!el) return;

  const reduced =
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  if (reduced) {
    renderCliStatic(el);
    return;
  }

  let html = "";
  el.innerHTML = `<span class="prompt">$</span> <span class="cli-cursor" aria-hidden="true"></span>`;

  for (const step of CLI_SCRIPT) {
    if (step.type === "cmd") {
      html += `<span class="prompt">$</span> `;
      el.innerHTML = `${html}<span class="cli-cursor" aria-hidden="true"></span>`;
      for (const ch of step.text) {
        html += escapeHtml(ch);
        el.innerHTML = `${html}<span class="cli-cursor" aria-hidden="true"></span>`;
        await sleep(28 + Math.random() * 32);
      }
      html += "\n";
      el.innerHTML = `${html}<span class="cli-cursor" aria-hidden="true"></span>`;
      await sleep(180);
    } else {
      await sleep(120);
      const cls = step.cls ? ` class="${step.cls}"` : "";
      html += `<span${cls}>${escapeHtml(step.text)}</span>\n`;
      el.innerHTML = `${html}<span class="cli-cursor" aria-hidden="true"></span>`;
      await sleep(220);
    }
  }

  el.innerHTML = `${html}<span class="prompt">$</span> <span class="cli-cursor" aria-hidden="true"></span>`;
}

async function boot() {
  try {
    const res = await fetch("/data/site.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(`site.json ${res.status}`);
    const site = await res.json();
    renderAbout(site.about);
    renderImpact(site.impact);
    renderProjects(site.projects);
    renderContact(site.contact);
  } catch (err) {
    console.warn(err);
    renderImpact([]);
    renderProjects([]);
    renderContact({ github: "https://github.com/msinclair25" });
  }

  void runCliAnimation();
}

boot();
