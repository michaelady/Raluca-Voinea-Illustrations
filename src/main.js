const header = document.querySelector("[data-header]");
const dockLinks = document.querySelectorAll("[data-dock-link]");
const filters = document.querySelectorAll("[data-filter]");
const pieces = document.querySelectorAll(".piece");
const lightboxDialog = document.querySelector("[data-lightbox-dialog]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxCaption = document.querySelector("[data-lightbox-caption]");
const lightboxClose = document.querySelector("[data-lightbox-close]");
const form = document.querySelector("[data-contact-form]");
const formNote = document.querySelector("[data-form-note]");

const sections = [
  { id: "top", el: document.querySelector("#top") },
  { id: "work", el: document.querySelector("#work") },
  { id: "services", el: document.querySelector("#services") },
  { id: "about", el: document.querySelector("#about") },
  { id: "contact", el: document.querySelector("#contact") },
].filter((item) => item.el);

function onScroll() {
  header?.classList.toggle("is-scrolled", window.scrollY > 16);
  updateActiveDock();
}

function updateActiveDock() {
  if (!dockLinks.length) return;

  const marker = window.scrollY + window.innerHeight * 0.35;
  let activeId = "top";

  for (const section of sections) {
    const top = section.el.offsetTop;
    if (marker >= top) activeId = section.id;
  }

  dockLinks.forEach((link) => {
    const href = link.getAttribute("href")?.replace("#", "");
    link.classList.toggle("is-active", href === activeId);
  });
}

filters.forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.dataset.filter;
    filters.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
    });

    pieces.forEach((piece) => {
      const categories = piece.dataset.category?.split(/\s+/) ?? [];
      const show = value === "all" || categories.includes(value);
      piece.classList.toggle("is-hidden", !show);
    });
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
);

pieces.forEach((piece) => observer.observe(piece));

document.querySelectorAll("[data-lightbox]").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const image = trigger.querySelector("img");
    const title = trigger.querySelector(".piece-title")?.textContent?.trim() ?? "";
    if (!image || !lightboxDialog || !lightboxImage || !lightboxCaption) return;

    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = title;
    lightboxDialog.showModal();
  });
});

lightboxClose?.addEventListener("click", () => lightboxDialog?.close());

lightboxDialog?.addEventListener("click", (event) => {
  if (event.target === lightboxDialog) lightboxDialog.close();
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const project = String(data.get("project") || "").trim();
  const message = String(data.get("message") || "").trim();

  if (!name || !email || !project || !message) {
    formNote.hidden = false;
    formNote.textContent = "Please complete every field so Raluca can reply with context.";
    return;
  }

  const subject = encodeURIComponent(`Collaboration inquiry — ${project}`);
  const body = encodeURIComponent(
    `Hi Raluca,\n\nMy name is ${name}.\nProject type: ${project}\nEmail: ${email}\n\n${message}\n`
  );

  formNote.hidden = false;
  formNote.innerHTML =
    `Thanks, ${name}. Message <a href="https://www.instagram.com/ralu.voinea.illustration/" target="_blank" rel="noopener noreferrer">@ralu.voinea.illustration</a>, ` +
    `email <a href="mailto:raluca_voinea@outlook.com?subject=${subject}&body=${body}">raluca_voinea@outlook.com</a>, ` +
    `or use the <a href="https://ralucavoinea.artweb.com/contact" target="_blank" rel="noopener noreferrer">Artweb contact form</a>.`;

  form.reset();
});

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
