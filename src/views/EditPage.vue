<template>
  <main class="visual-edit-page">
    <section v-if="status" class="visual-edit-status" :class="`is-${statusType}`">
      {{ status }}
    </section>

    <section v-if="!session" class="visual-edit-login" aria-label="Admin login">
      <div>
        <p>GEOtest CMS</p>
        <h1>Sign in to edit the website</h1>
        <span>After login you will see the real website with edit buttons on text and images.</span>
      </div>
      <form @submit.prevent="signIn">
        <input v-model="login.email" type="email" placeholder="Email" autocomplete="email" required />
        <input
          v-model="login.password"
          type="password"
          placeholder="Password"
          autocomplete="current-password"
          required
        />
        <button type="submit" :disabled="isBusy">{{ isBusy ? "Signing in..." : "Sign in" }}</button>
      </form>
    </section>

    <section v-else class="visual-editor">
      <header class="visual-edit-toolbar">
        <div>
          <strong>Visual editor</strong>
          <span>{{ languageLabel }} text only. Images are shared for both languages.</span>
        </div>
        <nav aria-label="Editor pages">
          <button
            v-for="item in editablePages"
            :key="item.page"
            type="button"
            :class="{ 'is-active': selectedPage === item.page }"
            @click="selectedPage = item.page"
          >
            {{ item.label }}
          </button>
        </nav>
        <div class="visual-edit-actions">
          <select v-model="selectedLanguage" aria-label="Edit language">
            <option value="sq">Albanian</option>
            <option value="en">English</option>
          </select>
          <button type="button" @click="refreshPreview">Refresh</button>
          <button type="button" @click="signOut">Sign out</button>
        </div>
      </header>

      <div ref="pageRoot" class="visual-edit-preview" v-html="pageHtml"></div>
    </section>

    <dialog ref="textDialog" class="visual-edit-dialog">
      <form v-if="textDraft" @submit.prevent="saveText">
        <header>
          <div>
            <p>Edit {{ languageLabel }} text</p>
            <h2>{{ textDraft.key }}</h2>
          </div>
          <button type="button" @click="closeDialogs">×</button>
        </header>
        <textarea v-model="textDraft.value" rows="8" autofocus></textarea>
        <footer>
          <button type="button" @click="closeDialogs">Cancel</button>
          <button type="submit" :disabled="isBusy">{{ isBusy ? "Saving..." : "Save text" }}</button>
        </footer>
      </form>
    </dialog>

    <dialog ref="imageDialog" class="visual-edit-dialog">
      <form v-if="imageDraft" @submit.prevent="saveImage">
        <header>
          <div>
            <p>Edit image</p>
            <h2>Keep the same frame size</h2>
          </div>
          <button type="button" @click="closeDialogs">×</button>
        </header>
        <label>
          Choose photo
          <input type="file" accept="image/*" required @change="handleImageFile" />
        </label>
        <img
          v-if="imageDraft.previewUrl"
          class="visual-edit-image-preview"
          :src="imageDraft.previewUrl"
          alt="Selected image preview"
        />
        <p class="visual-edit-help">
          The image will fill the current website card/frame. The card keeps its size; the image is cropped with
          object-fit: cover when needed.
        </p>
        <footer>
          <button type="button" @click="closeDialogs">Cancel</button>
          <button type="submit" :disabled="isBusy">{{ isBusy ? "Saving..." : "Save image" }}</button>
        </footer>
      </form>
    </dialog>

    <dialog ref="projectDialog" class="visual-edit-dialog">
      <form v-if="projectDraft" @submit.prevent="saveProject">
        <header>
          <div>
            <p>Add project</p>
            <h2>{{ languageLabel }} project content</h2>
          </div>
          <button type="button" @click="closeDialogs">×</button>
        </header>
        <label>
          Category
          <select v-model="projectDraft.category" required>
            <option
              v-for="option in projectCategoryOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </label>
        <label>
          Project title
          <input v-model="projectDraft.title" type="text" required />
        </label>
        <label>
          Year text
          <input v-model="projectDraft.yearText" type="text" placeholder="viti i projektimit: 2026." />
        </label>
        <label>
          Project description
          <textarea v-model="projectDraft.description" rows="7" required></textarea>
        </label>
        <label>
          Project photos
          <input type="file" accept="image/*" multiple required @change="handleProjectFiles" />
        </label>
        <div v-if="projectDraft.previewUrls.length" class="visual-edit-project-previews">
          <img
            v-for="(previewUrl, index) in projectDraft.previewUrls"
            :key="previewUrl"
            class="visual-edit-project-preview"
            :src="previewUrl"
            :alt="`Selected project preview ${index + 1}`"
          />
        </div>
        <p class="visual-edit-help">
          Add up to 10 photos. They will become the project slider. Every photo fills the same frame and crops neatly.
        </p>
        <footer>
          <button type="button" @click="closeDialogs">Cancel</button>
          <button type="submit" :disabled="isBusy">{{ isBusy ? "Adding..." : "Add project" }}</button>
        </footer>
      </form>
    </dialog>

    <dialog ref="filterDialog" class="visual-edit-dialog">
      <form v-if="filterDraft" @submit.prevent="saveProjectFilter">
        <header>
          <div>
            <p>Project filters</p>
            <h2>Add or hide filter buttons</h2>
          </div>
          <button type="button" @click="closeDialogs">×</button>
        </header>
        <div class="visual-edit-filter-list">
          <div v-for="filter in filterDraft.items" :key="filter.value" class="visual-edit-filter-row">
            <span>{{ filter.label }}</span>
            <button
              type="button"
              :disabled="filter.value === 'all' || isBusy"
              @click="hideProjectFilter(filter)"
            >
              {{ filter.value === "all" ? "Required" : "Delete" }}
            </button>
          </div>
        </div>
        <label>
          New filter name
          <input v-model="filterDraft.label" type="text" placeholder="Example: Road projects" />
        </label>
        <p class="visual-edit-help">
          “All projects” stays always visible. New filters can be selected later when adding a project.
        </p>
        <footer>
          <button type="button" @click="closeDialogs">Cancel</button>
          <button type="submit" :disabled="isBusy || !filterDraft.label.trim()">
            {{ isBusy ? "Adding..." : "Add filter" }}
          </button>
        </footer>
      </form>
    </dialog>

    <dialog ref="deleteProjectsDialog" class="visual-edit-dialog">
      <form v-if="deleteProjectsDraft" @submit.prevent="removeAllEditableProjects">
        <header>
          <div>
            <p>Remove projects</p>
            <h2>Remove all editable projects?</h2>
          </div>
          <button type="button" @click="closeDialogs">×</button>
        </header>
        <p class="visual-edit-help">
          This will remove every project added from the editor from the live Projects page. Type REMOVE to confirm.
        </p>
        <label>
          Confirmation
          <input v-model="deleteProjectsDraft.confirmation" type="text" placeholder="REMOVE" required />
        </label>
        <footer>
          <button type="button" @click="closeDialogs">Cancel</button>
          <button
            class="visual-edit-danger-action"
            type="submit"
            :disabled="isBusy || deleteProjectsDraft.confirmation !== 'REMOVE'"
          >
            {{ isBusy ? "Removing..." : "Remove all projects" }}
          </button>
        </footer>
      </form>
    </dialog>
  </main>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { getSupabaseClient } from "../supabase.js";
import {
  applyCmsContent,
  initSitePage,
  loadCmsOverrides,
} from "../site-runtime.js";
import { translations } from "../translations.js";

const editablePages = [
  { page: "home", label: "Home" },
  { page: "about", label: "About" },
  { page: "projects", label: "Projects" },
  { page: "contact", label: "Contact" },
  { page: "designing", label: "Designing" },
  { page: "supervision", label: "Supervision" },
  { page: "consulting", label: "Consulting" },
  { page: "geometric-investigation", label: "Geometric" },
];

const router = useRouter();
const pageRoot = ref(null);
const textDialog = ref(null);
const imageDialog = ref(null);
const projectDialog = ref(null);
const filterDialog = ref(null);
const deleteProjectsDialog = ref(null);
const pageHtml = ref("");
const session = ref(null);
const selectedPage = ref("home");
const selectedLanguage = ref(localStorage.getItem("geotest-language") || "sq");
const isBusy = ref(false);
const status = ref("");
const statusType = ref("info");
const textDraft = ref(null);
const imageDraft = ref(null);
const projectDraft = ref(null);
const filterDraft = ref(null);
const deleteProjectsDraft = ref(null);
const projectCategoryOptions = ref([]);
const login = reactive({
  email: "",
  password: "",
});

let supabase;
let currentCmsOverrides;

const languageLabel = computed(() => (selectedLanguage.value === "en" ? "English" : "Albanian"));

const showStatus = (message, type = "info") => {
  status.value = message;
  statusType.value = type;
};

const routeMap = new Map([
  ["index.html#home", "/edit"],
  ["index.html", "/edit"],
  ["about.html", "/edit"],
  ["projects.html", "/edit"],
  ["contact.html", "/edit"],
  ["designing.html", "/edit"],
  ["supervision.html", "/edit"],
  ["consulting.html", "/edit"],
  ["geometric-investigation.html", "/edit"],
]);

const normalizeInternalLinks = (html) =>
  html
    .replace(/(src|href)="public\//g, '$1="/')
    .replace(/href="([^"]+)"/g, (match, href) => {
      if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return match;
      }

      const [path] = href.split("#");
      const mapped = routeMap.get(path);
      return mapped ? `href="${mapped}"` : match;
    });

const normalizeAssetPath = (value = "") =>
  value
    .trim()
    .replace(window.location.origin, "")
    .replace(/^\/?public\//, "/")
    .replace(/^([^/])/, "/$1");

const imageKey = (src) => `image:${normalizeAssetPath(src)}`;

const imageCmsKey = (image) =>
  image.dataset.cmsImageKey ? `image:${image.dataset.cmsImageKey}` : imageKey(image.dataset.cmsOriginalSrc || image.getAttribute("src"));

const extractBody = (documentText) => {
  const parser = new DOMParser();
  const parsed = parser.parseFromString(documentText, "text/html");
  parsed.body.querySelectorAll("script").forEach((script) => script.remove());
  return normalizeInternalLinks(parsed.body.innerHTML);
};

const loadPreview = async () => {
  isBusy.value = true;
  const response = await fetch(`/static-pages/${selectedPage.value}.html`, {
    cache: "no-cache",
  });
  pageHtml.value = extractBody(await response.text());
  await nextTick();
  currentCmsOverrides = await loadCmsOverrides({ force: true });
  await initSitePage(pageRoot.value, router, { forceCmsRefresh: true });
  applyCmsContent(pageRoot.value, selectedLanguage.value, currentCmsOverrides);
  localStorage.setItem("geotest-language", selectedLanguage.value);
  addEditButtons();
  isBusy.value = false;
};

const refreshPreview = async () => {
  await loadPreview();
  showStatus("Preview refreshed.", "success");
};

const addEditButtons = () => {
  if (!pageRoot.value) return;

  pageRoot.value.querySelectorAll("[data-i18n], [data-i18n-html]").forEach((element) => {
    const key = element.dataset.i18n || element.dataset.i18nHtml;
    if (!key || element.closest(".visual-edit-control-wrap")) return;

    const wrapper = document.createElement("span");
    wrapper.className = "visual-edit-control-wrap visual-edit-text-wrap";
    element.parentNode.insertBefore(wrapper, element);
    wrapper.appendChild(element);

    const button = document.createElement("button");
    button.className = "visual-edit-button";
    button.type = "button";
    button.textContent = "Edit";
    button.setAttribute("aria-label", `Edit ${key}`);
    button.addEventListener("click", () => openTextEditor(element, key));
    wrapper.appendChild(button);
  });

  pageRoot.value.querySelectorAll("img[src]").forEach((image) => {
    if (image.closest(".visual-edit-control-wrap")) return;

    const wrapper = document.createElement("span");
    wrapper.className = "visual-edit-control-wrap visual-edit-image-wrap";
    image.parentNode.insertBefore(wrapper, image);
    wrapper.appendChild(image);

    const button = document.createElement("button");
    button.className = "visual-edit-button visual-edit-image-button";
    button.type = "button";
    button.textContent = "Image";
    button.setAttribute("aria-label", "Edit image");
    button.addEventListener("click", () => openImageEditor(image));
    wrapper.appendChild(button);
  });

  addProjectCreateButton();
  addProjectFilterManageButton();
};

const addProjectCreateButton = () => {
  if (selectedPage.value !== "projects") return;

  const projectList = pageRoot.value?.querySelector(".project-list-inner");
  if (!projectList || projectList.querySelector("[data-add-project-button]")) return;

  const actions = document.createElement("div");
  actions.className = "visual-edit-project-actions";
  actions.dataset.addProjectButton = "true";

  const addButton = document.createElement("button");
  addButton.className = "visual-edit-add-project-button";
  addButton.type = "button";
  addButton.textContent = "+ Add project";
  addButton.addEventListener("click", openProjectEditor);

  const removeButton = document.createElement("button");
  removeButton.className = "visual-edit-remove-projects-button";
  removeButton.type = "button";
  removeButton.textContent = "Remove all projects";
  removeButton.addEventListener("click", openDeleteProjectsDialog);

  actions.append(addButton, removeButton);
  projectList.insertBefore(actions, projectList.firstElementChild);
};

const addProjectFilterManageButton = () => {
  if (selectedPage.value !== "projects") return;

  const filterBand = pageRoot.value?.querySelector(".project-filter-band");
  if (!filterBand || filterBand.querySelector("[data-manage-filters-button]")) return;

  const button = document.createElement("button");
  button.className = "visual-edit-manage-filters-button";
  button.type = "button";
  button.dataset.manageFiltersButton = "true";
  button.textContent = "+ Manage filters";
  button.addEventListener("click", openFilterEditor);
  filterBand.appendChild(button);
};

const getProjectCategoryOptions = () => {
  if (!pageRoot.value) return [{ value: "all", label: "All projects only" }];

  return Array.from(pageRoot.value.querySelectorAll("[data-project-filter]"))
    .filter((button) => !button.hidden)
    .map((button) => ({
      value: button.dataset.projectFilter,
      label:
        button.dataset.projectFilter === "all"
          ? `${button.textContent.trim()} only`
          : button.textContent.trim(),
    }));
};

const openTextEditor = (element, key) => {
  const existing = currentCmsOverrides?.text?.get(key);
  const isHtml = Boolean(element.dataset.i18nHtml);
  const fallback = translations[selectedLanguage.value]?.[key] || element.textContent.trim();
  const languageContent = existing?.translations?.[selectedLanguage.value] || {};

  textDraft.value = {
    key,
    isHtml,
    value: languageContent.html || languageContent.text || fallback,
  };
  textDialog.value?.showModal();
};

const openImageEditor = (image) => {
  const originalSrc = image.dataset.cmsOriginalSrc || normalizeAssetPath(image.getAttribute("src"));
  imageDraft.value = {
    cardKey: imageCmsKey(image),
    originalSrc,
    currentUrl: image.getAttribute("src"),
    file: null,
    previewUrl: image.getAttribute("src"),
  };
  imageDialog.value?.showModal();
};

const openProjectEditor = () => {
  projectCategoryOptions.value = getProjectCategoryOptions();
  projectDraft.value = {
    category: projectCategoryOptions.value.find((item) => item.value !== "all")?.value || "all",
    title: "",
    yearText: selectedLanguage.value === "sq" ? "viti i projektimit: 2026." : "year of design: 2026.",
    description: "",
    files: [],
    previewUrls: [],
    previewObjectUrls: [],
  };
  projectDialog.value?.showModal();
};

const openFilterEditor = () => {
  filterDraft.value = {
    label: "",
    items: getProjectCategoryOptions().map((item) => ({
      value: item.value,
      label: item.label.replace(/\s+only$/i, ""),
    })),
  };
  filterDialog.value?.showModal();
};

const openDeleteProjectsDialog = () => {
  deleteProjectsDraft.value = {
    confirmation: "",
  };
  deleteProjectsDialog.value?.showModal();
};

const closeDialogs = () => {
  if (imageDraft.value?.previewObjectUrl) {
    URL.revokeObjectURL(imageDraft.value.previewObjectUrl);
  }

  if (projectDraft.value?.previewObjectUrls?.length) {
    projectDraft.value.previewObjectUrls.forEach((previewObjectUrl) => URL.revokeObjectURL(previewObjectUrl));
  }

  textDialog.value?.close();
  imageDialog.value?.close();
  projectDialog.value?.close();
  filterDialog.value?.close();
  deleteProjectsDialog.value?.close();
  textDraft.value = null;
  imageDraft.value = null;
  projectDraft.value = null;
  filterDraft.value = null;
  deleteProjectsDraft.value = null;
};

const handleImageFile = (event) => {
  const [file] = Array.from(event.target.files || []);
  if (!file) return;

  if (imageDraft.value.previewObjectUrl) {
    URL.revokeObjectURL(imageDraft.value.previewObjectUrl);
  }

  const previewObjectUrl = URL.createObjectURL(file);
  imageDraft.value = {
    ...imageDraft.value,
    file,
    previewUrl: previewObjectUrl,
    previewObjectUrl,
  };
};

const handleProjectFiles = (event) => {
  const files = Array.from(event.target.files || []).slice(0, 10);
  if (!files.length) return;

  if (projectDraft.value.previewObjectUrls?.length) {
    projectDraft.value.previewObjectUrls.forEach((previewObjectUrl) => URL.revokeObjectURL(previewObjectUrl));
  }

  const previewObjectUrls = files.map((file) => URL.createObjectURL(file));
  projectDraft.value = {
    ...projectDraft.value,
    files,
    previewUrls: previewObjectUrls,
    previewObjectUrls,
  };
};

const uploadCmsPhoto = async (file, folder) => {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filePath = `${folder}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from("cms-media")
    .upload(filePath, file, {
      cacheControl: "31536000",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage.from("cms-media").getPublicUrl(filePath);
  return {
    publicUrl: publicUrlData.publicUrl,
    filePath,
  };
};

const getExistingInlineText = async (key) => {
  const { data, error } = await supabase
    .from("website_cards")
    .select("*")
    .eq("section_key", "inline_text")
    .eq("card_key", key)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const getExistingImage = async (cardKey, originalSrc) => {
  const { data, error } = await supabase
    .from("website_cards")
    .select("*")
    .eq("section_key", "inline_images")
    .or(`card_key.eq.${cardKey},card_key.eq.${imageKey(originalSrc)}`)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const getExistingProjectFilter = async (filterKey) => {
  const { data, error } = await supabase
    .from("website_cards")
    .select("*")
    .eq("section_key", "projects.filters")
    .eq("card_key", `filter.${filterKey}`)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const slugifyFilter = (value) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);

const translateAlbanianToEnglish = async (value = "") => {
  const text = value.trim();
  if (!text) return "";

  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=sq&tl=en&dt=t&q=${encodeURIComponent(text)}`,
    );
    if (!response.ok) throw new Error("Translation request failed.");

    const data = await response.json();
    const translated = Array.isArray(data?.[0])
      ? data[0].map((part) => part?.[0] || "").join("")
      : "";

    return translated.trim() || text;
  } catch (error) {
    console.warn("Automatic translation unavailable:", error.message);
    return text;
  }
};

const translateAlbanianHtmlToEnglish = async (html = "") => {
  if (!html.trim()) return "";

  const parser = new DOMParser();
  const documentFragment = parser.parseFromString(`<div>${html}</div>`, "text/html");
  const root = documentFragment.body.firstElementChild;
  const textNodes = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.nodeValue.trim()) textNodes.push(node);
  }

  for (const node of textNodes) {
    node.nodeValue = await translateAlbanianToEnglish(node.nodeValue);
  }

  return root.innerHTML;
};

const saveText = async () => {
  isBusy.value = true;
  try {
    const existing = await getExistingInlineText(textDraft.value.key);
    const shouldAutoTranslateText = selectedLanguage.value === "sq";
    const translatedEnglish = shouldAutoTranslateText
      ? textDraft.value.isHtml
        ? await translateAlbanianHtmlToEnglish(textDraft.value.value)
        : await translateAlbanianToEnglish(textDraft.value.value)
      : "";
    const translationsPayload = {
      ...(existing?.translations || {}),
      [selectedLanguage.value]: textDraft.value.isHtml
        ? { html: textDraft.value.value }
        : { text: textDraft.value.value },
      ...(shouldAutoTranslateText
        ? {
            en: textDraft.value.isHtml
              ? { ...(existing?.translations?.en || {}), html: translatedEnglish }
              : { ...(existing?.translations?.en || {}), text: translatedEnglish },
          }
        : {}),
    };
    const payload = {
      section_key: "inline_text",
      card_key: textDraft.value.key,
      translations: translationsPayload,
      category: "text",
      is_published: true,
      metadata: {
        ...(existing?.metadata || {}),
        page: selectedPage.value,
      },
      updated_at: new Date().toISOString(),
    };
    const query = existing
      ? supabase.from("website_cards").update(payload).eq("id", existing.id)
      : supabase.from("website_cards").insert(payload);
    const { error } = await query;
    if (error) throw error;

    closeDialogs();
    await loadPreview();
    showStatus(`${languageLabel.value} text saved.`, "success");
  } catch (error) {
    showStatus(error.message, "error");
  } finally {
    isBusy.value = false;
  }
};

const saveImage = async () => {
  isBusy.value = true;
  try {
    if (!imageDraft.value.file) {
      throw new Error("Please choose a photo first.");
    }

    const originalSrc = normalizeAssetPath(imageDraft.value.originalSrc);
    const cardKey = imageDraft.value.cardKey || imageKey(originalSrc);
    const existing = await getExistingImage(cardKey, originalSrc);
    const { publicUrl: imageUrl, filePath } = await uploadCmsPhoto(imageDraft.value.file, selectedPage.value);
    const payload = {
      section_key: "inline_images",
      card_key: cardKey,
      image_url: imageUrl,
      category: "image",
      is_published: true,
      metadata: {
        ...(existing?.metadata || {}),
        original_src: originalSrc,
        storage_bucket: "cms-media",
        storage_path: filePath,
        page: selectedPage.value,
      },
      updated_at: new Date().toISOString(),
    };
    const query = existing
      ? supabase.from("website_cards").update(payload).eq("id", existing.id)
      : supabase.from("website_cards").insert(payload);
    const { error } = await query;
    if (error) throw error;

    closeDialogs();
    await loadPreview();
    showStatus("Image saved and fitted into the existing frame.", "success");
  } catch (error) {
    showStatus(error.message, "error");
  } finally {
    isBusy.value = false;
  }
};

const saveProject = async () => {
  isBusy.value = true;
  try {
    if (!projectDraft.value.files.length) {
      throw new Error("Please choose at least one project photo.");
    }

    const uploadedPhotos = [];
    for (const file of projectDraft.value.files.slice(0, 10)) {
      uploadedPhotos.push(await uploadCmsPhoto(file, "projects"));
    }

    const cardKey = `project.${crypto.randomUUID()}`;
    const categories =
      projectDraft.value.category === "all" ? [] : [projectDraft.value.category];
    const projectContent = {
      title: projectDraft.value.title.trim(),
      description: projectDraft.value.description.trim(),
      yearText: projectDraft.value.yearText.trim(),
    };
    const englishProjectContent =
      selectedLanguage.value === "sq"
        ? {
            title: await translateAlbanianToEnglish(projectContent.title),
            description: await translateAlbanianToEnglish(projectContent.description),
            yearText: await translateAlbanianToEnglish(projectContent.yearText),
          }
        : null;
    const translationsPayload = {
      [selectedLanguage.value]: projectContent,
      ...(englishProjectContent ? { en: englishProjectContent } : {}),
    };
    const gallery = uploadedPhotos.map((photo) => ({
      url: photo.publicUrl,
      storage_path: photo.filePath,
    }));
    const payload = {
      section_key: "projects.list",
      card_key: cardKey,
      translations: translationsPayload,
      image_url: gallery[0]?.url,
      category: projectDraft.value.category,
      sort_order: Date.now(),
      is_published: true,
      metadata: {
        page: "projects",
        categories,
        gallery,
        storage_bucket: "cms-media",
        storage_path: gallery[0]?.storage_path,
      },
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("website_cards").insert(payload);
    if (error) throw error;

    closeDialogs();
    await loadPreview();
    showStatus("Project added.", "success");
  } catch (error) {
    showStatus(error.message, "error");
  } finally {
    isBusy.value = false;
  }
};

const saveProjectFilter = async () => {
  isBusy.value = true;
  try {
    const label = filterDraft.value.label.trim();
    const existingKeys = new Set(filterDraft.value.items.map((item) => item.value));
    let filterKey = slugifyFilter(label) || `filter-${Date.now()}`;
    if (existingKeys.has(filterKey)) {
      filterKey = `${filterKey}-${Date.now().toString().slice(-5)}`;
    }
    const existing = await getExistingProjectFilter(filterKey);

    const payload = {
      section_key: "projects.filters",
      card_key: `filter.${filterKey}`,
      translations: {
        ...(existing?.translations || {}),
        [selectedLanguage.value]: { title: label },
        ...(selectedLanguage.value === "sq"
          ? {
              en: {
                ...(existing?.translations?.en || {}),
                title: await translateAlbanianToEnglish(label),
              },
            }
          : {}),
      },
      category: "project-filter",
      sort_order: existing?.sort_order || Date.now(),
      is_published: true,
      metadata: {
        ...(existing?.metadata || {}),
        page: "projects",
        filter_key: filterKey,
        custom: true,
        hidden: false,
      },
      updated_at: new Date().toISOString(),
    };
    const query = existing
      ? supabase.from("website_cards").update(payload).eq("id", existing.id)
      : supabase.from("website_cards").insert(payload);
    const { error } = await query;
    if (error) throw error;

    closeDialogs();
    await loadPreview();
    showStatus("Project filter added.", "success");
  } catch (error) {
    showStatus(error.message, "error");
  } finally {
    isBusy.value = false;
  }
};

const hideProjectFilter = async (filter) => {
  if (filter.value === "all") return;

  isBusy.value = true;
  try {
    const existing = await getExistingProjectFilter(filter.value);
    const payload = {
      section_key: "projects.filters",
      card_key: `filter.${filter.value}`,
      translations: {
        ...(existing?.translations || {}),
        [selectedLanguage.value]: {
          title: filter.label,
        },
      },
      category: "project-filter",
      sort_order: existing?.sort_order || Date.now(),
      is_published: true,
      metadata: {
        ...(existing?.metadata || {}),
        page: "projects",
        filter_key: filter.value,
        hidden: true,
      },
      updated_at: new Date().toISOString(),
    };
    const query = existing
      ? supabase.from("website_cards").update(payload).eq("id", existing.id)
      : supabase.from("website_cards").insert(payload);
    const { error } = await query;
    if (error) throw error;

    closeDialogs();
    await loadPreview();
    showStatus("Project filter deleted from the live page.", "success");
  } catch (error) {
    showStatus(error.message, "error");
  } finally {
    isBusy.value = false;
  }
};

const removeAllEditableProjects = async () => {
  if (deleteProjectsDraft.value.confirmation !== "REMOVE") return;

  isBusy.value = true;
  try {
    const { error } = await supabase
      .from("website_cards")
      .update({
        is_published: false,
        updated_at: new Date().toISOString(),
      })
      .eq("section_key", "projects.list");

    if (error) throw error;

    closeDialogs();
    await loadPreview();
    showStatus("All editable projects were removed from the live page.", "success");
  } catch (error) {
    showStatus(error.message, "error");
  } finally {
    isBusy.value = false;
  }
};

const signIn = async () => {
  isBusy.value = true;
  const { data, error } = await supabase.auth.signInWithPassword({
    email: login.email,
    password: login.password,
  });
  isBusy.value = false;

  if (error) {
    showStatus(error.message, "error");
    return;
  }

  session.value = data.session;
  await loadPreview();
};

const signOut = async () => {
  await supabase.auth.signOut();
  session.value = null;
  pageHtml.value = "";
  showStatus("Signed out.", "info");
};

onMounted(async () => {
  try {
    supabase = await getSupabaseClient();
    const { data } = await supabase.auth.getSession();
    session.value = data.session;
    if (session.value) await loadPreview();
  } catch (error) {
    showStatus(error.message, "error");
  }
});

watch([selectedPage, selectedLanguage], async () => {
  if (!session.value) return;
  await loadPreview();
});
</script>
