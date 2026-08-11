const state = {
  data: null,
  activeFilter: "All",
  searchTerm: "",
  scope: {
    activeSignal: "temp",
    isPaused: false,
    startedAt: 0,
    animationId: null,
    samples: [],
  },
};

const selectors = {
  profileName: document.querySelector("[data-profile='name']"),
  profileRole: document.querySelector("[data-profile='role']"),
  profileTagline: document.querySelector("[data-profile='tagline']"),
  profileLocation: document.querySelector("[data-profile='location']"),
  profileBio: document.querySelector("[data-profile='bio']"),
  profileContact: document.querySelector("[data-profile='contact']"),
  profileHighlights: document.querySelector("[data-profile='highlights']"),
  skillsGrid: document.getElementById("skillsGrid"),
  experienceTimeline: document.getElementById("experienceTimeline"),
  certificationsGrid: document.getElementById("certificationsGrid"),
  projectsGrid: document.getElementById("projectsGrid"),
  projectFilters: document.getElementById("projectFilters"),
  projectSearch: document.getElementById("projectSearch"),
  galleryGrid: document.getElementById("galleryGrid"),
  contactPanel: document.getElementById("contactPanel"),
  footerLinks: document.getElementById("footerLinks"),
  modal: document.getElementById("projectModal"),
  modalBody: document.getElementById("modalBody"),
  themeToggle: document.getElementById("themeToggle"),
  printBtn: document.getElementById("printBtn"),
  downloadCv: document.getElementById("downloadCv"),
  labCanvas: document.getElementById("labCanvas"),
  scopePause: document.getElementById("scopePause"),
  scopeSignals: document.getElementById("scopeSignals"),
  scopeReadouts: document.getElementById("scopeReadouts"),
};

const buildContactLine = (label, value, link) => {
  const row = document.createElement("div");
  row.className = "meta-row";
  const labelSpan = document.createElement("span");
  labelSpan.textContent = `${label}: `;
  const valueSpan = document.createElement(link ? "a" : "span");
  valueSpan.textContent = value;
  if (link) {
    valueSpan.href = link;
    valueSpan.target = "_blank";
    valueSpan.rel = "noopener";
  }
  row.append(labelSpan, valueSpan);
  return row;
};

const renderProfile = (profile) => {
  selectors.profileName.textContent = profile.name;
  selectors.profileRole.textContent = profile.role;
  selectors.profileTagline.textContent = profile.tagline;
  selectors.profileLocation.textContent = profile.location;
  selectors.profileBio.textContent = profile.bio;
  selectors.profileContact.innerHTML = "";
  selectors.profileContact.append(
    buildContactLine("Correo", profile.contact.email, `mailto:${profile.contact.email}`),
    buildContactLine("Teléfono", profile.contact.phone, null),
    buildContactLine("LinkedIn", profile.contact.linkedin, profile.contact.linkedin),
    buildContactLine("GitHub", profile.contact.github, profile.contact.github)
  );

  selectors.profileHighlights.innerHTML = "";
  profile.highlights.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `<h3>${item.title}</h3><p>${item.description}</p>`;
    selectors.profileHighlights.appendChild(card);
  });
};

const renderSkills = (skills) => {
  selectors.skillsGrid.innerHTML = "";
  skills.forEach((skill) => {
    const card = document.createElement("div");
    card.className = "skill-card";
    const tags = skill.items
      .map((item) => {
        if (typeof item === "string") {
          return `<span class="badge">${item}</span>`;
        }
        return `<span class="badge"><strong>${item.name}</strong> · ${item.level}</span>`;
      })
      .join("");

    card.innerHTML = `<h3>${skill.category}</h3><div class="skill-tags">${tags}</div>`;
    selectors.skillsGrid.appendChild(card);
  });
};

const renderExperience = (experience) => {
  selectors.experienceTimeline.innerHTML = "";
  experience.forEach((role) => {
    const item = document.createElement("div");
    item.className = "timeline-item";
    item.innerHTML = `
      <span>${role.period}</span>
      <div>
        <h3>${role.title}</h3>
        <p>${role.company}</p>
        <p>${role.summary}</p>
      </div>
    `;
    selectors.experienceTimeline.appendChild(item);
  });
};

const renderCertifications = (certifications) => {
  selectors.certificationsGrid.innerHTML = "";
  certifications.forEach((cert) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `<h3>${cert.name}</h3><p>${cert.issuer}</p><p class="badge">${cert.year}</p>`;
    selectors.certificationsGrid.appendChild(card);
  });
};

const renderGallery = (gallery) => {
  selectors.galleryGrid.innerHTML = "";
  gallery.forEach((item) => {
    const card = document.createElement("div");
    card.className = "gallery-item";
    card.innerHTML = `<h3>${item.title}</h3><p>${item.description}</p><p class="badge">${item.tag}</p>`;
    selectors.galleryGrid.appendChild(card);
  });
};

const createProjectFilters = (projects) => {
  const filters = new Set(["All"]);
  projects.forEach((project) => {
    project.categories.forEach((cat) => filters.add(cat));
  });
  selectors.projectFilters.innerHTML = "";
  filters.forEach((filter) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = filter;
    btn.className = filter === state.activeFilter ? "active" : "";
    btn.addEventListener("click", () => {
      state.activeFilter = filter;
      updateProjectFilters();
      renderProjects();
    });
    selectors.projectFilters.appendChild(btn);
  });
};

const updateProjectFilters = () => {
  [...selectors.projectFilters.children].forEach((btn) => {
    btn.classList.toggle("active", btn.textContent === state.activeFilter);
  });
};

const renderProjects = () => {
  const projects = state.data.projects
    .filter((project) =>
      state.activeFilter === "All" ? true : project.categories.includes(state.activeFilter)
    )
    .filter((project) =>
      [project.title, project.description, project.stack.join(" "), project.categories.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(state.searchTerm.toLowerCase())
    );

  selectors.projectsGrid.innerHTML = "";

  projects.forEach((project) => {
    const card = document.createElement("article");
    card.className = "project-card";
    const stack = project.stack.map((item) => `<span class="badge">${item}</span>`).join("");
    card.innerHTML = `
      <div>
        <h3>${project.title}</h3>
        <p>${project.description}</p>
      </div>
      <div class="project-meta">${stack}</div>
      <button class="btn ghost" type="button" data-project="${project.id}">Ver detalle</button>
    `;
    selectors.projectsGrid.appendChild(card);
  });
};

const openModal = (project) => {
  selectors.modalBody.innerHTML = `
    <h3>${project.title}</h3>
    <p>${project.longDescription}</p>
    <div class="project-meta">
      ${project.stack.map((item) => `<span class="badge">${item}</span>`).join("")}
    </div>
    <h4>Retos</h4>
    <p>${project.challenges}</p>
    <h4>Solución</h4>
    <p>${project.solution}</p>
    <h4>Impacto</h4>
    <p>${project.impact}</p>
    <div class="project-meta">
      ${project.links
        .map((link) => `<a class="badge" href="${link.url}" target="_blank" rel="noopener">${link.label}</a>`)
        .join("")}
    </div>
  `;
  selectors.modal.classList.add("show");
  selectors.modal.setAttribute("aria-hidden", "false");
};

const closeModal = () => {
  selectors.modal.classList.remove("show");
  selectors.modal.setAttribute("aria-hidden", "true");
};

const renderContactPanel = (contact) => {
  selectors.contactPanel.innerHTML = `
    <h3>Contacto profesional</h3>
    <p>${contact.message}</p>
    <div class="project-meta">
      ${contact.channels
        .map((channel) => `<a class="badge" href="${channel.url}" target="_blank" rel="noopener">${channel.label}</a>`)
        .join("")}
    </div>
  `;
};

const renderFooterLinks = (links) => {
  selectors.footerLinks.innerHTML = links
    .map((link) => `<a href="${link.url}" target="_blank" rel="noopener">${link.label}</a>`)
    .join("");
};

const initThemeToggle = () => {
  const stored = localStorage.getItem("theme") || "dark";
  document.body.classList.toggle("theme-light", stored === "light");
  document.body.classList.toggle("theme-dark", stored !== "light");
  selectors.themeToggle.textContent = stored === "light" ? "Modo oscuro" : "Modo claro";

  selectors.themeToggle.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("theme-light");
    document.body.classList.toggle("theme-dark", !isLight);
    localStorage.setItem("theme", isLight ? "light" : "dark");
    selectors.themeToggle.textContent = isLight ? "Modo oscuro" : "Modo claro";
  });
};

const initPrintButtons = () => {
  selectors.printBtn.addEventListener("click", () => window.print());
};

const initProjectInteractions = () => {
  selectors.projectSearch.addEventListener("input", (event) => {
    state.searchTerm = event.target.value;
    renderProjects();
  });

  selectors.projectsGrid.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-project]");
    if (!button) return;
    const projectId = button.dataset.project;
    const project = state.data.projects.find((item) => item.id === projectId);
    if (project) {
      openModal(project);
    }
  });

  selectors.modal.addEventListener("click", (event) => {
    if (event.target.dataset.close) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && selectors.modal.classList.contains("show")) {
      closeModal();
    }
  });
};

const scopeSignals = [
  {
    id: "temp",
    label: "TEMP SUPPLY",
    unit: "degC",
    min: 12,
    max: 22,
    color: "#2de2d0",
    sample: (t) => 16.5 + Math.sin(t * 1.4) * 1.1 + Math.sin(t * 4.5) * 0.18,
  },
  {
    id: "pressure",
    label: "STATIC PRESS",
    unit: "inH2O",
    min: 0,
    max: 2.5,
    color: "#ffd166",
    sample: (t) => 1.25 + Math.sin(t * 2.1) * 0.22 + Math.sin(t * 9.0) * 0.04,
  },
  {
    id: "valve",
    label: "AO VALVE CMD",
    unit: "VDC",
    min: 0,
    max: 10,
    color: "#8be9fd",
    sample: (t) => 5 + Math.sin(t * 0.9) * 3.2 + Math.max(0, Math.sin(t * 2.8)) * 0.7,
  },
  {
    id: "current",
    label: "SENSOR LOOP",
    unit: "mA",
    min: 4,
    max: 20,
    color: "#ff79c6",
    sample: (t) => 12 + Math.sin(t * 1.2) * 5.3 + Math.sin(t * 7.2) * 0.35,
  },
];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getActiveScopeSignal = () =>
  scopeSignals.find((signal) => signal.id === state.scope.activeSignal) || scopeSignals[0];

const formatScopeValue = (value, signal) => `${value.toFixed(signal.unit === "degC" ? 1 : 2)} ${signal.unit}`;

const resizeScopeCanvas = () => {
  const canvas = selectors.labCanvas;
  const rect = canvas.getBoundingClientRect();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(320, Math.floor(rect.width * pixelRatio));
  canvas.height = Math.max(220, Math.floor(rect.height * pixelRatio));
};

const drawScopeGrid = (ctx, width, height) => {
  ctx.fillStyle = "#081018";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(45, 226, 208, 0.09)";
  ctx.lineWidth = 1;
  const columns = 10;
  const rows = 8;

  for (let i = 0; i <= columns; i += 1) {
    const x = (width / columns) * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let i = 0; i <= rows; i += 1) {
    const y = (height / rows) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(45, 226, 208, 0.22)";
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();
};

const renderScopeReadouts = (signal, samples) => {
  const latest = samples.at(-1)?.value ?? signal.sample(0);
  const values = samples.map((sample) => sample.value);
  const min = values.length ? Math.min(...values) : latest;
  const max = values.length ? Math.max(...values) : latest;
  const status = state.scope.isPaused ? "HOLD" : "LIVE";

  selectors.scopeReadouts.innerHTML = `
    <div><span>Signal</span><strong>${signal.label}</strong></div>
    <div><span>Value</span><strong>${formatScopeValue(latest, signal)}</strong></div>
    <div><span>Range</span><strong>${formatScopeValue(min, signal)} - ${formatScopeValue(max, signal)}</strong></div>
    <div><span>Status</span><strong>${status} · BACnet/IP OK</strong></div>
  `;
};

const drawScopeTrace = (ctx, signal, samples, width, height) => {
  if (samples.length < 2) return;

  ctx.strokeStyle = signal.color;
  ctx.lineWidth = Math.max(2, width / 380);
  ctx.shadowBlur = 12;
  ctx.shadowColor = signal.color;
  ctx.beginPath();

  samples.forEach((sample, index) => {
    const ratio = (sample.value - signal.min) / (signal.max - signal.min);
    const x = (index / (samples.length - 1)) * width;
    const y = height - clamp(ratio, 0, 1) * height;
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();
  ctx.shadowBlur = 0;
};

const drawScope = (timestamp) => {
  const canvas = selectors.labCanvas;
  const ctx = canvas.getContext("2d");
  const signal = getActiveScopeSignal();
  const elapsed = (timestamp - state.scope.startedAt) / 1000;
  const sampleCount = Math.max(90, Math.floor(canvas.width / 5));

  if (!state.scope.isPaused) {
    const value = clamp(signal.sample(elapsed), signal.min, signal.max);
    state.scope.samples.push({ t: elapsed, value });
    state.scope.samples = state.scope.samples.slice(-sampleCount);
  }

  drawScopeGrid(ctx, canvas.width, canvas.height);
  drawScopeTrace(ctx, signal, state.scope.samples, canvas.width, canvas.height);
  renderScopeReadouts(signal, state.scope.samples);
  state.scope.animationId = requestAnimationFrame(drawScope);
};

const setScopeSignal = (signalId) => {
  state.scope.activeSignal = signalId;
  state.scope.samples = [];
  [...selectors.scopeSignals.children].forEach((button) => {
    button.classList.toggle("active", button.dataset.signal === signalId);
  });
};

const initScope = () => {
  selectors.scopeSignals.innerHTML = "";
  scopeSignals.forEach((signal) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.signal = signal.id;
    button.textContent = signal.label;
    button.addEventListener("click", () => setScopeSignal(signal.id));
    selectors.scopeSignals.appendChild(button);
  });

  selectors.scopePause.addEventListener("click", () => {
    state.scope.isPaused = !state.scope.isPaused;
    selectors.scopePause.textContent = state.scope.isPaused ? "Reanudar" : "Pausar";
  });

  window.addEventListener("resize", resizeScopeCanvas);
  resizeScopeCanvas();
  setScopeSignal(state.scope.activeSignal);
  state.scope.startedAt = performance.now();
  state.scope.animationId = requestAnimationFrame(drawScope);
};

const initApp = async () => {
  const dataUrl = new URL("data.json", window.location.href);
  dataUrl.searchParams.set("v", Date.now().toString());
  const response = await fetch(dataUrl, { cache: "no-store" });
  state.data = await response.json();

  renderProfile(state.data.profile);
  renderSkills(state.data.skills);
  renderExperience(state.data.experience);
  renderCertifications(state.data.certifications);
  renderGallery(state.data.gallery);
  renderContactPanel(state.data.contact);
  renderFooterLinks(state.data.footerLinks);

  createProjectFilters(state.data.projects);
  renderProjects();
  initProjectInteractions();
  initThemeToggle();
  initPrintButtons();
  initScope();
};

initApp();
