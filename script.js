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
    "overview.title": "Our Services",
    "overview.design": "Designing",
    "overview.supervision": "Supervision",
    "overview.consulting": "Consulting",
    "overview.geometric": "Geometric Investigation",
    "more.title": "More About Us",
    "more.modern.title": "Modern approach",
    "more.modern.text": "We combine practical field experience with clear digital workflows, fast communication, and carefully structured engineering decisions.",
    "more.investigations.title": "Geotechnical investigations",
    "more.investigations.text": "Our investigations define soil and rock conditions with reliable methods, giving each project a strong technical foundation.",
    "more.designing.title": "Designing in geotechnical engineering",
    "more.designing.text": "We prepare geotechnical designs that are buildable, efficient, and adapted to the real behavior of the terrain.",
    "more.consulting.title": "Consulting",
    "more.consulting.text": "We support investors, designers, and contractors with focused advice during planning, construction, and problem solving.",
    "more.mechanics.title": "Soil mechanics and geotechnical engineering",
    "more.mechanics.text": "We interpret soil behavior, stability, settlement, and groundwater influence so technical choices remain safe and realistic.",
    "custom.title": "Project Development Tailored To Your Needs",
    "custom.text": "GEOtest Engineering develops technical solutions tailored to your needs. We carefully consider your ideas and requirements, turning them into feasible and efficient solutions customized to the specifics of each project.",
    "custom.button": "Free consulting",
    "faq.title": "Frequently Asked Questions",
    "faq.report.title": "What is a geotechnical report?",
    "faq.report.text": "A geotechnical report summarizes the soil, rock, groundwater, and foundation conditions of a site and gives technical recommendations for safe design and construction.",
    "faq.required.title": "When is a geotechnical report required, and when is a geotechnical project needed?",
    "faq.required.text": "A report is usually needed before design or construction when soil conditions must be confirmed. A geotechnical project is needed when technical solutions such as foundations, retaining systems, slopes, or anchors must be designed.",
    "faq.anchor.title": "What is a geotechnical anchor, and do I need the neighbor's consent for the installation of geotechnical anchors?",
    "faq.anchor.text": "A geotechnical anchor transfers load into stable ground to support retaining structures or slopes. Consent depends on the project position, property boundary, local regulations, and whether anchors pass under neighboring land.",
    "faq.contact.title": "How can I contact you?",
    "faq.contact.text": "Use the contact section to send project information, location, and available documentation. We will review it and respond with the next practical steps.",
    "contact.kicker": "Contact GEOtest",
    "contact.title": "Start your geotechnical project with clarity.",
    "contact.text": "Send us the project location, scope, and available documentation. We will review the conditions and respond with the most practical next step for investigation, design, supervision, or consulting.",
    "contact.name": "Name",
    "contact.email": "Email",
    "contact.service": "Service",
    "contact.service.placeholder": "Choose service",
    "contact.location": "Project location",
    "contact.message": "Project details",
    "contact.submit": "Send request",
    "footer.contact": "Contact now",
    "footer.copy": "© 2026 GEOtest Engineering. All rights reserved.",
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
    "overview.title": "Shërbimet Tona",
    "overview.design": "Projektimi",
    "overview.supervision": "Mbikëqyrja",
    "overview.consulting": "Konsultimi",
    "overview.geometric": "Hulumtimi gjeometrik",
    "more.title": "Më shumë rreth nesh",
    "more.modern.title": "Qasje moderne",
    "more.modern.text": "Ne kombinojmë përvojën praktike në terren me procese digjitale të qarta, komunikim të shpejtë dhe vendime inxhinierike të strukturuara mirë.",
    "more.investigations.title": "Hulumtime gjeoteknike",
    "more.investigations.text": "Hulumtimet tona përcaktojnë kushtet e tokës dhe shkëmbinjve me metoda të besueshme, duke i dhënë çdo projekti bazë të fortë teknike.",
    "more.designing.title": "Projektim në inxhinieri gjeoteknike",
    "more.designing.text": "Ne përgatisim projekte gjeoteknike të zbatueshme, efikase dhe të përshtatura me sjelljen reale të terrenit.",
    "more.consulting.title": "Konsultim",
    "more.consulting.text": "Ne mbështesim investitorët, projektuesit dhe kontraktorët me këshilla të fokusuara gjatë planifikimit, ndërtimit dhe zgjidhjes së problemeve.",
    "more.mechanics.title": "Mekanika e tokës dhe inxhinieria gjeoteknike",
    "more.mechanics.text": "Ne interpretojmë sjelljen e tokës, stabilitetin, uljet dhe ndikimin e ujërave nëntokësore që zgjedhjet teknike të jenë të sigurta dhe realiste.",
    "custom.title": "Hartimi i projekteve sipas kërkesave tuaja",
    "custom.text": "GEOtest Engineering zhvillon zgjidhje teknike të përshtatura me nevojat tuaja. Ne i shqyrtojmë me kujdes idetë dhe kërkesat tuaja, duke i kthyer ato në zgjidhje të realizueshme, efikase dhe të përshtatura me veçoritë e çdo projekti.",
    "custom.button": "Konsultim falas",
    "faq.title": "Pyetje të shpeshta",
    "faq.report.title": "Çfarë është raporti gjeoteknik?",
    "faq.report.text": "Raporti gjeoteknik përmbledh kushtet e tokës, shkëmbinjve, ujërave nëntokësore dhe themeleve të një lokacioni, si dhe jep rekomandime teknike për projektim dhe ndërtim të sigurt.",
    "faq.required.title": "Kur kërkohet raporti gjeoteknik dhe kur nevojitet projekti gjeoteknik?",
    "faq.required.text": "Raporti zakonisht nevojitet para projektimit ose ndërtimit kur duhet të verifikohen kushtet e tokës. Projekti gjeoteknik nevojitet kur duhet të projektohen zgjidhje teknike si themelet, muret mbajtëse, shpatet ose ankorimet.",
    "faq.anchor.title": "Çfarë është ankori gjeoteknik dhe a nevojitet pëlqimi i fqinjit për vendosjen e ankorëve?",
    "faq.anchor.text": "Ankori gjeoteknik transferon ngarkesën në tokë të qëndrueshme për të mbështetur struktura mbajtëse ose shpate. Pëlqimi varet nga pozicioni i projektit, kufiri i pronës, rregulloret lokale dhe nëse ankorët kalojnë nën tokën fqinje.",
    "faq.contact.title": "Si mund t'ju kontaktoj?",
    "faq.contact.text": "Përdorni seksionin e kontaktit për të dërguar informacionin e projektit, lokacionin dhe dokumentacionin që keni në dispozicion. Ne do ta shqyrtojmë dhe do t'ju kthejmë hapat praktikë të radhës.",
    "contact.kicker": "Kontaktoni GEOtest",
    "contact.title": "Filloni projektin tuaj gjeoteknik me qartësi.",
    "contact.text": "Dërgoni lokacionin, fushën e projektit dhe dokumentacionin që keni në dispozicion. Ne do t'i shqyrtojmë kushtet dhe do t'ju përgjigjemi me hapin më praktik për hulumtim, projektim, mbikëqyrje ose konsultim.",
    "contact.name": "Emri",
    "contact.email": "Email",
    "contact.service": "Shërbimi",
    "contact.service.placeholder": "Zgjidh shërbimin",
    "contact.location": "Lokacioni i projektit",
    "contact.message": "Detajet e projektit",
    "contact.submit": "Dërgo kërkesën",
    "footer.contact": "Kontakto tani",
    "footer.copy": "© 2026 GEOtest Engineering. Të gjitha të drejtat e rezervuara.",
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

customElements.define("geotest-navbar-logo", GeotestNavbarLogo);
customElements.define("geotest-logo-hero-reveal", GeotestLogoHeroReveal);
