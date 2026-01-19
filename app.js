import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";

const state = {
  data: null,
  activeFilter: "All",
  searchTerm: "",
  is3dEnabled: true,
  renderer: null,
  scene: null,
  camera: null,
  controls: null,
  raycaster: null,
  tooltipTargets: [],
  animationId: null,
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
  contactForm: document.getElementById("contactForm"),
  toggle3d: document.getElementById("toggle3d"),
  labCanvas: document.getElementById("labCanvas"),
  labTooltips: document.getElementById("labTooltips"),
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
    <h3>Canales directos</h3>
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
  const handlePrint = () => window.print();
  selectors.printBtn.addEventListener("click", handlePrint);
  selectors.downloadCv.addEventListener("click", handlePrint);
};

const initContactForm = (email) => {
  selectors.contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(selectors.contactForm);
    const subject = encodeURIComponent("Nuevo contacto desde portafolio");
    const body = encodeURIComponent(
      `Nombre: ${formData.get("name")}
Correo: ${formData.get("email")}

Mensaje:
${formData.get("message")}`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    selectors.contactForm.reset();
  });
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

const createTooltipTag = (text) => {
  const tag = document.createElement("span");
  tag.className = "tooltip-tag";
  tag.textContent = text;
  tag.dataset.label = text;
  return tag;
};

const setActiveTooltip = (label) => {
  [...selectors.labTooltips.children].forEach((tag) => {
    tag.classList.toggle("active", tag.dataset.label === label);
  });
};

const initTooltips = () => {
  selectors.labTooltips.innerHTML = "";
  ["BMS", "Automatización", "Código"].forEach((label) => {
    selectors.labTooltips.appendChild(createTooltipTag(label));
  });
  setActiveTooltip("BMS");
};

const init3DScene = () => {
  if (!state.is3dEnabled) {
    selectors.labCanvas.innerHTML = "";
    return;
  }

  const width = selectors.labCanvas.clientWidth;
  const height = selectors.labCanvas.clientHeight;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0c121a);

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(5, 4, 6);

  const renderer = new THREE.WebGLRenderer({ antialias: width > 600, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio > 1.5 ? 1.5 : window.devicePixelRatio);
  selectors.labCanvas.innerHTML = "";
  selectors.labCanvas.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 3.5;
  controls.maxDistance = 10;

  const ambient = new THREE.AmbientLight(0x7cf5ff, 0.6);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0x00d0c5, width > 600 ? 0.9 : 0.6);
  keyLight.position.set(5, 6, 2);
  scene.add(keyLight);

  const panelGeometry = new THREE.BoxGeometry(6, 0.3, 4);
  const panelMaterial = new THREE.MeshStandardMaterial({ color: 0x16212b, metalness: 0.6, roughness: 0.4 });
  const panel = new THREE.Mesh(panelGeometry, panelMaterial);
  panel.position.y = -0.2;
  scene.add(panel);

  const towerGeometry = new THREE.BoxGeometry(1, 2.2, 1);
  const towerMaterial = new THREE.MeshStandardMaterial({ color: 0x1b2a36, metalness: 0.7, roughness: 0.3 });
  const tower = new THREE.Mesh(towerGeometry, towerMaterial);
  tower.position.set(-1.8, 0.9, -0.8);
  scene.add(tower);

  const coilGeometry = new THREE.TorusGeometry(0.6, 0.18, 16, 60);
  const coilMaterial = new THREE.MeshStandardMaterial({ color: 0x2de2d0, emissive: 0x0c4f4f });
  const coil = new THREE.Mesh(coilGeometry, coilMaterial);
  coil.position.set(1.5, 0.6, 0.9);
  coil.rotation.x = Math.PI / 2;
  scene.add(coil);

  const coreGeometry = new THREE.CylinderGeometry(0.35, 0.35, 1.4, 18);
  const coreMaterial = new THREE.MeshStandardMaterial({ color: 0x0f6b6b, metalness: 0.2, roughness: 0.6 });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  core.position.set(1.5, 0.7, 0.9);
  scene.add(core);

  const nodeGeometry = new THREE.SphereGeometry(0.2, 24, 24);
  const nodeMaterial = new THREE.MeshStandardMaterial({ color: 0x00d0c5, emissive: 0x003e3b });
  const nodeA = new THREE.Mesh(nodeGeometry, nodeMaterial);
  nodeA.position.set(0.2, 0.5, -1.1);
  const nodeB = nodeA.clone();
  nodeB.position.set(-0.8, 0.5, 1.1);
  const nodeC = nodeA.clone();
  nodeC.position.set(2.2, 0.5, -0.6);
  scene.add(nodeA, nodeB, nodeC);

  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x1ddbbf });
  const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0.2, 0.5, -1.1),
    new THREE.Vector3(1.5, 0.6, 0.9),
  ]);
  const line = new THREE.Line(lineGeometry, lineMaterial);
  scene.add(line);

  const raycaster = new THREE.Raycaster();
  const tooltipTargets = [
    { mesh: tower, label: "BMS" },
    { mesh: coil, label: "Automatización" },
    { mesh: nodeA, label: "Código" },
  ];

  const onPointerMove = (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(tooltipTargets.map((item) => item.mesh));
    document.body.style.cursor = hits.length ? "pointer" : "default";
  };

  const onClick = (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(tooltipTargets.map((item) => item.mesh));
    if (hits.length) {
      const target = tooltipTargets.find((item) => item.mesh === hits[0].object);
      if (target) {
        setActiveTooltip(target.label);
      }
    }
  };

  renderer.domElement.addEventListener("pointermove", onPointerMove);
  renderer.domElement.addEventListener("click", onClick);

  const animate = () => {
    coil.rotation.z += 0.01;
    tower.rotation.y += 0.003;
    controls.update();
    renderer.render(scene, camera);
    state.animationId = requestAnimationFrame(animate);
  };
  animate();

  state.renderer = renderer;
  state.scene = scene;
  state.camera = camera;
  state.controls = controls;
  state.raycaster = raycaster;
  state.tooltipTargets = tooltipTargets;

  window.addEventListener("resize", () => {
    if (!state.renderer) return;
    const newWidth = selectors.labCanvas.clientWidth;
    const newHeight = selectors.labCanvas.clientHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  });
};

const destroy3DScene = () => {
  if (state.animationId) {
    cancelAnimationFrame(state.animationId);
  }
  if (state.renderer) {
    state.renderer.dispose();
  }
  selectors.labCanvas.innerHTML = "";
  state.renderer = null;
  state.scene = null;
  state.camera = null;
  state.controls = null;
};

const init3DToggle = () => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.innerWidth < 680;
  state.is3dEnabled = !(prefersReduced || isMobile);
  selectors.toggle3d.textContent = state.is3dEnabled ? "3D: ON" : "3D: OFF";

  selectors.toggle3d.addEventListener("click", () => {
    state.is3dEnabled = !state.is3dEnabled;
    selectors.toggle3d.textContent = state.is3dEnabled ? "3D: ON" : "3D: OFF";
    if (state.is3dEnabled) {
      init3DScene();
    } else {
      destroy3DScene();
    }
  });
};

const initApp = async () => {
  const response = await fetch("data.json");
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
  initContactForm(state.data.profile.contact.email);
  initThemeToggle();
  initPrintButtons();
  initTooltips();
  init3DToggle();
  if (state.is3dEnabled) {
    init3DScene();
  }
};

initApp();
