const pageLoader = document.createElement("div");
pageLoader.className = "page-loader";
pageLoader.setAttribute("aria-hidden", "true");
pageLoader.innerHTML = `
  <span class="page-loader-content">
    <span class="page-loader-spinner"></span>
    <span class="page-loader-text">Duke u ngarkuar...</span>
  </span>
`;
document.body.classList.add("is-page-loading");
document.body.prepend(pageLoader);

const hidePageLoader = () => {
  pageLoader.classList.add("is-hidden");
  document.body.classList.remove("is-page-loading");
  window.setTimeout(() => pageLoader.remove(), 320);
};

if (document.readyState === "complete") {
  window.setTimeout(hidePageLoader, 420);
} else {
  window.addEventListener("load", () => window.setTimeout(hidePageLoader, 420), {
    once: true,
  });
}

const navbar = document.querySelector(".navbar");
const navToggle = document.querySelector(".nav-toggle");
const dropdown = document.querySelector(".has-dropdown");
const dropdownTrigger = document.querySelector(".dropdown-trigger");
const languageSelect = document.querySelector("#language-select");

const setToggleIcon = (isOpen) => {
  const lines = navToggle ? Array.from(navToggle.querySelectorAll("span")) : [];

  if (lines.length !== 3) {
    return;
  }

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

navToggle?.addEventListener("click", () => {
  const isOpen = navbar.classList.toggle("is-open");
  navToggle.classList.toggle("is-active", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute(
    "aria-label",
    isOpen ? "Close navigation menu" : "Open navigation menu",
  );
  setToggleIcon(isOpen);
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

  if (
    navbar?.classList.contains("is-open") &&
    event.target instanceof Node &&
    !navbar.contains(event.target)
  ) {
    closeNavigation();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNavigation();
    dropdown?.classList.remove("is-open");
    dropdownTrigger?.setAttribute("aria-expanded", "false");
  }
});

document.querySelectorAll(".nav-panel a").forEach((link) => {
  link.addEventListener("click", () => {
    closeNavigation();
  });
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
    "services.supervision": "Supervision",
    "services.consulting": "Consulting",
    "services.geometric": "Geometric Investigation",
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
    "faq.title": "FAQ",
    "faq.report.title": "What is a geotechnical report?",
    "faq.report.text": "A geotechnical report summarizes the soil, rock, groundwater, and foundation conditions of a site and gives technical recommendations for safe design and construction.",
    "faq.required.title": "When is a geotechnical report required, and when is a geotechnical project needed?",
    "faq.required.text": "A report is usually needed before design or construction when soil conditions must be confirmed. A geotechnical project is needed when technical solutions such as foundations, retaining systems, slopes, or anchors must be designed.",
    "faq.anchor.title": "What is a geotechnical anchor, and do I need the neighbor's consent for the installation of geotechnical anchors?",
    "faq.anchor.text": "A geotechnical anchor transfers load into stable ground to support retaining structures or slopes. Consent depends on the project position, property boundary, local regulations, and whether anchors pass under neighboring land.",
    "faq.contact.title": "How can I contact you?",
    "faq.contact.text": "Use the contact section to send project information, location, and available documentation. We will review it and respond with the next practical steps.",
    "projects.title": "PROJECT LIST",
    "projects.intro": "Below is a selection of projects we have been involved in. Each project is approached with a high level of responsibility, in full compliance with technical requirements and site-specific conditions.",
    "projects.filter.all": "All projects",
    "projects.filter.site": "Site investigations",
    "projects.filter.geotechnical": "Geotechnical projects",
    "projects.filter.monitoring": "Technical monitoring",
    "projects.group.investigations": "I. GEOTECHNICAL INVESTIGATIONS AND REPORTS",
    "projects.durdekovac.title": "Đurđekovac",
    "projects.durdekovac.text": "The subject of this geotechnical report was the execution of geotechnical investigation works with the aim of defining the foundation conditions for a future structure located on a slope within an area of a stabilized landslide. The conducted investigations determined the geotechnical soil profile, including the distribution of surface deposits, the depth and characteristics of potentially sliding horizons, as well as the transition to more stable layers. Due to initial design uncertainties regarding the structure itself, this phase proposed the execution of one geotechnical borehole at a representative location, along with engineering geological mapping of the slope and presentation of the results on an overview plan. Based on the obtained data, it was concluded that, in the main design phase of the foundation, it would be justified to carry out an additional borehole at the toe of the slope in order to fully define the geotechnical profile and reliably assess terrain stability.",
    "projects.year.label": "year of design:",
    "projects.empty": "Projects in this category will be added soon.",
    "about.title": "GEOtest Engineering",
    "about.intro": "The journey in geotechnical engineering began through academic education, field investigation, design work, and practical project experience. GEOtest Engineering brings that knowledge into every assignment with a precise, responsible, and site-specific approach. Today, we support projects with clear technical thinking, professional communication, and solutions adapted to real ground conditions.",
    "about.mission.title": "Our Mission",
    "about.mission.text": "To provide top-quality and innovative geotechnical solutions based on precision, quality, and professional standards, helping our clients achieve their goals.",
    "about.vision.title": "Our Vision",
    "about.vision.text": "To become a trusted geotechnical engineering partner recognized for expertise, innovative approaches, and contribution to the development of safe and efficient engineering solutions.",
    "about.work.title": "Key Areas of Work",
    "about.work.investigations": "<strong>Geotechnical Investigations</strong> - Development of studies and designs for new and existing construction projects, aiming to ensure safety and cost-efficiency through detailed site analysis.",
    "about.work.design": "<strong>Design</strong> - We provide design services for all phases of documentation, including studies, conceptual, main, and detailed designs, tender documentation, and design supervision, using advanced methods and tools.",
    "about.work.supervision": "<strong>Expert Supervision</strong> - Our expert team conducts on-site supervision to ensure the proper implementation of geotechnical recommendations and compliance with technical and safety standards during construction.",
    "about.work.consulting": "<strong>Consulting</strong> - We offer expert support throughout all phases of construction projects, from initial site analysis to final implementation, guaranteeing optimal solutions and risk minimization.",
    "about.varazdin.title": "Why Varaždin?",
    "about.varazdin.text": "Choosing Varaždin as the company's headquarters merged both the professional and personal aspects of our journey. This city, rich in engineering tradition and a dynamic business environment, has proven to be the ideal place for the development of a specialized geotechnical practice. The blend of Varaždin's traditional and modern spirit aligns with our vision of geotechnical engineering. Here at GEOtest Engineering, we create innovative solutions that address the challenges of modern construction.",
    "about.partner.title": "GEOtest Engineering - Your Partner in Developing Geotechnical Solutions",
    "about.partner.left": "We continuously monitor the latest technological trends and plan to actively engage with the professional community. We look forward to future opportunities to share knowledge and participate in international conferences and professional gatherings, contributing to the growth of the field that we are passionate about.",
    "about.partner.right": "Whether you are seeking expert advice, creative solutions, or reliable partners, GEOtest Engineering is here for you. Contact us, and together, let's build a sustainable future on solid foundational principles.",
    "about.partner.button": "Free Consultation",
    "contact.kicker": "Contact GEOtest",
    "contact.title": "Start your geotechnical project with clarity.",
    "contact.text": "Contact us directly by email, share your phone number, or send us your project location. You can also send us your information below, and we will reach out to you.",
    "contact.direct.email": "Email",
    "contact.direct.phone": "Phone",
    "contact.direct.phoneValue": "+38349242052",
    "contact.direct.location": "Location",
    "contact.direct.locationValue": "Rruga \"Mizahir Isma\", Rahovec, Kosovo 21000",
    "contact.name": "Full name",
    "contact.email": "Email",
    "contact.phone": "Phone number",
    "contact.service": "Service",
    "contact.service.placeholder": "Choose service",
    "contact.location": "Project location",
    "contact.message": "Project details",
    "contact.submit": "Send request",
    "designing.title": "Designing",
    "designing.intro": "Designing is a crucial step in ensuring a successful and safe construction project. GEOtest Engineering provides comprehensive geotechnical designing services, from conceptual solutions to complete execution projects.",
    "designing.includes.title": "What does geotechnical designing include?",
    "designing.includes.text": "Designing geotechnical structures is key to ensuring the stability and safety of buildings. GEOtest Engineering prepares the following types of geotechnical projects:",
    "designing.includes.one": "Foundation structures",
    "designing.includes.two": "Protection of construction pits",
    "designing.includes.three": "Landslide remediation",
    "designing.includes.four": "Retaining structures",
    "designing.includes.five": "Improvement of foundation soil",
    "designing.includes.six": "Underground structures",
    "designing.standards": "During project development, we adhere to Croatian and European standards to ensure the highest quality levels. Our approach is based on advanced computational tools for geotechnical analysis, achieving precise results and maximum structural safety.",
    "designing.choice.title": "Why choose GEOtest Engineering?",
    "designing.choice.one": "Integrated approach to design - we address every project by considering all technical aspects and specific requirements.",
    "designing.choice.two": "Continuous application of technological innovations - we stay up to date with the latest technologies and methods to improve our solutions.",
    "designing.choice.three": "Use of advanced computational programs - professional software enables precise analyses and optimized solutions.",
    "designing.choice.four": "A creative engineering approach that brings reliable, practical, and efficient results.",
    "consulting.title": "Consulting in Geotechnical Engineering",
    "consulting.intro": "Consulting in geotechnical engineering is crucial for the successful realization of construction projects, especially when dealing with complex challenges related to foundation design, soil stability, and excavation support. GEOtest Engineering provides specialized advisory services covering all aspects of planning, analysis, and control in geotechnics. Our expert team offers support throughout all project phases to ensure quality and safety in execution.",
    "consulting.areas.title": "Areas of Consulting:",
    "consulting.areas.one": "Foundation of structures",
    "consulting.areas.two": "Excavation pits",
    "consulting.areas.three": "Retaining structures",
    "consulting.areas.four": "Soil improvement",
    "consulting.areas.five": "Geotechnical supervision",
    "consulting.experience": "As experts with extensive experience, we are dedicated to finding the best solutions for specific geotechnical challenges. Each project requires a precise analysis and adaptation of solutions to geotechnical conditions to achieve stability and long-term sustainability of the structure. Our consulting team employs state-of-the-art methods and software tools for detailed analysis and the development of optimal solutions.",
    "consulting.approach.title": "Our approach:",
    "consulting.approach.one": "Analysis of geotechnical conditions",
    "consulting.approach.two": "Development of optimal solutions",
    "consulting.approach.three": "Risk and cost assessment",
    "consulting.approach.four": "Technical support during execution",
    "consulting.approach.five": "Quality control",
    "consulting.success": "The key to our success lies in an integrated and customized approach that enables the timely identification of issues and the proposal of effective measures to resolve them. Throughout each project, we ensure continuous communication with the client to tailor solutions to the project's specific requirements.",
    "consulting.commitment": "GEOtest Engineering is committed to providing top-tier consulting services in geotechnical engineering. With years of experience and professional expertise, we enable the successful realization of projects while minimizing risks and optimizing costs.",
    "geometric.title": "Geometric Investigation",
    "geometric.intro": "Reliable design and high-quality construction depend on detailed and accurate investigation data. GEOtest Engineering performs field investigation, drilling, sampling, and documentation that give each project a clear technical basis before design and execution.",
    "geometric.panel.one": "Our investigation process combines site inspection, core drilling, sample collection, geological interpretation, and practical reporting. We collect the information needed to understand soil behavior, groundwater conditions, bearing capacity, and slope stability.",
    "geometric.panel.two": "Geometric and geotechnical investigation may include:",
    "geometric.scope.one": "Core drilling and soil sampling",
    "geometric.scope.two": "Manual drilling for slopes and inaccessible terrain",
    "geometric.scope.three": "Field documentation and laboratory sample preparation",
    "geometric.scope.four": "Interpretation of soil, rock, groundwater, and stability indicators",
    "geometric.includes.title": "What do investigations include?",
    "geometric.includes.text": "Investigation gives designers and investors reliable information about the ground. Through field work and professional interpretation, we determine the conditions that influence safe and efficient foundation and slope decisions.",
    "geometric.includes.one": "Soil composition and properties",
    "geometric.includes.two": "Bearing capacity of foundation soil",
    "geometric.includes.three": "Groundwater level and site conditions",
    "geometric.includes.four": "Slope stability and risk indicators",
    "geometric.why.title": "Why are investigations essential?",
    "geometric.why.text": "High-quality investigations enable better decisions for foundation design, slope stability, and protection of surrounding structures. They reduce uncertainty and help prevent unforeseen issues during construction.",
    "supervision.title": "Supervision in Geotechnical Engineering",
    "supervision.intro": "Reliable construction depends on continuous control, clear documentation, and timely technical decisions. GEOtest Engineering provides professional supervision of geotechnical works so execution follows the design, site conditions are properly interpreted, and quality remains stable throughout every project phase.",
    "supervision.panel.one": "Our supervision process combines field observation, construction coordination, verification of performed works, and communication with designers, contractors, and investors. We monitor the critical details that influence safety, durability, and long-term performance.",
    "supervision.panel.two": "Professional supervision in geotechnical engineering may include:",
    "supervision.scope.one": "Control of foundation excavation and soil conditions",
    "supervision.scope.two": "Monitoring of retaining structures, anchors, and slope works",
    "supervision.scope.three": "Verification of site documentation and technical compliance",
    "supervision.scope.four": "Coordination of corrective measures when ground conditions change",
    "supervision.includes.title": "What does supervision include?",
    "supervision.includes.text": "Supervision gives the construction team a reliable technical eye on site. Through regular checks and professional interpretation, we help confirm that the ground behavior, execution method, and design assumptions remain aligned.",
    "supervision.includes.one": "Inspection of excavation levels and foundation preparation",
    "supervision.includes.two": "Review of soil, groundwater, and stability indicators",
    "supervision.includes.three": "Follow-up of geotechnical measures during construction",
    "supervision.includes.four": "Clear reporting and practical technical recommendations",
    "supervision.why.title": "Why is supervision essential?",
    "supervision.why.text": "Site conditions can change quickly. Professional supervision reduces uncertainty, helps prevent delays and unsafe decisions, and protects the quality of the final structure from the first excavation to the completed work.",
    "gtc.title": "GTC Compact",
    "gtc.text.one": "The GTC Compact is a multifunctional drilling rig designed for professional use. It consists of a drilling unit and a hydraulic power pack, built as separate but coordinated units, allowing for greater flexibility and easier transport to challenging terrains.",
    "gtc.text.two": "The machine is particularly suitable for geotechnical investigations on flat or gently sloping terrains, including:",
    "gtc.use.one": "The head and the toe of a landslide",
    "gtc.use.two": "Foundations for residential and industrial buildings",
    "gtc.use.three": "Temporary excavation pits",
    "gtc.use.four": "Industrial halls and similar structures",
    "manual.title": "Manual drilling - slopes and landslides",
    "manual.text.one": "GEOtest Engineering continues to utilize one of the most important, yet also one of the most demanding methods of investigation drilling: manual drilling. This method remains indispensable in situations involving steep terrains, active landslides, or locations that are inaccessible to machinery.",
    "manual.text.two": "The manual drilling method is particularly suitable for investigations on terrains:",
    "manual.use.one": "Landslide bodies",
    "manual.use.two": "Terrain slopes greater than 15°",
    "manual.use.three": "Inaccessible locations such as field roads, forested areas, and sites without access roads",
    "manual.use.four": "Verification of depth to bedrock and validation of geophysical profiles and other investigation methods",
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
    "services.designing": "Projektimi",
    "services.supervision": "Mbikëqyrja",
    "services.consulting": "Konsultimi",
    "services.geometric": "Hulumtimi gjeometrik",
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
    "faq.title": "FAQ",
    "faq.report.title": "Çfarë është raporti gjeoteknik?",
    "faq.report.text": "Raporti gjeoteknik përmbledh kushtet e tokës, shkëmbinjve, ujërave nëntokësore dhe themeleve të një lokacioni, si dhe jep rekomandime teknike për projektim dhe ndërtim të sigurt.",
    "faq.required.title": "Kur kërkohet raporti gjeoteknik dhe kur nevojitet projekti gjeoteknik?",
    "faq.required.text": "Raporti zakonisht nevojitet para projektimit ose ndërtimit kur duhet të verifikohen kushtet e tokës. Projekti gjeoteknik nevojitet kur duhet të projektohen zgjidhje teknike si themelet, muret mbajtëse, shpatet ose ankorimet.",
    "faq.anchor.title": "Çfarë është ankori gjeoteknik dhe a nevojitet pëlqimi i fqinjit për vendosjen e ankorëve?",
    "faq.anchor.text": "Ankori gjeoteknik transferon ngarkesën në tokë të qëndrueshme për të mbështetur struktura mbajtëse ose shpate. Pëlqimi varet nga pozicioni i projektit, kufiri i pronës, rregulloret lokale dhe nëse ankorët kalojnë nën tokën fqinje.",
    "faq.contact.title": "Si mund t'ju kontaktoj?",
    "faq.contact.text": "Përdorni seksionin e kontaktit për të dërguar informacionin e projektit, lokacionin dhe dokumentacionin që keni në dispozicion. Ne do ta shqyrtojmë dhe do t'ju kthejmë hapat praktikë të radhës.",
    "projects.title": "LISTA E PROJEKTEVE",
    "projects.intro": "Më poshtë është një përzgjedhje e projekteve ku kemi qenë të përfshirë. Çdo projekt trajtohet me nivel të lartë përgjegjësie, në përputhje të plotë me kërkesat teknike dhe kushtet specifike të lokacionit.",
    "projects.filter.all": "Të gjitha projektet",
    "projects.filter.site": "Hulumtime në terren",
    "projects.filter.geotechnical": "Projekte gjeoteknike",
    "projects.filter.monitoring": "Monitorim teknik",
    "projects.group.investigations": "I. HULUMTIME DHE RAPORTE GJEOTEKNIKE",
    "projects.durdekovac.title": "Đurđekovac",
    "projects.durdekovac.text": "Objekt i këtij raporti gjeoteknik ishte kryerja e punimeve hulumtuese gjeoteknike me qëllim përcaktimin e kushteve të themeleve për një strukturë të ardhshme të vendosur në një shpat brenda zonës së një rrëshqitjeje të stabilizuar. Hulumtimet e kryera përcaktuan profilin gjeoteknik të tokës, duke përfshirë shpërndarjen e depozitimeve sipërfaqësore, thellësinë dhe karakteristikat e horizonteve potencialisht rrëshqitëse, si dhe kalimin në shtresa më të qëndrueshme. Për shkak të pasigurive fillestare të projektimit lidhur me vetë strukturën, kjo fazë propozoi kryerjen e një shpimi gjeoteknik në një lokacion përfaqësues, së bashku me hartëzimin inxhinieriko-gjeologjik të shpatit dhe paraqitjen e rezultateve në një plan përmbledhës. Bazuar në të dhënat e marra, u konkludua se në fazën kryesore të projektimit të themeleve do të ishte e arsyeshme të kryhej një shpim shtesë në këmbën e shpatit për të përcaktuar plotësisht profilin gjeoteknik dhe për të vlerësuar në mënyrë të besueshme stabilitetin e terrenit.",
    "projects.year.label": "viti i projektimit:",
    "projects.empty": "Projektet në këtë kategori do të shtohen së shpejti.",
    "about.title": "GEOtest Engineering",
    "about.intro": "Rrugëtimi në inxhinierinë gjeoteknike filloi përmes edukimit akademik, hulumtimeve në terren, punës projektuese dhe përvojës praktike në projekte. GEOtest Engineering e sjell këtë njohuri në çdo angazhim me qasje të saktë, të përgjegjshme dhe të përshtatur me kushtet e lokacionit. Sot, ne mbështesim projektet me mendim teknik të qartë, komunikim profesional dhe zgjidhje të përshtatura me kushtet reale të terrenit.",
    "about.mission.title": "Misioni Ynë",
    "about.mission.text": "Të ofrojmë zgjidhje gjeoteknike cilësore dhe inovative, të bazuara në saktësi, cilësi dhe standarde profesionale, duke ndihmuar klientët tanë të arrijnë qëllimet e tyre.",
    "about.vision.title": "Vizioni Ynë",
    "about.vision.text": "Të bëhemi partner i besueshëm në inxhinierinë gjeoteknike, i njohur për ekspertizë, qasje inovative dhe kontribut në zhvillimin e zgjidhjeve inxhinierike të sigurta dhe efikase.",
    "about.work.title": "Fushat Kryesore të Punës",
    "about.work.investigations": "<strong>Hulumtime gjeoteknike</strong> - Zhvillim i studimeve dhe projekteve për ndërtime të reja dhe ekzistuese, me qëllim sigurimin e sigurisë dhe efikasitetit përmes analizës së detajuar të lokacionit.",
    "about.work.design": "<strong>Projektim</strong> - Ofrojmë shërbime projektimi për të gjitha fazat e dokumentacionit, duke përfshirë studime, projekte konceptuale, kryesore dhe të detajuara, dokumentacion tenderi dhe mbikëqyrje të projektimit.",
    "about.work.supervision": "<strong>Mbikëqyrje profesionale</strong> - Ekipi ynë kryen mbikëqyrje në terren për zbatimin e duhur të rekomandimeve gjeoteknike dhe përputhjen me standardet teknike dhe të sigurisë gjatë ndërtimit.",
    "about.work.consulting": "<strong>Konsulencë</strong> - Ofrojmë mbështetje profesionale në të gjitha fazat e projekteve të ndërtimit, nga analiza fillestare e lokacionit deri te zbatimi final, duke garantuar zgjidhje optimale dhe minimizim të rreziqeve.",
    "about.varazdin.title": "Pse Varaždin?",
    "about.varazdin.text": "Zgjedhja e Varaždinit si seli e kompanisë bashkoi aspektet profesionale dhe personale të rrugëtimit tonë. Ky qytet, i pasur me traditë inxhinierike dhe mjedis dinamik biznesi, është dëshmuar si vend ideal për zhvillimin e një praktike të specializuar gjeoteknike. Fryma tradicionale dhe moderne e Varaždinit përputhet me vizionin tonë për inxhinierinë gjeoteknike. Në GEOtest Engineering krijojmë zgjidhje inovative për sfidat e ndërtimit modern.",
    "about.partner.title": "GEOtest Engineering - Partneri Juaj në Zhvillimin e Zgjidhjeve Gjeoteknike",
    "about.partner.left": "Ne ndjekim vazhdimisht trendet më të reja teknologjike dhe synojmë të angazhohemi aktivisht me komunitetin profesional. Presim mundësi të ardhshme për të ndarë njohuri dhe për të marrë pjesë në konferenca ndërkombëtare dhe takime profesionale.",
    "about.partner.right": "Nëse kërkoni këshillë profesionale, zgjidhje kreative ose partnerë të besueshëm, GEOtest Engineering është këtu për ju. Na kontaktoni dhe së bashku të ndërtojmë një të ardhme të qëndrueshme mbi parime të forta themelimi.",
    "about.partner.button": "Konsultim Falas",
    "contact.kicker": "Kontaktoni GEOtest",
    "contact.title": "Filloni projektin tuaj gjeoteknik me qartësi.",
    "contact.text": "Na kontaktoni drejtpërdrejt me email, ndani numrin tuaj të telefonit, ose dërgoni lokacionin e projektit. Mund të na dërgoni edhe informacionin tuaj më poshtë dhe ne do t'ju kontaktojmë.",
    "contact.direct.email": "Email",
    "contact.direct.phone": "Telefoni",
    "contact.direct.phoneValue": "+38349242052",
    "contact.direct.location": "Lokacioni",
    "contact.direct.locationValue": "Rruga \"Mizahir Isma\", Rahovec, Kosovë 21000",
    "contact.name": "Emri i plotë",
    "contact.email": "Email",
    "contact.phone": "Numri i telefonit",
    "contact.service": "Shërbimi",
    "contact.service.placeholder": "Zgjidh shërbimin",
    "contact.location": "Lokacioni i projektit",
    "contact.message": "Detajet e projektit",
    "contact.submit": "Dërgo kërkesën",
    "designing.title": "Projektim",
    "designing.intro": "Projektimi është hap i rëndësishëm për të siguruar një projekt ndërtimi të suksesshëm dhe të sigurt. GEOtest Engineering ofron shërbime të plota të projektimit gjeoteknik, nga zgjidhjet konceptuale deri te projektet e zbatimit.",
    "designing.includes.title": "Çfarë përfshin projektimi gjeoteknik?",
    "designing.includes.text": "Projektimi i strukturave gjeoteknike është kyç për stabilitetin dhe sigurinë e ndërtesave. GEOtest Engineering përgatit këto lloje projektesh gjeoteknike:",
    "designing.includes.one": "Struktura themelesh",
    "designing.includes.two": "Mbrojtje të gropave të ndërtimit",
    "designing.includes.three": "Sanime të rrëshqitjeve të dheut",
    "designing.includes.four": "Struktura mbajtëse",
    "designing.includes.five": "Përmirësim të tokës së themeleve",
    "designing.includes.six": "Struktura nëntokësore",
    "designing.standards": "Gjatë zhvillimit të projektit, ne ndjekim standardet kroate dhe evropiane për të siguruar nivelin më të lartë të cilësisë. Qasja jonë bazohet në mjete të avancuara llogaritëse për analiza gjeoteknike, duke arritur rezultate të sakta dhe siguri maksimale strukturore.",
    "designing.choice.title": "Pse të zgjidhni GEOtest Engineering?",
    "designing.choice.one": "Qasje e integruar në projektim - çdo projekt trajtohet duke marrë parasysh aspektet teknike dhe kërkesat specifike.",
    "designing.choice.two": "Zbatim i vazhdueshëm i inovacioneve teknologjike - ne ndjekim teknologjitë dhe metodat më të reja për të përmirësuar zgjidhjet tona.",
    "designing.choice.three": "Përdorim i programeve të avancuara llogaritëse - softueri profesional mundëson analiza të sakta dhe zgjidhje të optimizuara.",
    "designing.choice.four": "Qasje kreative inxhinierike që sjell rezultate të besueshme, praktike dhe efikase.",
    "consulting.title": "Konsulencë në Inxhinieri Gjeoteknike",
    "consulting.intro": "Konsulenca në inxhinieri gjeoteknike është thelbësore për realizimin e suksesshëm të projekteve të ndërtimit, sidomos kur trajtohen sfida komplekse që lidhen me projektimin e themeleve, stabilitetin e tokës dhe mbështetjen e gërmimeve. GEOtest Engineering ofron shërbime këshilluese të specializuara që mbulojnë planifikimin, analizën dhe kontrollin në gjeoteknikë. Ekipi ynë ofron mbështetje në të gjitha fazat e projektit për të siguruar cilësi dhe siguri në zbatim.",
    "consulting.areas.title": "Fushat e konsulencës:",
    "consulting.areas.one": "Themelet e strukturave",
    "consulting.areas.two": "Gropa gërmimi",
    "consulting.areas.three": "Struktura mbajtëse",
    "consulting.areas.four": "Përmirësimi i tokës",
    "consulting.areas.five": "Mbikëqyrja gjeoteknike",
    "consulting.experience": "Si ekspertë me përvojë të gjerë, ne jemi të përkushtuar të gjejmë zgjidhjet më të mira për sfidat specifike gjeoteknike. Çdo projekt kërkon analizë të saktë dhe përshtatje të zgjidhjeve me kushtet gjeoteknike për të arritur stabilitet dhe qëndrueshmëri afatgjatë të strukturës. Ekipi ynë i konsulencës përdor metoda dhe mjete softuerike moderne për analiza të hollësishme dhe zhvillimin e zgjidhjeve optimale.",
    "consulting.approach.title": "Qasja jonë:",
    "consulting.approach.one": "Analiza e kushteve gjeoteknike",
    "consulting.approach.two": "Zhvillimi i zgjidhjeve optimale",
    "consulting.approach.three": "Vlerësimi i rrezikut dhe kostos",
    "consulting.approach.four": "Mbështetje teknike gjatë zbatimit",
    "consulting.approach.five": "Kontrolli i cilësisë",
    "consulting.success": "Çelësi i suksesit tonë qëndron në një qasje të integruar dhe të përshtatur, e cila mundëson identifikimin në kohë të problemeve dhe propozimin e masave efektive për zgjidhjen e tyre. Gjatë çdo projekti, ne sigurojmë komunikim të vazhdueshëm me klientin për t'i përshtatur zgjidhjet me kërkesat specifike të projektit.",
    "consulting.commitment": "GEOtest Engineering është e përkushtuar të ofrojë shërbime konsulence të nivelit të lartë në inxhinieri gjeoteknike. Me përvojë dhe ekspertizë profesionale, ne mundësojmë realizimin e suksesshëm të projekteve duke minimizuar rreziqet dhe optimizuar kostot.",
    "geometric.title": "Hulumtim Gjeometrik",
    "geometric.intro": "Projektimi i besueshëm dhe ndërtimi cilësor varen nga të dhëna të hollësishme dhe të sakta të hulumtimit. GEOtest Engineering kryen hulumtime në terren, shpime, marrje mostrash dhe dokumentim që i japin çdo projekti bazë të qartë teknike para projektimit dhe zbatimit.",
    "geometric.panel.one": "Procesi ynë i hulumtimit kombinon inspektimin e lokacionit, shpimin me bërthamë, marrjen e mostrave, interpretimin gjeologjik dhe raportimin praktik. Ne mbledhim informacionin e nevojshëm për të kuptuar sjelljen e tokës, kushtet e ujërave nëntokësore, kapacitetin mbajtës dhe stabilitetin e shpatit.",
    "geometric.panel.two": "Hulumtimi gjeometrik dhe gjeoteknik mund të përfshijë:",
    "geometric.scope.one": "Shpime me bërthamë dhe marrje mostrash të tokës",
    "geometric.scope.two": "Shpime manuale për shpate dhe terrene të paarritshme",
    "geometric.scope.three": "Dokumentim në terren dhe përgatitje të mostrave laboratorike",
    "geometric.scope.four": "Interpretim të treguesve të tokës, shkëmbinjve, ujërave nëntokësore dhe stabilitetit",
    "geometric.includes.title": "Çfarë përfshijnë hulumtimet?",
    "geometric.includes.text": "Hulumtimi u jep projektuesve dhe investitorëve informacion të besueshëm për terrenin. Përmes punës në terren dhe interpretimit profesional, ne përcaktojmë kushtet që ndikojnë në vendimet e sigurta dhe efikase për themelet dhe shpatet.",
    "geometric.includes.one": "Përbërjen dhe vetitë e tokës",
    "geometric.includes.two": "Kapacitetin mbajtës të tokës së themeleve",
    "geometric.includes.three": "Nivelin e ujërave nëntokësore dhe kushtet e lokacionit",
    "geometric.includes.four": "Stabilitetin e shpatit dhe treguesit e rrezikut",
    "geometric.why.title": "Pse janë të rëndësishme hulumtimet?",
    "geometric.why.text": "Hulumtimet cilësore mundësojnë vendime më të mira për projektimin e themeleve, stabilitetin e shpateve dhe mbrojtjen e strukturave përreth. Ato ulin pasigurinë dhe ndihmojnë në parandalimin e problemeve të paparashikuara gjatë ndërtimit.",
    "supervision.title": "Mbikëqyrje në Inxhinieri Gjeoteknike",
    "supervision.intro": "Ndërtimi i besueshëm varet nga kontrolli i vazhdueshëm, dokumentimi i qartë dhe vendimet teknike në kohë. GEOtest Engineering ofron mbikëqyrje profesionale të punimeve gjeoteknike që zbatimi të ndjekë projektin, kushtet e terrenit të interpretohen saktë dhe cilësia të mbetet e qëndrueshme në çdo fazë.",
    "supervision.panel.one": "Procesi ynë i mbikëqyrjes kombinon vëzhgimin në terren, koordinimin e ndërtimit, verifikimin e punimeve të kryera dhe komunikimin me projektuesit, kontraktorët dhe investitorët. Ne monitorojmë detajet kritike që ndikojnë në sigurinë, qëndrueshmërinë dhe performancën afatgjatë.",
    "supervision.panel.two": "Mbikëqyrja profesionale në inxhinieri gjeoteknike mund të përfshijë:",
    "supervision.scope.one": "Kontrollin e gërmimit të themeleve dhe kushteve të tokës",
    "supervision.scope.two": "Monitorimin e strukturave mbajtëse, ankorëve dhe punimeve në shpate",
    "supervision.scope.three": "Verifikimin e dokumentacionit dhe përputhshmërisë teknike",
    "supervision.scope.four": "Koordinimin e masave korrigjuese kur ndryshojnë kushtet e terrenit",
    "supervision.includes.title": "Çfarë përfshin mbikëqyrja?",
    "supervision.includes.text": "Mbikëqyrja i jep ekipit të ndërtimit një kontroll teknik të besueshëm në terren. Përmes verifikimeve të rregullta dhe interpretimit profesional, ne ndihmojmë që sjellja e tokës, metoda e zbatimit dhe supozimet e projektit të mbeten të harmonizuara.",
    "supervision.includes.one": "Inspektimin e niveleve të gërmimit dhe përgatitjes së themeleve",
    "supervision.includes.two": "Shqyrtimin e treguesve të tokës, ujërave nëntokësore dhe stabilitetit",
    "supervision.includes.three": "Ndjekjen e masave gjeoteknike gjatë ndërtimit",
    "supervision.includes.four": "Raportim të qartë dhe rekomandime teknike praktike",
    "supervision.why.title": "Pse është e rëndësishme mbikëqyrja?",
    "supervision.why.text": "Kushtet në terren mund të ndryshojnë shpejt. Mbikëqyrja profesionale ul pasigurinë, ndihmon në parandalimin e vonesave dhe vendimeve të pasigurta, si dhe mbron cilësinë e strukturës përfundimtare nga gërmimi i parë deri te punimi i përfunduar.",
    "gtc.title": "GTC Compact",
    "gtc.text.one": "GTC Compact është një pajisje shumëfunksionale shpimi e projektuar për përdorim profesional. Ajo përbëhet nga njësia e shpimit dhe paketa hidraulike e fuqisë, të ndërtuara si njësi të ndara por të koordinuara, duke mundësuar fleksibilitet më të madh dhe transport më të lehtë në terrene sfiduese.",
    "gtc.text.two": "Makineria është veçanërisht e përshtatshme për hulumtime gjeoteknike në terrene të sheshta ose me pjerrësi të lehtë, duke përfshirë:",
    "gtc.use.one": "Kokën dhe fundin e rrëshqitjes së dheut",
    "gtc.use.two": "Themelet për ndërtesa banimi dhe industriale",
    "gtc.use.three": "Gropa të përkohshme gërmimi",
    "gtc.use.four": "Salla industriale dhe struktura të ngjashme",
    "manual.title": "Shpimi manual - shpate dhe rrëshqitje dheu",
    "manual.text.one": "GEOtest Engineering vazhdon të përdorë një nga metodat më të rëndësishme, por edhe më kërkuese të shpimit hulumtues: shpimin manual. Kjo metodë mbetet e domosdoshme në situata me terrene të pjerrëta, rrëshqitje aktive ose lokacione të paarritshme për makineri.",
    "manual.text.two": "Metoda e shpimit manual është veçanërisht e përshtatshme për hulumtime në terrene:",
    "manual.use.one": "Trupa të rrëshqitjeve të dheut",
    "manual.use.two": "Shpate terreni më të mëdha se 15°",
    "manual.use.three": "Lokacione të paarritshme si rrugë fushe, zona pyjore dhe vende pa rrugë qasjeje",
    "manual.use.four": "Verifikim i thellësisë deri në shkëmb dhe validim i profileve gjeofizike dhe metodave të tjera hulumtuese",
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

  document.querySelectorAll("[data-i18n-html]").forEach((element) => {
    const value = dictionary[element.dataset.i18nHtml];
    if (value) element.innerHTML = value;
  });

  document.querySelectorAll("[data-i18n-title]").forEach((element) => {
    const value = dictionary[element.dataset.i18nTitle];
    if (value) element.title = value;
  });
};

languageSelect?.addEventListener("change", (event) => {
  applyLanguage(event.target.value);
});

const defaultLanguage = "sq";
if (languageSelect) {
  languageSelect.value = defaultLanguage;
}
applyLanguage(defaultLanguage);

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const whatWeDoSection = document.querySelector("#what-we-do");
const recognitionSection = document.querySelector(".recognition-section");
const servicesOverviewSection = document.querySelector("#services");
const moreAboutSection = document.querySelector(".more-about-section");
const customProjectTop = document.querySelector(".custom-project-top");
const faqLayout = document.querySelector(".faq-layout");

if (!motionQuery.matches) {
  document.documentElement.classList.add("motion-ready");
}

const revealOnScroll = (element, threshold = 0.28) => {
  if (!element) return;

  if (motionQuery.matches || !("IntersectionObserver" in window)) {
    element.classList.add("is-visible");
  } else {
    const observer = new IntersectionObserver(
      ([entry], observer) => {
        if (!entry.isIntersecting) return;

        element.classList.add("is-visible");
        observer.unobserve(element);
      },
      { threshold },
    );

    observer.observe(element);
  }
};

revealOnScroll(whatWeDoSection);
revealOnScroll(recognitionSection, 0.22);
revealOnScroll(servicesOverviewSection, 0.22);
revealOnScroll(moreAboutSection, 0.22);
revealOnScroll(customProjectTop, 0.24);
revealOnScroll(faqLayout, 0.24);

document.querySelectorAll("[data-project-slider]").forEach((slider) => {
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

  previousButton?.addEventListener("click", () => {
    setActiveSlide(activeIndex - 1);
  });

  nextButton?.addEventListener("click", () => {
    setActiveSlide(activeIndex + 1);
  });

  slider.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      setActiveSlide(activeIndex - 1);
    }

    if (event.key === "ArrowRight") {
      setActiveSlide(activeIndex + 1);
    }
  });

  setActiveSlide(activeIndex);
});

const projectFilterButtons = Array.from(document.querySelectorAll("[data-project-filter]"));
const projectCards = Array.from(document.querySelectorAll("[data-project-card]"));
const projectEmptyMessage = document.querySelector("[data-project-empty]");
const projectListHeading = document.querySelector("#project-list-heading");

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

  if (projectEmptyMessage) {
    projectEmptyMessage.hidden = visibleCount > 0;
  }

  if (projectListHeading) {
    projectListHeading.hidden = visibleCount === 0;
  }
};

projectFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyProjectFilter(button.dataset.projectFilter || "all");
  });
});

if (projectFilterButtons.length) {
  applyProjectFilter("all");
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
