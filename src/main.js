import { applyLanguage, getLanguage, initLanguageSwitcher, t } from "./i18n.js";

initLanguageSwitcher();

const header = document.querySelector("[data-header]");
const dockLinks = document.querySelectorAll("[data-dock-link]");
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
  if (!document.body.classList.contains("page-gallery")) {
    header?.classList.toggle("is-scrolled", window.scrollY > 16);
  }
  updateActiveDock();
}

function updateActiveDock() {
  if (!dockLinks.length || !sections.length) return;

  const marker = window.scrollY + window.innerHeight * 0.35;
  let activeId = "top";

  for (const section of sections) {
    const top = section.el.offsetTop;
    if (marker >= top) activeId = section.id;
  }

  dockLinks.forEach((link) => {
    const href = link.getAttribute("href") ?? "";
    if (!href.startsWith("#")) return;
    link.classList.toggle("is-active", href.replace("#", "") === activeId);
  });
}

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

const FORMSUBMIT_FORM_ID = "b989e55e267146abc54d97b5e2276618";
const CONTACT_INBOXES = [
  "raluca_voinea@outlook.com",
  "ralucapopescudumitrescu@gmail.com",
];
const FORMSUBMIT_ENDPOINTS = [FORMSUBMIT_FORM_ID, ...CONTACT_INBOXES];

function showFormNote(kind, html) {
  if (!formNote) return;
  formNote.hidden = false;
  formNote.classList.toggle("is-error", kind === "error");
  formNote.innerHTML = html;
}

function mailtoFallback(name, email, project, message) {
  const inbox = CONTACT_INBOXES[0];
  const subject = encodeURIComponent(t("formMailtoSubject", { project }));
  const body = encodeURIComponent(t("formMailtoBody", { name, project, email, message }));
  return t("formMailto", {
    mailto: `mailto:${inbox}?subject=${subject}&body=${body}`,
    inbox,
  });
}

function isFormSubmitSuccess(result) {
  return result?.success === true || result?.success === "true";
}

async function sendToInbox(inbox, payload) {
  const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(inbox)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams(payload),
  });
  const raw = await response.text();
  let result = {};
  try {
    result = JSON.parse(raw);
  } catch {
    const error = new Error(`Could not send to ${inbox}`);
    error.network = true;
    throw error;
  }
  if (!isFormSubmitSuccess(result)) {
    const detail = String(result?.message || `Could not send to ${inbox}`);
    const error = new Error(detail);
    error.activation = /activat|confirm|verify/i.test(detail);
    throw error;
  }
  return result;
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const project = String(data.get("project") || "").trim();
  const message = String(data.get("message") || "").trim();
  const honeypot = String(data.get("_honey") || "").trim();
  const submitButton = form.querySelector("[data-submit-button]");

  if (!name || !email || !project || !message) {
    showFormNote("error", t("formIncomplete"));
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showFormNote("error", t("formInvalidEmail"));
    return;
  }

  if (honeypot) {
    showFormNote("success", t("formHoneypot", { name }));
    form.reset();
    applyLanguage(getLanguage());
    return;
  }

  const payload = {
    name,
    email,
    project,
    message,
    language: t("languageName"),
    _replyto: email,
    _subject: t("formMailtoSubject", { project }),
    _template: "table",
    _captcha: "false",
  };

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = t("formSending");
  }
  showFormNote("success", t("formSendingNote"));

  try {
    const results = await Promise.allSettled(FORMSUBMIT_ENDPOINTS.map((inbox) => sendToInbox(inbox, payload)));
    const sent = results.filter((result) => result.status === "fulfilled");
    const failed = results.filter((result) => result.status === "rejected");

    if (sent.length > 0) {
      showFormNote("success", t("formThanks", { name, email }));
      form.reset();
      applyLanguage(getLanguage());
      return;
    }

    const activationNeeded = failed.some((result) => result.reason?.activation);
    if (activationNeeded) {
      showFormNote(
        "error",
        t("formActivation") + mailtoFallback(name, email, project, message)
      );
      return;
    }

    const networkFailure = failed.some((result) => result.reason?.network);
    if (networkFailure) {
      form.submit();
      return;
    }

    showFormNote("error", t("formFailed") + mailtoFallback(name, email, project, message));
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = t("formSubmit");
    }
  }
});

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
