const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Minimal markdown-ish: paragraphs split on blank lines; **bold** */
function bodyToHtml(body) {
  if (!body) return "";
  return body
    .split(/\n{2,}/)
    .map((block) => {
      const html = escapeHtml(block.trim()).replace(
        /\*\*(.+?)\*\*/g,
        "<strong>$1</strong>",
      );
      return `<p>${html.replaceAll("\n", "<br />")}</p>`;
    })
    .join("");
}

function statusLabel(status) {
  const map = {
    shipped: "Shipped",
    wip: "In progress",
    archived: "Archived",
  };
  return map[status] || status || "Project";
}

function renderProjects(projects) {
  const grid = document.getElementById("project-grid");
  if (!grid) return;

  const featured = (projects || []).filter((p) => p.featured !== false);

  if (!featured.length) {
    grid.innerHTML = `
      <li class="project-card placeholder">
        <span class="tag">Vault</span>
        <h3>Projects incoming</h3>
        <p>
          Add a note under <code>content/projects/</code> with frontmatter
          (<code>title</code>, <code>summary</code>, optional links) and redeploy.
        </p>
      </li>
      <li class="project-card placeholder">
        <span class="tag">Template</span>
        <h3>Use the project template</h3>
        <p>
          Copy <code>content/_templates/project.md</code> into
          <code>content/projects/your-slug.md</code>.
        </p>
      </li>
    `;
    return;
  }

  grid.innerHTML = featured
    .map((p) => {
      const stack =
        Array.isArray(p.stack) && p.stack.length
          ? `<ul class="stack">${p.stack
              .map((s) => `<li>${escapeHtml(s)}</li>`)
              .join("")}</ul>`
          : "";

      const links = [];
      if (p.links?.live)
        links.push(
          `<a href="${escapeHtml(p.links.live)}" target="_blank" rel="noopener noreferrer">Live</a>`,
        );
      if (p.links?.repo)
        links.push(
          `<a href="${escapeHtml(p.links.repo)}" target="_blank" rel="noopener noreferrer">Repo</a>`,
        );
      const linkRow = links.length
        ? `<div class="card-links">${links.join("")}</div>`
        : "";

      return `
        <li class="project-card">
          <span class="tag">${escapeHtml(statusLabel(p.status))}</span>
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml(p.summary || "")}</p>
          ${stack}
          ${linkRow}
        </li>
      `;
    })
    .join("");
}

function renderAbout(about) {
  if (about?.headline) {
    const eye = document.getElementById("hero-eyebrow");
    if (eye) eye.textContent = about.headline;
  }
  if (about?.tagline) {
    const lede = document.getElementById("hero-tagline");
    if (lede) lede.textContent = about.tagline;
  }
  if (about?.body) {
    const el = document.getElementById("about-body");
    if (el) el.innerHTML = bodyToHtml(about.body);
  }
}

function renderContact(contact) {
  const wrap = document.getElementById("contact-links");
  if (!wrap) return;

  const items = [];
  if (contact?.email) {
    items.push({
      href: `mailto:${contact.email}`,
      label: contact.email,
      kind: "Email",
    });
  }
  if (contact?.github) {
    items.push({
      href: contact.github,
      label: "GitHub",
      kind: "Code",
      external: true,
    });
  }
  if (contact?.linkedin) {
    items.push({
      href: contact.linkedin,
      label: "LinkedIn",
      kind: "Professional",
      external: true,
    });
  }
  if (contact?.x) {
    items.push({
      href: contact.x,
      label: "X",
      kind: "Social",
      external: true,
    });
  }

  if (!items.length) {
    wrap.innerHTML = `
      <a class="btn primary" href="https://github.com/msinclair25" target="_blank" rel="noopener noreferrer">
        GitHub · msinclair25
      </a>
      <p class="contact-note">Email, LinkedIn, and X will appear here once set in the vault.</p>
    `;
    return;
  }

  wrap.innerHTML = items
    .map((item, i) => {
      const cls = i === 0 ? "btn primary" : "btn ghost";
      const ext = item.external
        ? ` target="_blank" rel="noopener noreferrer"`
        : "";
      return `<a class="${cls}" href="${escapeHtml(item.href)}"${ext}>${escapeHtml(item.label)}</a>`;
    })
    .join("");

  if (contact?.body) {
    const intro = document.getElementById("contact-intro");
    if (intro) intro.textContent = contact.body.split("\n")[0] || intro.textContent;
  }
}

async function boot() {
  try {
    const res = await fetch("/data/site.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(`site.json ${res.status}`);
    const site = await res.json();
    renderAbout(site.about);
    renderProjects(site.projects);
    renderContact(site.contact);
  } catch (err) {
    console.warn("Content load failed; using embedded fallbacks.", err);
    renderProjects([]);
    renderContact({ github: "https://github.com/msinclair25" });
  }
}

boot();
