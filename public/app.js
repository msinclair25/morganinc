const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

const prefersReduced =
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

const ACCENTS = ["gold", "cyan", "ember", "violet"];

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
  return map[status] || status || "Project";
}

function padIndex(n) {
  return String(n).padStart(2, "0");
}

function initReveal() {
  const nodes = document.querySelectorAll("[data-reveal]");
  if (!nodes.length) return;

  if (prefersReduced || !("IntersectionObserver" in window)) {
    nodes.forEach((n) => n.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
  );

  nodes.forEach((n) => io.observe(n));
}

function renderProjects(projects) {
  const grid = document.getElementById("project-grid");
  if (!grid) return;

  const featured = (projects || []).filter((p) => p.featured !== false);

  if (!featured.length) {
    grid.innerHTML = `
      <li class="project-card placeholder" data-accent="gold" data-reveal>
        <div class="project-main">
          <div class="project-top"><span class="tag">Vault</span></div>
          <h3>Projects incoming</h3>
          <p class="summary">
            Add a note under <code>content/projects/</code> and redeploy.
          </p>
        </div>
      </li>
    `;
    initReveal();
    return;
  }

  grid.innerHTML = featured
    .map((p, i) => {
      const accent = ACCENTS[i % ACCENTS.length];
      const stack =
        Array.isArray(p.stack) && p.stack.length
          ? `<ul class="stack">${p.stack
              .map((s) => `<li>${escapeHtml(s)}</li>`)
              .join("")}</ul>`
          : "";

      const actions = [];
      if (p.links?.live) {
        actions.push(
          `<a class="primary-link" href="${escapeHtml(p.links.live)}" target="_blank" rel="noopener noreferrer">Open live <span aria-hidden="true">↗</span></a>`,
        );
      }
      if (p.links?.repo) {
        actions.push(
          `<a href="${escapeHtml(p.links.repo)}" target="_blank" rel="noopener noreferrer">Repo <span aria-hidden="true">↗</span></a>`,
        );
      }

      const tagClass = p.status === "wip" ? "tag wip" : "tag";

      return `
        <li class="project-card" data-accent="${accent}" data-reveal style="--delay: ${i * 50}ms">
          <div class="project-num" aria-hidden="true">${padIndex(i + 1)}</div>
          <div class="project-main">
            <div class="project-top">
              <span class="${tagClass}">${escapeHtml(statusLabel(p.status))}</span>
            </div>
            <h3>${escapeHtml(p.title)}</h3>
            <p class="summary">${escapeHtml(p.summary || "")}</p>
            ${stack}
          </div>
          ${
            actions.length
              ? `<div class="project-actions">${actions.join("")}</div>`
              : ""
          }
        </li>
      `;
    })
    .join("");

  initReveal();
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
      label: "msinclair25",
      kind: "GitHub",
      external: true,
    });
  }
  if (contact?.linkedin) {
    items.push({
      href: contact.linkedin,
      label: "Morgan Sinclair",
      kind: "LinkedIn",
      external: true,
    });
  }
  if (contact?.x) {
    items.push({
      href: contact.x,
      label: "@morganinc",
      kind: "X",
      external: true,
    });
  }

  if (!items.length) {
    wrap.innerHTML = `
      <a class="contact-card" href="https://github.com/msinclair25" target="_blank" rel="noopener noreferrer">
        <span class="kind">GitHub</span>
        <span class="label">msinclair25</span>
      </a>
    `;
    return;
  }

  wrap.innerHTML = items
    .map((item) => {
      const ext = item.external
        ? ` target="_blank" rel="noopener noreferrer"`
        : "";
      return `
        <a class="contact-card" href="${escapeHtml(item.href)}"${ext}>
          <span class="kind">${escapeHtml(item.kind)}</span>
          <span class="label">${escapeHtml(item.label)}</span>
        </a>
      `;
    })
    .join("");

  if (contact?.body) {
    const intro = document.getElementById("contact-intro");
    if (intro) {
      intro.textContent = contact.body.split("\n")[0] || intro.textContent;
    }
  }
}

async function boot() {
  initReveal();

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
