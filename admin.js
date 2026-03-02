/**
 * Administration Callisto Arts
 * Identifiant et mot de passe : à modifier ici si besoin.
 */
const ADMIN_USERNAME = "callisto_admin";
const ADMIN_PASSWORD = "Midway_Shadow_2026";
const SESSION_KEY = "callisto_admin";

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

let portfolioData = { images: [] };
let contentData = {
  about: { intro: "" },
  contact: { company: "", address: "" },
};

// --- Auth ---
function isLoggedIn() {
  return sessionStorage.getItem(SESSION_KEY) === "ok";
}

function login(username, password) {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, "ok");
    return true;
  }
  return false;
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  showScreen("login");
}

function showScreen(name) {
  $("login-screen").classList.toggle("hidden", name !== "login");
  $("admin-screen").classList.toggle("hidden", name !== "admin");
  if (name === "admin") {
    initTabs();
    loadPortfolio();
    loadContent();
  }
}

// --- Login form ---
$("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const err = $("login-error");
  err.textContent = "";
  const username = $("admin-username").value.trim();
  const password = $("admin-password").value.trim();
  if (login(username, password)) {
    showScreen("admin");
    $("admin-username").value = "";
    $("admin-password").value = "";
  } else {
    err.textContent = "Identifiant ou mot de passe incorrect.";
  }
});

$("logout-btn").addEventListener("click", logout);

// --- Tabs ---
function initTabs() {
  $$(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.getAttribute("data-tab");
      $$(".tab").forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      $$(".panel").forEach((p) => {
        p.classList.remove("active");
        p.hidden = true;
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      const panel = $("panel-" + id);
      if (panel) {
        panel.classList.add("active");
        panel.hidden = false;
      }
    });
  });
}

// --- Portfolio ---
const PORTFOLIO_JSON_URL = "assets/images/portfolio_images.json";

async function loadPortfolio() {
  try {
    const res = await fetch(PORTFOLIO_JSON_URL);
    if (res.ok) {
      const data = await res.json();
      if (data && data.images) portfolioData = data;
    }
  } catch (_) {
    portfolioData = { images: [] };
  }
  renderPortfolioList();
}

function renderPortfolioList() {
  const list = $("portfolio-list");
  list.innerHTML = "";
  portfolioData.images.forEach((img, i) => {
    const row = document.createElement("div");
    row.className = "portfolio-row";
    row.innerHTML = `
            <span class="thumb"><img src="assets/images/${img.filename}" alt="" onerror="this.style.display='none'"></span>
            <span class="filename">${escapeHtml(img.filename)}</span>
            <span class="category">${escapeHtml(img.category)}</span>
            <span class="title">${escapeHtml(img.title || "—")}</span>
            <span class="year">${img.year || "—"}</span>
            <span class="actions">
                <button type="button" class="btn btn-small btn-edit" data-index="${i}">Modifier</button>
                <button type="button" class="btn btn-small btn-delete" data-index="${i}">Supprimer</button>
            </span>
        `;
    list.appendChild(row);
    row
      .querySelector(".btn-edit")
      .addEventListener("click", () => openImageModal(i));
    row
      .querySelector(".btn-delete")
      .addEventListener("click", () => deleteImage(i));
  });
}

function escapeHtml(s) {
  if (s == null) return "";
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function openImageModal(index) {
  const modal = $("modal-image");
  $("modal-image-title").textContent =
    index >= 0 ? "Modifier l’image" : "Ajouter une image";
  $("image-index").value =
    index === undefined || index === null ? "" : String(index);
  if (index >= 0 && portfolioData.images[index]) {
    const img = portfolioData.images[index];
    $("image-filename").value = img.filename || "";
    $("image-category").value = img.category || "digital";
    $("image-title").value = img.title || "";
    $("image-year").value = img.year || "";
    $("image-award").value = img.award || "";
  } else {
    $("form-image").reset();
    $("image-index").value = "";
  }
  modal.classList.remove("hidden");
}

function closeImageModal() {
  $("modal-image").classList.add("hidden");
}

function deleteImage(index) {
  if (confirm("Supprimer cette entrée du portfolio ?")) {
    portfolioData.images.splice(index, 1);
    renderPortfolioList();
  }
}

$("add-image-btn").addEventListener("click", () => openImageModal(-1));

$("form-image").addEventListener("submit", (e) => {
  e.preventDefault();
  const index = $("image-index").value;
  const entry = {
    filename: $("image-filename").value.trim(),
    category: $("image-category").value,
    title: $("image-title").value.trim() || undefined,
    year: $("image-year").value
      ? parseInt($("image-year").value, 10)
      : undefined,
    award: $("image-award").value.trim() || undefined,
  };
  if (entry.category === "logo") entry.isLogo = true;
  if (index !== "" && index >= 0) {
    portfolioData.images[parseInt(index, 10)] = entry;
  } else {
    portfolioData.images.push(entry);
  }
  closeImageModal();
  renderPortfolioList();
});

$$('.modal-actions [data-action="cancel"]').forEach((btn) => {
  btn.addEventListener("click", closeImageModal);
});
$("modal-image").addEventListener("click", (e) => {
  if (e.target.id === "modal-image") closeImageModal();
});

// --- Download portfolio JSON ---
function downloadPortfolioJson() {
  const blob = new Blob([JSON.stringify(portfolioData, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "portfolio_images.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

$("download-json-btn").addEventListener("click", downloadPortfolioJson);

// --- Load portfolio from file ---
$("load-json-btn").addEventListener("click", () =>
  $("load-json-input").click(),
);
$("load-json-input").addEventListener("change", (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const data = JSON.parse(r.result);
      if (data && data.images) {
        portfolioData = data;
        renderPortfolioList();
        alert(
          "JSON chargé. Pensez à télécharger pour enregistrer dans le projet.",
        );
      } else {
        alert(
          'Format invalide : le fichier doit contenir un tableau "images".',
        );
      }
    } catch (err) {
      alert("Fichier JSON invalide.");
    }
  };
  r.readAsText(f);
  e.target.value = "";
});

// --- Content (textes) ---
const CONTENT_JSON_URL = "content.json";

async function loadContent() {
  try {
    const res = await fetch(CONTENT_JSON_URL);
    if (res.ok) {
      const data = await res.json();
      if (data) contentData = data;
    }
  } catch (_) {}
  $("about-intro").value = (contentData.about && contentData.about.intro) || "";
  $("contact-company").value =
    (contentData.contact && contentData.contact.company) || "GPO SARL";
  $("contact-address").value =
    (contentData.contact && contentData.contact.address) ||
    "Châlons-en-Champagne, France";
}

function saveContentFromForm() {
  contentData = {
    about: { intro: $("about-intro").value.trim() },
    contact: {
      company: $("contact-company").value.trim(),
      address: $("contact-address").value.trim(),
    },
  };
}

function downloadContentJson() {
  saveContentFromForm();
  const blob = new Blob([JSON.stringify(contentData, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "content.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

$("download-content-btn").addEventListener("click", downloadContentJson);

$("load-content-btn").addEventListener("click", () =>
  $("load-content-input").click(),
);
$("load-content-input").addEventListener("change", (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const data = JSON.parse(r.result);
      if (data) {
        contentData = data;
        $("about-intro").value =
          (contentData.about && contentData.about.intro) || "";
        $("contact-company").value =
          (contentData.contact && contentData.contact.company) || "";
        $("contact-address").value =
          (contentData.contact && contentData.contact.address) || "";
        alert("content.json chargé.");
      }
    } catch (err) {
      alert("Fichier JSON invalide.");
    }
  };
  r.readAsText(f);
  e.target.value = "";
});

// --- Init ---
if (isLoggedIn()) {
  showScreen("admin");
} else {
  showScreen("login");
}
