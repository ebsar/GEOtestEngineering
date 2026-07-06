import { translations } from "./translations.js";
import { getSupabaseClient } from "./supabase.js";

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
let cmsOverrideCache;

const addCleanup = (handler) => {
  cleanupHandlers.push(handler);
};

const resetPageRuntime = () => {
  cleanupHandlers.forEach((handler) => handler());
  cleanupHandlers = [];
};

const normalizeAssetPath = (value = "") =>
  value
    .trim()
    .replace(window.location.origin, "")
    .replace(/^\/?public\//, "/")
    .replace(/^([^/])/, "/$1");

export const loadCmsOverrides = async ({ force = false } = {}) => {
  if (cmsOverrideCache && !force) {
    return cmsOverrideCache;
  }

  const overrides = {
    text: new Map(),
    images: new Map(),
    projects: [],
    projectFilters: [],
  };

  try {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("website_cards")
      .select("*")
      .in("section_key", ["inline_text", "inline_images", "projects.list", "projects.filters"])
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    (data || []).forEach((item) => {
      if (item.section_key === "inline_text" && item.card_key) {
        overrides.text.set(item.card_key, item);
      }

      if (item.section_key === "inline_images" && item.card_key) {
        overrides.images.set(item.card_key, item);
      }

      if (item.section_key === "inline_images" && item.metadata?.original_src) {
        overrides.images.set(normalizeAssetPath(item.metadata.original_src), item);
      }

      if (item.section_key === "projects.list") {
        overrides.projects.push(item);
      }

      if (item.section_key === "projects.filters") {
        overrides.projectFilters.push(item);
      }
    });
  } catch (error) {
    console.warn("CMS overrides unavailable:", error.message);
  }

  cmsOverrideCache = overrides;
  return overrides;
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

const getTranslatedContent = (item, language, fallback = {}) => {
  const secondaryLanguage = language === "sq" ? "en" : "sq";
  return {
    ...fallback,
    ...(item?.translations?.[secondaryLanguage] || {}),
    ...(item?.translations?.[language] || {}),
  };
};

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const renderCmsProjects = (root = document, language = "sq", cmsOverrides = cmsOverrideCache) => {
  const projectList = root.querySelector(".project-list-inner");
  const emptyMessage = root.querySelector("[data-project-empty]");

  if (!projectList || !emptyMessage) return;

  root.querySelectorAll("[data-cms-project-card]").forEach((card) => card.remove());

  (cmsOverrides?.projects || []).forEach((project) => {
    const content = getTranslatedContent(project, language, {
      title: "",
      description: "",
    });
    const categories = project.metadata?.categories?.length
      ? project.metadata.categories
      : project.category && project.category !== "all"
        ? [project.category]
        : [];
    const categoryText = categories.join(" ");
    const gallery = project.metadata?.gallery?.length
      ? project.metadata.gallery
      : [{ url: project.image_url || "/images/project-durdekovac-site.webp" }];
    const yearText =
      content.yearText ||
      (project.metadata?.year
        ? `${translations[language]?.["projects.year.label"] || "year of design:"} ${project.metadata.year}`
        : "");
    const title = escapeHtml(content.title || "Untitled project");
    const description = escapeHtml(content.description || "");
    const yearMarkup = yearText
      ? `
          <p class="project-year">
            <strong>${escapeHtml(yearText)}</strong>
          </p>
        `
      : "";
    const slides = gallery
      .slice(0, 10)
      .map((image, index) => {
        const imageUrl = typeof image === "string" ? image : image.url;
        return `
          <img
            class="project-slide${index === 0 ? " is-active" : ""}"
            src="${escapeHtml(imageUrl)}"
            alt="${title}"
            loading="${index === 0 ? "eager" : "lazy"}"
          />
        `;
      })
      .join("");
    const sliderButtons =
      gallery.length > 1
        ? `
            <button class="project-slide-button project-slide-prev" type="button" data-slide-prev aria-label="Previous project photo">
              <svg aria-hidden="true" viewBox="0 0 20 20">
                <path d="M12.5 4.5 7 10l5.5 5.5" />
              </svg>
            </button>
            <button class="project-slide-button project-slide-next" type="button" data-slide-next aria-label="Next project photo">
              <svg aria-hidden="true" viewBox="0 0 20 20">
                <path d="m7.5 4.5 5.5 5.5-5.5 5.5" />
              </svg>
            </button>
          `
        : "";

    const article = document.createElement("article");
    article.className = "project-card";
    article.dataset.projectCard = "";
    article.dataset.cmsProjectCard = project.card_key || project.id;
    article.dataset.projectCategories = categoryText;
    article.innerHTML = `
      <div class="project-copy-panel">
        <h3>${title}</h3>
        <p>${description}</p>
        ${yearMarkup}
      </div>
      <div class="project-slider" data-project-slider>
        <div class="project-slide-track">
          ${slides}
        </div>
        ${sliderButtons}
      </div>
    `;

    projectList.insertBefore(article, emptyMessage);
  });
};

const renderProjectFilters = (root = document, language = "sq", cmsOverrides = cmsOverrideCache) => {
  const filterList = root.querySelector(".project-filter-list");
  if (!filterList) return;

  filterList.querySelectorAll("[data-cms-project-filter]").forEach((filter) => filter.remove());
  filterList.querySelectorAll("[data-project-filter]").forEach((filter) => {
    filter.hidden = false;
  });

  (cmsOverrides?.projectFilters || []).forEach((filter) => {
    const filterKey = filter.metadata?.filter_key || filter.card_key?.replace(/^filter\./, "");
    if (!filterKey) return;

    const existing = filterList.querySelector(`[data-project-filter="${CSS.escape(filterKey)}"]`);
    if (filter.metadata?.hidden) {
      if (existing) existing.hidden = true;
      return;
    }

    if (existing) return;

    const content = getTranslatedContent(filter, language, {
      title: filter.metadata?.label || filterKey,
    });
    const button = document.createElement("button");
    button.className = "project-filter";
    button.type = "button";
    button.dataset.projectFilter = filterKey;
    button.dataset.cmsProjectFilter = "true";
    button.textContent = content.title || filterKey;
    filterList.appendChild(button);
  });
};

export const applyLanguage = (language, root = document, cmsOverrides = cmsOverrideCache) => {
  const dictionary = translations[language] || translations.en;
  document.documentElement.lang = language;

  root.querySelectorAll("[data-i18n]").forEach((element) => {
    const override = cmsOverrides?.text?.get(element.dataset.i18n);
    const value =
      override?.translations?.[language]?.text ||
      override?.translations?.[language]?.title ||
      dictionary[element.dataset.i18n];
    if (value) element.textContent = value;
  });

  root.querySelectorAll("[data-i18n-html]").forEach((element) => {
    const override = cmsOverrides?.text?.get(element.dataset.i18nHtml);
    const value =
      override?.translations?.[language]?.html ||
      override?.translations?.[language]?.text ||
      dictionary[element.dataset.i18nHtml];
    if (value) element.innerHTML = value;
  });

  root.querySelectorAll("[data-i18n-title]").forEach((element) => {
    const value = dictionary[element.dataset.i18nTitle];
    if (value) element.title = value;
  });
};

export const applyImageOverrides = (root = document, cmsOverrides = cmsOverrideCache) => {
  if (!cmsOverrides?.images) return;

  root.querySelectorAll("img[src]").forEach((image) => {
    const originalSrc = image.dataset.cmsOriginalSrc || normalizeAssetPath(image.getAttribute("src"));
    const cmsKey = image.dataset.cmsImageKey ? `image:${image.dataset.cmsImageKey}` : originalSrc;
    const override = cmsOverrides.images.get(cmsKey) || cmsOverrides.images.get(originalSrc);

    image.dataset.cmsOriginalSrc = originalSrc;
    image.dataset.cmsImage = "true";

    if (override?.image_url) {
      image.src = override.image_url;
    }
  });
};

export const applyCmsContent = (root = document, language = "sq", cmsOverrides = cmsOverrideCache) => {
  applyLanguage(language, root, cmsOverrides);
  renderProjectFilters(root, language, cmsOverrides);
  renderCmsProjects(root, language, cmsOverrides);
  applyImageOverrides(root, cmsOverrides);
};

const initLanguage = (root, cmsOverrides) => {
  const languageSelect = root.querySelector("#language-select");
  const savedLanguage = localStorage.getItem("geotest-language") || "sq";

  if (languageSelect) {
    languageSelect.value = savedLanguage;
    const onChange = (event) => {
      const nextLanguage = event.target.value;
      localStorage.setItem("geotest-language", nextLanguage);
      applyCmsContent(root, nextLanguage, cmsOverrides);
    };
    languageSelect.addEventListener("change", onChange);
    addCleanup(() => languageSelect.removeEventListener("change", onChange));
  }

  applyCmsContent(root, savedLanguage, cmsOverrides);
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
  const projectEmptyMessage = root.querySelector("[data-project-empty]");
  const projectListHeading = root.querySelector("#project-list-heading");

  const applyProjectFilter = (filter) => {
    let visibleCount = 0;
    const projectCards = Array.from(root.querySelectorAll("[data-project-card]"));

    projectCards.forEach((card) => {
      const categories = (card.dataset.projectCategories || "").split(/\s+/);
      const isVisible = filter === "all" || (!card.hidden && categories.includes(filter));
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

export const initSitePage = async (root, router, options = {}) => {
  if (!root) return;

  resetPageRuntime();
  const cmsOverrides = await loadCmsOverrides({ force: options.forceCmsRefresh });
  defineLogoElements();
  initLanguage(root, cmsOverrides);
  initNavigation(root, router);
  initRevealMotion(root);
  initProjectSliders(root);
  initProjectFilters(root);
};
