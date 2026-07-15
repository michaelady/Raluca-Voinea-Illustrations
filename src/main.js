const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");
const filters = document.querySelectorAll("[data-filter]");
const pieces = document.querySelectorAll(".piece");
const lightboxDialog = document.querySelector("[data-lightbox-dialog]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxCaption = document.querySelector("[data-lightbox-caption]");
const lightboxClose = document.querySelector("[data-lightbox-close]");
const form = document.querySelector("[data-contact-form]");
const formNote = document.querySelector("[data-form-note]");

function onScroll() {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
}

function closeMobileNav() {
  if (!mobileNav || !menuToggle) return;
  mobileNav.hidden = true;
  menuToggle.classList.remove("is-open");
  menuToggle.setAttribute("aria-label", "Open menu");
}

menuToggle?.addEventListener("click", () => {
  const open = mobileNav.hidden;
  mobileNav.hidden = !open;
  menuToggle.classList.toggle("is-open", open);
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});

mobileNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMobileNav);
});

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
  { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
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
    `Thanks, ${name}. Open Instagram to message <a href="https://www.instagram.com/ralu.voinea/" target="_blank" rel="noopener noreferrer">@ralu.voinea</a>, ` +
    `or use the <a href="https://ralucavoinea.artweb.com/contact" target="_blank" rel="noopener noreferrer">Artweb contact form</a>. ` +
    `<a href="mailto:?subject=${subject}&body=${body}">Draft an email</a> with your note if you prefer.`;

  form.reset();
});

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
