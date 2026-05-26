const navbar = document.querySelector(".navbar");
const navToggle = document.querySelector(".nav-toggle");
const dropdown = document.querySelector(".has-dropdown");
const dropdownTrigger = document.querySelector(".dropdown-trigger");
const languageSelect = document.querySelector("#language-select");

navToggle?.addEventListener("click", () => {
  const isOpen = navbar.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

dropdownTrigger?.addEventListener("click", () => {
  const isOpen = dropdown.classList.toggle("is-open");
  dropdownTrigger.setAttribute("aria-expanded", String(isOpen));
});

document.addEventListener("click", (event) => {
  if (!dropdown?.contains(event.target)) {
    dropdown?.classList.remove("is-open");
    dropdownTrigger?.setAttribute("aria-expanded", "false");
  }
});

const translations = {
  en: {
    "nav.home": "Home",
    "nav.services": "Services",
    "nav.projects": "Projects",
    "nav.about": "About Us",
    "nav.contacts": "Contacts",
    "services.investigation": "Geotechnical Investigation",
    "services.report": "Geotechnical Report",
    "services.laboratory": "Laboratory Investigations Work",
    "services.designing": "Designing",
    "services.supervision": "Supervision in Geotechnical Engineering",
    "services.consulting": "Consulting in Geotechnical Engineering",
    "services.monitoring": "Technical Monitoring",
    "hero.tagline": "Where interactions with soil begins.",
    "icons.drilling": "Soil drilling and pipe testing",
    "icons.slope": "Soft soil transitioning into hard soil",
    "icons.foundation": "Foundation pipes inside earth",
    "icons.anchors": "Pipe with side anchors in earth",
  },
  sq: {
    "nav.home": "Ballina",
    "nav.services": "Sherbimet",
    "nav.projects": "Projektet",
    "nav.about": "Rreth Nesh",
    "nav.contacts": "Kontaktet",
    "services.investigation": "Hulumtime Gjeoteknike",
    "services.report": "Raport Gjeoteknik",
    "services.laboratory": "Punime Laboratorike",
    "services.designing": "Projektim",
    "services.supervision": "Mbikëqyrje në Inxhinieri Gjeoteknike",
    "services.consulting": "Konsulencë në Inxhinieri Gjeoteknike",
    "services.monitoring": "Monitorim Teknik",
    "hero.tagline": "Aty ku bashkëveprimi me tokën fillon.",
    "icons.drilling": "Shpim i tokës dhe testim me tub",
    "icons.slope": "Tokë e butë që kalon në tokë të fortë",
    "icons.foundation": "Tuba themeli brenda tokës",
    "icons.anchors": "Tub në tokë me ankorime anësore",
  },
};

const applyLanguage = (language) => {
  const dictionary = translations[language] || translations.en;
  document.documentElement.lang = language;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = dictionary[element.dataset.i18n];
    if (value) element.textContent = value;
  });

  document.querySelectorAll("[data-i18n-title]").forEach((element) => {
    const value = dictionary[element.dataset.i18nTitle];
    if (value) element.title = value;
  });
};

languageSelect?.addEventListener("change", (event) => {
  applyLanguage(event.target.value);
});

applyLanguage(languageSelect?.value || "en");

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const whatWeDoSection = document.querySelector("#what-we-do");

if (!motionQuery.matches) {
  document.documentElement.classList.add("motion-ready");
}

if (whatWeDoSection) {
  if (motionQuery.matches || !("IntersectionObserver" in window)) {
    whatWeDoSection.classList.add("is-visible");
  } else {
    const whatWeDoObserver = new IntersectionObserver(
      ([entry], observer) => {
        if (!entry.isIntersecting) return;

        whatWeDoSection.classList.add("is-visible");
        observer.unobserve(whatWeDoSection);
      },
      { threshold: 0.28 },
    );

    whatWeDoObserver.observe(whatWeDoSection);
  }
}

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
      <svg class="brand-logo" viewBox="0 0 310 170" role="img" aria-label="GEOtest Engineering">
        <g class="navbar-dot-icon">
          ${dots}
        </g>
        <text class="navbar-logo-text navbar-geotest-word" x="145" y="68">
          <tspan class="geo-text">GEO</tspan><tspan class="test-text">test</tspan>
        </text>
        <rect class="navbar-logo-line" x="147" y="78" width="134" height="5" rx="1" />
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

customElements.define("geotest-navbar-logo", GeotestNavbarLogo);
customElements.define("geotest-logo-hero-reveal", GeotestLogoHeroReveal);
