const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

const prefersReduced =
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
const finePointer =
  window.matchMedia?.("(pointer: fine)").matches ?? false;

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

/* —— Custom cursor —— */
function initCursor() {
  if (prefersReduced || !finePointer) return;

  const ring = document.getElementById("cursor");
  const dot = document.getElementById("cursor-dot");
  if (!ring || !dot) return;

  document.body.classList.add("has-cursor", "cursor-on");

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let rx = x;
  let ry = y;

  window.addEventListener(
    "pointermove",
    (e) => {
      x = e.clientX;
      y = e.clientY;
      dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    },
    { passive: true },
  );

  const tick = () => {
    rx += (x - rx) * 0.18;
    ry += (y - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  const hoverSel = "a, button, .btn, .project-card, .contact-card, .pillars li";
  document.addEventListener("pointerover", (e) => {
    if (e.target.closest?.(hoverSel)) ring.classList.add("is-hover");
  });
  document.addEventListener("pointerout", (e) => {
    if (e.target.closest?.(hoverSel)) ring.classList.remove("is-hover");
  });
}

/* —— Magnetic buttons —— */
function initMagnetic() {
  if (prefersReduced || !finePointer) return;

  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * 0.18}px, ${dy * 0.22}px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  });
}

/* —— Scroll reveal —— */
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
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );

  nodes.forEach((n) => io.observe(n));
}

/* —— Constellation canvas —— */
function initConstellation() {
  const canvas = document.getElementById("constellation");
  if (!canvas || prefersReduced) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let w = 0;
  let h = 0;
  let points = [];
  let raf = 0;
  let mouse = { x: -9999, y: -9999 };

  function resize() {
    w = canvas.width = window.innerWidth * devicePixelRatio;
    h = canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    const count = Math.min(
      70,
      Math.floor((window.innerWidth * window.innerHeight) / 18000),
    );
    points = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.4 + 0.4,
    }));
  }

  function frame() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (const p of points) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
      if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;

      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 140) {
        p.x += dx * 0.01;
        p.y += dy * 0.01;
      }
    }

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i];
        const b = points[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 130) {
          const alpha = (1 - d / 130) * 0.18;
          ctx.strokeStyle = `rgba(232, 213, 163, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const p of points) {
      ctx.fillStyle = "rgba(232, 213, 163, 0.55)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    raf = requestAnimationFrame(frame);
  }

  resize();
  frame();
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener(
    "pointermove",
    (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    },
    { passive: true },
  );

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else raf = requestAnimationFrame(frame);
  });
}

/* —— Project pointer glow —— */
function bindCardGlow(card) {
  if (prefersReduced || !finePointer) return;
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
}

function renderProjects(projects) {
  const grid = document.getElementById("project-grid");
  if (!grid) return;

  const featured = (projects || []).filter((p) => p.featured !== false);
  const countEl = document.getElementById("stat-projects");
  if (countEl) countEl.textContent = padIndex(featured.length || 0);

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
        <li class="project-card" data-accent="${accent}" data-reveal style="--delay: ${i * 70}ms">
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

  grid.querySelectorAll(".project-card").forEach(bindCardGlow);
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
  initCursor();
  initMagnetic();
  initConstellation();
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
