const THEME_STORAGE_KEY = "headliners-theme";

export function resolveInitialTheme(storedTheme, prefersDark) {
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return prefersDark ? "dark" : "light";
}

export function oppositeTheme(theme) {
  return theme === "dark" ? "light" : "dark";
}

export function isValidEmail(value) {
  const email = String(value ?? "").trim();

  if (email.length === 0 || email.length > 254) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function readStoredTheme() {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeTheme(theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Theme persistence is optional; the UI still works when storage is blocked.
  }
}

function applyTheme(theme, toggle) {
  const isDark = theme === "dark";

  document.documentElement.classList.toggle("dark", isDark);
  toggle.setAttribute("aria-pressed", String(isDark));
  toggle.setAttribute(
    "aria-label",
    isDark ? "Switch to light theme" : "Switch to dark theme",
  );
}

function setupTheme() {
  const toggle = document.querySelector("#theme-toggle");

  if (!(toggle instanceof HTMLButtonElement)) {
    return;
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  let theme = resolveInitialTheme(readStoredTheme(), prefersDark);

  applyTheme(theme, toggle);

  toggle.addEventListener("click", () => {
    theme = oppositeTheme(theme);
    applyTheme(theme, toggle);
    storeTheme(theme);
  });
}

function setupMobileNavigation() {
  const button = document.querySelector("#mobile-menu-button");
  const menu = document.querySelector("#mobile-menu");

  if (!(button instanceof HTMLButtonElement) || !(menu instanceof HTMLElement)) {
    return;
  }

  const setOpen = (isOpen) => {
    button.setAttribute("aria-expanded", String(isOpen));
    button.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    menu.hidden = !isOpen;
  };

  button.addEventListener("click", () => {
    setOpen(button.getAttribute("aria-expanded") !== "true");
  });

  menu.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      setOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      button.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 801px)").matches) {
      setOpen(false);
    }
  });
}

function setupCarousel() {
  const carousel = document.querySelector("#carousel");
  const previous = document.querySelector("#previous");
  const next = document.querySelector("#next");

  if (
    !(carousel instanceof HTMLElement) ||
    !(previous instanceof HTMLButtonElement) ||
    !(next instanceof HTMLButtonElement)
  ) {
    return;
  }

  const getScrollAmount = () => {
    const firstCard = carousel.firstElementChild;

    if (!(firstCard instanceof HTMLElement)) {
      return carousel.clientWidth;
    }

    const gap = Number.parseFloat(window.getComputedStyle(carousel).columnGap || "0");
    return firstCard.getBoundingClientRect().width + gap;
  };

  const updateControls = () => {
    const tolerance = 2;
    previous.disabled = carousel.scrollLeft <= tolerance;
    next.disabled =
      carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - tolerance;
  };

  previous.addEventListener("click", () => {
    carousel.scrollBy({ left: -getScrollAmount(), behavior: "smooth" });
  });

  next.addEventListener("click", () => {
    carousel.scrollBy({ left: getScrollAmount(), behavior: "smooth" });
  });

  carousel.addEventListener("scroll", updateControls, { passive: true });
  window.addEventListener("resize", updateControls);
  updateControls();
}

function setupNewsletterDemo() {
  const form = document.querySelector("#newsletter-form");
  const input = document.querySelector("#email");
  const status = document.querySelector("#newsletter-status");

  if (
    !(form instanceof HTMLFormElement) ||
    !(input instanceof HTMLInputElement) ||
    !(status instanceof HTMLElement)
  ) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!isValidEmail(input.value)) {
      input.setAttribute("aria-invalid", "true");
      status.dataset.state = "error";
      status.textContent = "Enter a valid email address to try the demo.";
      input.focus();
      return;
    }

    input.removeAttribute("aria-invalid");
    status.dataset.state = "success";
    status.textContent = "Demo complete — your email was not sent or stored.";
    form.reset();
  });
}

function setupFooterYear() {
  const year = document.querySelector("#current-year");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
}

function init() {
  setupTheme();
  setupMobileNavigation();
  setupCarousel();
  setupNewsletterDemo();
  setupFooterYear();
}

if (typeof document !== "undefined") {
  init();
}
