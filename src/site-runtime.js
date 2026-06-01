import { translations } from "./translations.js";

const geotestDotMap = [
  ["yellow", "blue", "blue", "blue"],
  ["blue", "yellow", "yellow", "yellow"],
  ["blue", "yellow", "yellow", "yellow", "blue"],
  ["blue", "yellow", "blue", "blue", "blue", "blue"],
  ["blue", "yellow", "yellow", "blue", "blue", "blue"],
  ["yellow", "blue", "blue", "blue", "blue"],
  [null, null, null, null, "blue"],
  [null, null, null, null, null, "blue"],
];

let cleanupHandlers = [];

const addCleanup = (handler) => {
  cleanupHandlers.push(handler);
};

const resetPageRuntime = () => {
  cleanupHandlers.forEach((handler) => handler());
  cleanupHandlers = [];
};

const createGeotestDots = ({ dotClass = "", radius = 18, gap = 43, startX = 55, startY = 64 } = {}) =>
  geotestDotMap
    .flatMap((row, rowIndex) =>
      row.map((color, columnIndex) => {
        if (!color) return "";

        const x = startX + columnIndex * gap;
        const y = startY + rowIndex * gap;
        const sequenceIndex =
          row.slice(0, columnIndex).filter(Boolean).length +
          geotestDotMap
            .slice(0, rowIndex)
            .reduce((total, currentRow) => total + currentRow.filter(Boolean).length, 0);
        const delay = 0.08 + sequenceIndex * 0.028;
        const style = dotClass ? ` style="--delay: ${delay}s"` : "";

        return `
          <g transform="translate(${x} ${y})">
            <circle class="${dotClass} dot-${color}"${style} r="${radius}" />
          </g>
        `;
      }),
    )
    .join("");

class GeotestNavbarLogo extends HTMLElement {
  connectedCallback() {
    const dots = createGeotestDots({
      radius: 9,
      gap: 20,
      startX: 18,
      startY: 18,
    });

    this.innerHTML = `
      <svg class="brand-logo" viewBox="0 0 390 170" role="img" aria-label="GEOtest Engineering">
        <g class="navbar-dot-icon">
          ${dots}
        </g>
        <text class="navbar-logo-text navbar-geotest-word" x="145" y="68">
          <tspan class="geo-text">GEO</tspan><tspan class="test-text">test</tspan>
        </text>
        <rect class="navbar-logo-line" x="147" y="78" width="178" height="5" rx="1" />
        <text class="navbar-logo-text navbar-engineering-word" x="148" y="118">Engineering</text>
      </svg>
    `;
  }
}

class GeotestLogoHeroReveal extends HTMLElement {
  connectedCallback() {
    const dots = createGeotestDots({ dotClass: "hero-logo-dot" });

    this.innerHTML = `
      <div class="geotest-hero-reveal" role="img" aria-label="GEOtest Engineering">
        <svg class="geotest-hero-logo-svg" viewBox="0 0 1040 430" aria-hidden="true">
          <defs>
            <filter id="heroLogoGlow" x="-16%" y="-18%" width="132%" height="136%">
              <feGaussianBlur stdDeviation="2.4" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="0 0 0 0 0.05 0 0 0 0 0.22 0 0 0 0 0.55 0 0 0 .24 0"
                result="glow"
              />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="heroLineGradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stop-color="#f28c00" />
              <stop offset="0.54" stop-color="#fff200" />
              <stop offset="1" stop-color="#f28c00" />
            </linearGradient>
          </defs>

          <g class="hero-dots-block" filter="url(#heroLogoGlow)">
            ${dots}
          </g>

          <g class="hero-wordmark-block" filter="url(#heroLogoGlow)">
            <text class="hero-logo-text hero-geotest-word" x="332" y="165">
              <tspan class="geo-text">GEO</tspan><tspan class="test-text">test</tspan>
            </text>
            <rect class="hero-orange-divider" x="334" y="185" width="620" height="13" rx="2" />
            <text class="hero-logo-text hero-engineering-word" x="335" y="304">Engineering</text>
          </g>
        </svg>
      </div>
    `;
  }
}

const defineLogoElements = () => {
  if (!customElements.get("geotest-navbar-logo")) {
    customElements.define("geotest-navbar-logo", GeotestNavbarLogo);
  }

  if (!customElements.get("geotest-logo-hero-reveal")) {
    customElements.define("geotest-logo-hero-reveal", GeotestLogoHeroReveal);
  }
};

const applyLanguage = (language, root = document) => {
  const dictionary = translations[language] || translations.en;
  document.documentElement.lang = language;

  root.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = dictionary[element.dataset.i18n];
    if (value) element.textContent = value;
  });

  root.querySelectorAll("[data-i18n-html]").forEach((element) => {
    const value = dictionary[element.dataset.i18nHtml];
    if (value) element.innerHTML = value;
  });

  root.querySelectorAll("[data-i18n-title]").forEach((element) => {
    const value = dictionary[element.dataset.i18nTitle];
    if (value) element.title = value;
  });
};

const initLanguage = (root) => {
  const languageSelect = root.querySelector("#language-select");
  const savedLanguage = localStorage.getItem("geotest-language") || "sq";

  if (languageSelect) {
    languageSelect.value = savedLanguage;
    const onChange = (event) => {
      const nextLanguage = event.target.value;
      localStorage.setItem("geotest-language", nextLanguage);
      applyLanguage(nextLanguage, root);
    };
    languageSelect.addEventListener("change", onChange);
    addCleanup(() => languageSelect.removeEventListener("change", onChange));
  }

  applyLanguage(savedLanguage, root);
};

const initNavigation = (root, router) => {
  const navbar = root.querySelector(".navbar");
  const navToggle = root.querySelector(".nav-toggle");
  const dropdown = root.querySelector(".has-dropdown");
  const dropdownTrigger = root.querySelector(".dropdown-trigger");

  const setToggleIcon = (isOpen) => {
    const lines = navToggle ? Array.from(navToggle.querySelectorAll("span")) : [];

    if (lines.length !== 3) return;

    lines[0].style.transform = isOpen ? "translateY(7px) rotate(45deg)" : "";
    lines[1].style.opacity = isOpen ? "0" : "";
    lines[1].style.transform = isOpen ? "scaleX(0)" : "";
    lines[2].style.transform = isOpen ? "translateY(-7px) rotate(-45deg)" : "";
  };

  const closeNavigation = () => {
    navbar?.classList.remove("is-open");
    navToggle?.classList.remove("is-active");
    navToggle?.setAttribute("aria-expanded", "false");
    navToggle?.setAttribute("aria-label", "Open navigation menu");
    setToggleIcon(false);
  };

  const onToggleClick = () => {
    const isOpen = navbar.classList.toggle("is-open");
    navToggle.classList.toggle("is-active", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    setToggleIcon(isOpen);
  };

  const onDropdownClick = () => {
    const isOpen = dropdown.classList.toggle("is-open");
    dropdownTrigger.setAttribute("aria-expanded", String(isOpen));
  };

  const onDocumentClick = (event) => {
    if (!dropdown?.contains(event.target)) {
      dropdown?.classList.remove("is-open");
      dropdownTrigger?.setAttribute("aria-expanded", "false");
    }

    if (
      navbar?.classList.contains("is-open") &&
      event.target instanceof Node &&
      !navbar.contains(event.target)
    ) {
      closeNavigation();
    }
  };

  const onKeydown = (event) => {
    if (event.key === "Escape") {
      closeNavigation();
      dropdown?.classList.remove("is-open");
      dropdownTrigger?.setAttribute("aria-expanded", "false");
    }
  };

  navToggle?.addEventListener("click", onToggleClick);
  dropdownTrigger?.addEventListener("click", onDropdownClick);
  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", onKeydown);

  root.querySelectorAll("a[href]").forEach((link) => {
    const onLinkClick = (event) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("http")) {
        return;
      }

      event.preventDefault();
      closeNavigation();
      router.push(href);
    };

    link.addEventListener("click", onLinkClick);
    addCleanup(() => link.removeEventListener("click", onLinkClick));
  });

  addCleanup(() => {
    navToggle?.removeEventListener("click", onToggleClick);
    dropdownTrigger?.removeEventListener("click", onDropdownClick);
    document.removeEventListener("click", onDocumentClick);
    document.removeEventListener("keydown", onKeydown);
  });
};

const initRevealMotion = (root) => {
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const revealTargets = [
    root.querySelector("#what-we-do"),
    root.querySelector(".recognition-section"),
    root.querySelector("#services"),
    root.querySelector(".more-about-section"),
    root.querySelector(".custom-project-top"),
    root.querySelector(".faq-layout"),
  ].filter(Boolean);

  if (!motionQuery.matches) {
    document.documentElement.classList.add("motion-ready");
  }

  revealTargets.forEach((element) => {
    if (motionQuery.matches || !("IntersectionObserver" in window)) {
      element.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry], currentObserver) => {
        if (!entry.isIntersecting) return;
        element.classList.add("is-visible");
        currentObserver.unobserve(element);
      },
      { threshold: 0.22 },
    );

    observer.observe(element);
    addCleanup(() => observer.disconnect());
  });
};

const initProjectSliders = (root) => {
  root.querySelectorAll("[data-project-slider]").forEach((slider) => {
    const slides = Array.from(slider.querySelectorAll(".project-slide"));
    const previousButton = slider.querySelector("[data-slide-prev]");
    const nextButton = slider.querySelector("[data-slide-next]");
    let activeIndex = Math.max(
      0,
      slides.findIndex((slide) => slide.classList.contains("is-active")),
    );

    const setActiveSlide = (nextIndex) => {
      if (!slides.length) return;

      activeIndex = (nextIndex + slides.length) % slides.length;

      slides.forEach((slide, index) => {
        const isActive = index === activeIndex;
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
      });
    };

    const onPrevious = () => setActiveSlide(activeIndex - 1);
    const onNext = () => setActiveSlide(activeIndex + 1);
    const onKeydown = (event) => {
      if (event.key === "ArrowLeft") setActiveSlide(activeIndex - 1);
      if (event.key === "ArrowRight") setActiveSlide(activeIndex + 1);
    };

    previousButton?.addEventListener("click", onPrevious);
    nextButton?.addEventListener("click", onNext);
    slider.addEventListener("keydown", onKeydown);
    setActiveSlide(activeIndex);

    addCleanup(() => {
      previousButton?.removeEventListener("click", onPrevious);
      nextButton?.removeEventListener("click", onNext);
      slider.removeEventListener("keydown", onKeydown);
    });
  });
};

const initProjectFilters = (root) => {
  const projectFilterButtons = Array.from(root.querySelectorAll("[data-project-filter]"));
  const projectCards = Array.from(root.querySelectorAll("[data-project-card]"));
  const projectEmptyMessage = root.querySelector("[data-project-empty]");
  const projectListHeading = root.querySelector("#project-list-heading");

  const applyProjectFilter = (filter) => {
    let visibleCount = 0;

    projectCards.forEach((card) => {
      const categories = (card.dataset.projectCategories || "").split(/\s+/);
      const isVisible = filter === "all" || categories.includes(filter);
      card.classList.toggle("is-hidden", !isVisible);
      if (isVisible) visibleCount += 1;
    });

    projectFilterButtons.forEach((button) => {
      const isActive = button.dataset.projectFilter === filter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    if (projectEmptyMessage) projectEmptyMessage.hidden = visibleCount > 0;
    if (projectListHeading) projectListHeading.hidden = visibleCount === 0;
  };

  projectFilterButtons.forEach((button) => {
    const onClick = () => applyProjectFilter(button.dataset.projectFilter || "all");
    button.addEventListener("click", onClick);
    addCleanup(() => button.removeEventListener("click", onClick));
  });

  if (projectFilterButtons.length) applyProjectFilter("all");
};

export const initSitePage = (root, router) => {
  if (!root) return;

  resetPageRuntime();
  defineLogoElements();
  initLanguage(root);
  initNavigation(root, router);
  initRevealMotion(root);
  initProjectSliders(root);
  initProjectFilters(root);
};
