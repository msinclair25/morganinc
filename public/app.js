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
  const map = {
    shipped: "Shipped",
    wip: "In progress",
    archived: "Archived",
  };
  return map[status] || status || "";
}

function contactItems(contact) {
  const items = [];
  if (contact?.email) {
    items.push({
      href: `mailto:${contact.email}`,
      label: "Email",
      full: contact.email,
      external: false,
    });
  }
  if (contact?.github) {
    items.push({
      href: contact.github,
      label: "GitHub",
      full: "GitHub",
      external: true,
    });
  }
  if (contact?.linkedin) {
    items.push({
      href: contact.linkedin,
      label: "LinkedIn",
      full: "LinkedIn",
      external: true,
    });
  }
  if (contact?.x) {
    items.push({
      href: contact.x,
      label: "X",
      full: "X",
      external: true,
    });
  }
  return items;
}

function linkAttrs(item) {
  return item.external ? ` target="_blank" rel="noopener noreferrer"` : "";
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
      const linkRow = links.length
        ? `<div class="work-links">${links.join("")}</div>`
        : "";

      const status = p.status
        ? `<span class="status">${escapeHtml(statusLabel(p.status))}</span>`
        : "";

      return `
        <li class="work-item">
          <div class="work-meta">
            <h3>${escapeHtml(p.title)}</h3>
            ${status}
          </div>
          <p class="summary">${escapeHtml(p.summary || "")}</p>
          ${tags}
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
  const items = contactItems(contact);

  const listHtml = (useFull) => {
    if (!items.length) {
      return `<li><a href="https://github.com/msinclair25" target="_blank" rel="noopener noreferrer">GitHub</a></li>`;
    }
    return items
      .map((item) => {
        const text = useFull && item.label === "Email" ? item.full : item.label;
        return `<li><a href="${escapeHtml(item.href)}"${linkAttrs(item)}>${escapeHtml(text)}</a></li>`;
      })
      .join("");
  };

  const header = document.getElementById("header-socials");
  if (header) header.innerHTML = listHtml(false);

  const contactList = document.getElementById("contact-links");
  if (contactList) contactList.innerHTML = listHtml(true);

  if (contact?.body) {
    const intro = document.getElementById("contact-intro");
    if (intro) {
      intro.textContent = contact.body.split("\n")[0] || intro.textContent;
    }
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
    console.warn("Content load failed; using fallbacks.", err);
    renderProjects([]);
    renderContact({ github: "https://github.com/msinclair25" });
  }
}

boot();
