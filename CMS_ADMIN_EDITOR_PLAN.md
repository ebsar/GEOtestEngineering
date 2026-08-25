# GEOtest Engineering Admin Editor / CMS Plan

## Goal

Build a professional admin-only `/edit` page where one website section or card is edited once, with bilingual English and Albanian content stored inside the same record.

Do not duplicate sections, cards, projects, FAQ items, services, or buttons per language. A card such as `services.designing` must exist once, with multilingual content in `translations`.

## Data Model

Use `website_sections` for main page sections and single content blocks. Use `website_cards` for repeated items such as service cards, FAQ rows, project cards, gallery items, lists, and navigation items.

```sql
create extension if not exists pgcrypto;

create table if not exists website_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text unique not null,
  translations jsonb not null default '{}',
  image_url text,
  button_url text,
  metadata jsonb not null default '{}',
  is_published boolean not null default true,
  updated_at timestamp not null default now()
);

create table if not exists website_cards (
  id uuid primary key default gen_random_uuid(),
  section_key text not null,
  card_key text,
  translations jsonb not null default '{}',
  image_url text,
  icon text,
  button_url text,
  category text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  metadata jsonb not null default '{}',
  updated_at timestamp not null default now(),
  unique (section_key, card_key)
);

create index if not exists website_cards_section_sort_idx
  on website_cards (section_key, is_published, sort_order);
```

Use `metadata` for shared values that are not normal fields yet, for example `alt`, `page`, `anchor_id`, `gallery_group`, `external_url`, `form_field_type`, or `css_variant`.

## Translation Format

Every editable text record should use this JSON shape:

```json
{
  "en": {
    "title": "About Us",
    "subtitle": "Professional engineering services",
    "description": "We provide professional geotechnical solutions.",
    "button_text": "Learn More"
  },
  "sq": {
    "title": "Rreth Nesh",
    "subtitle": "Shërbime profesionale inxhinierike",
    "description": "Ne ofrojmë zgjidhje profesionale gjeoteknike.",
    "button_text": "Mëso më shumë"
  }
}
```

Language codes:
- `en` = English
- `sq` = Albanian

Avoid `title_en`, `title_sq`, `description_en`, and `description_sq` columns. The JSONB format is cleaner, keeps one admin row per content item, and can support extra languages later.

## Public Language Helper

Keep the existing language switcher. Add a helper that never lets the public website go blank:

```js
function getTranslatedContent(item, currentLanguage, hardcodedFallback = {}) {
  const translations = item?.translations || {};
  const primary = translations[currentLanguage];
  const secondaryLanguage = currentLanguage === "sq" ? "en" : "sq";
  const secondary = translations[secondaryLanguage];

  return {
    ...hardcodedFallback,
    ...(secondary || {}),
    ...(primary || {})
  };
}
```

Fallback order:
- English: `translations.en`, then `translations.sq`, then current hardcoded content.
- Albanian: `translations.sq`, then `translations.en`, then current hardcoded content.

If CMS fetch fails, render the current static HTML plus `script.js` translations exactly as the site does now.

## Admin `/edit` Page

The `/edit` page should be admin-only. It should include:

- Login/session protection before showing content.
- A left sidebar grouped by page: Home, About Us, Services, Projects, Contact, Footer.
- One row per section/card.
- Search by `section_key`, `card_key`, title, category, or page.
- Filters for page, category, published/unpublished, and missing translation.
- Preview state showing English and Albanian completion status.

### Editor Modal

Each row opens an edit modal.

Language tabs:
- English
- Albanian

Inside each language tab:
- title
- subtitle
- description
- button text
- optional rich text/body/list items when needed

Shared fields outside the language tabs:
- image
- image alt text in `metadata.alt`
- icon
- button URL
- category
- sort order
- published/unpublished status
- extra metadata as advanced JSON

The admin should always know which language is active. Do not place English and Albanian inputs side by side in the same form area.

## Section Keys

Recommended `website_sections.section_key` records:

- `site.header`
- `site.footer`
- `home.hero`
- `home.what_we_do`
- `home.recognition`
- `home.services`
- `home.more_about`
- `home.project_development`
- `home.faq`
- `about.intro`
- `about.mission_vision`
- `about.key_areas`
- `about.varazdin`
- `about.partner_cta`
- `projects.hero`
- `projects.filters`
- `projects.list`
- `contact.hero`
- `contact.details`
- `contact.form`
- `services.designing.page`
- `services.supervision.page`
- `services.consulting.page`
- `services.geometric.page`

## Card Keys

Recommended `website_cards` records:

- Header nav: `nav.home`, `nav.services`, `nav.projects`, `nav.about`, `nav.contacts`
- Service overview cards: `services.designing`, `services.supervision`, `services.consulting`, `services.geometric`
- More About accordion cards: `more.modern`, `more.investigations`, `more.designing`, `more.consulting`, `more.mechanics`
- FAQ cards: `faq.report`, `faq.required`, `faq.anchor`, `faq.contact`
- Project cards: `project.durdekovac`
- Project gallery cards: `project.durdekovac.site`, `project.durdekovac.core_one`, `project.durdekovac.slope`, `project.durdekovac.core_two`
- About work cards: `about.work.investigations`, `about.work.design`, `about.work.supervision`, `about.work.consulting`
- Designing list cards: `designing.includes.foundation`, `designing.includes.pits`, `designing.includes.landslide`, `designing.includes.retaining`, `designing.includes.soil`, `designing.includes.underground`
- Designing choice cards: `designing.choice.integrated`, `designing.choice.innovations`, `designing.choice.software`, `designing.choice.creative`
- Supervision scope cards: `supervision.scope.excavation`, `supervision.scope.monitoring`, `supervision.scope.documentation`, `supervision.scope.corrective`
- Supervision includes cards: `supervision.includes.excavation`, `supervision.includes.soil`, `supervision.includes.measures`, `supervision.includes.reporting`
- GTC use cards: `gtc.use.landslide`, `gtc.use.foundations`, `gtc.use.pits`, `gtc.use.halls`
- Manual drilling cards: `manual.use.landslides`, `manual.use.slopes`, `manual.use.inaccessible`, `manual.use.bedrock`
- Consulting area cards: `consulting.areas.foundation`, `consulting.areas.pits`, `consulting.areas.retaining`, `consulting.areas.soil`, `consulting.areas.supervision`
- Consulting approach cards: `consulting.approach.analysis`, `consulting.approach.solutions`, `consulting.approach.risk`, `consulting.approach.support`, `consulting.approach.quality`
- Geometric scope cards: `geometric.scope.drilling`, `geometric.scope.manual`, `geometric.scope.documentation`, `geometric.scope.interpretation`
- Contact detail cards: `contact.email`, `contact.phone`, `contact.location`
- Contact form fields: `contact.form.name`, `contact.form.email`, `contact.form.phone`, `contact.form.location`, `contact.form.message`, `contact.form.submit`

## Current Website Audit

### `index.html`

Editable sections:
- Header nav and language selector.
- Home hero logo reveal, tagline, and four small service images.
- What We Do section title, paragraph, and background image.
- Recognition image, title, and paragraph.
- Services overview section title and four service cards with icon, title, and link.
- Services overview image.
- More About Us section title, image, and five accordion cards.
- Project Development image, title, description, button text, and button URL.
- FAQ title and four FAQ cards.
- Footer logo, contact button, and copyright text.

### `about.html`

Editable sections:
- About intro title, intro paragraph, and company text.
- Mission and Vision text.
- Structure image `about-shtylla.png`.
- Key Areas of Work title, text cards, and image `about-key-areas.png`.
- Why Rahovec title, text, and image `about-varazdin.png`.
- Partner CTA title, two paragraphs, button text, and button URL.
- Footer content.

### `projects.html`

Editable sections:
- Project list hero title and intro.
- Filter buttons/categories.
- Project group title.
- Project card `Đurđekovac` with description, year, category, images, image order, and published status.
- Empty category message.
- Footer content.

### `contact.html`

Editable sections:
- Contact kicker, title, intro text.
- Contact details: email, phone, location.
- Contact motion/visual metadata if later converted to configurable artwork.
- Contact form labels, placeholders, field order, submit text, and recipient email.
- Footer content.

### Service Detail Pages

Editable sections:
- `designing.html`: title, intro, image, include list, standards paragraph, choice list.
- `supervision.html`: intro, panels, scope list, includes list, why text, GTC Compact content, soil gallery, manual drilling content and gallery.
- `consulting.html`: title, intro, areas list, experience paragraph, approach list, success paragraph, commitment paragraph, image.
- `geometric-investigation.html`: title, intro, panels, scope list, includes list, why text, image/gallery content.

### Assets To Store As Shared Fields

Store image paths in `image_url`, not inside translations:

- `public/images/what-we-do-background.png`
- `public/images/recognition-site.png`
- `public/images/services-site.png`
- `public/images/more-about-slope.png`
- `public/images/car-project.jpg`
- `public/images/about-shtylla.png`
- `public/images/about-key-areas.png`
- `public/images/about-varazdin.png`
- `public/images/project-durdekovac-site.jpeg`
- `public/images/project-durdekovac-core-one.jpeg`
- `public/images/project-durdekovac-slope.jpeg`
- `public/images/project-durdekovac-core-two.png`
- service detail images such as `designing-detail.png`, `supervision-detail.png`, `consulting-detail.png`, and drilling/gallery images.

## Migration Strategy

1. Keep the current static site as the fallback.
2. Seed `website_sections` and `website_cards` from the current `script.js` translation keys and HTML image/link fields.
3. Add read-only CMS loading first. Public pages should prefer CMS content but fallback to hardcoded text.
4. Build `/edit` for admin editing after public CMS rendering is stable.
5. Add image upload/storage once text editing is stable.
6. Add preview and publish/unpublish controls.

## Example Seed Records

```json
{
  "section_key": "home.project_development",
  "translations": {
    "en": {
      "title": "Project Development Tailored to Your Needs",
      "description": "GEOtest Engineering develops technical solutions tailored to your needs.",
      "button_text": "Free consulting"
    },
    "sq": {
      "title": "Zhvillim projekti i përshtatur për nevojat tuaja",
      "description": "GEOtest Engineering zhvillon zgjidhje teknike të përshtatura për nevojat tuaja.",
      "button_text": "Konsultim falas"
    }
  },
  "image_url": "public/images/car-project.jpg",
  "button_url": "contact.html",
  "metadata": {
    "page": "home",
    "anchor_id": "projects"
  }
}
```

```json
{
  "section_key": "home.services",
  "card_key": "services.designing",
  "translations": {
    "en": {
      "title": "Designing",
      "description": "",
      "button_text": ""
    },
    "sq": {
      "title": "Projektimi",
      "description": "",
      "button_text": ""
    }
  },
  "icon": "document-pen",
  "button_url": "designing.html",
  "category": "service",
  "sort_order": 10,
  "is_published": true
}
```

## Admin Validation Rules

- Require `section_key` for every section.
- Require `section_key` and `card_key` for every repeated card.
- Warn if both English and Albanian titles are empty.
- Warn if a published item has no fallback content.
- Validate `button_url` as internal path or full URL.
- Validate `image_url` exists or is a valid uploaded asset URL.
- Preserve old content until the admin clicks Save.
- Show a “missing Albanian” or “missing English” badge instead of blocking publish.

## Implementation Notes

The current code already has `data-i18n` keys and a language switcher. That is good: the CMS can map each static key into a section/card record.

The key technical change is to move from a flat `translations` object in `script.js` to CMS records while keeping `script.js` as a hardcoded fallback. This means the public site stays stable even if the database is empty, temporarily unavailable, or one language is incomplete.
