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
const pageHtml = ref("");
const session = ref(null);
const selectedPage = ref("home");
const selectedLanguage = ref(localStorage.getItem("geotest-language") || "sq");
const isBusy = ref(false);
const status = ref("");
const statusType = ref("info");
const textDraft = ref(null);
const imageDraft = ref(null);
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
    originalSrc,
    currentUrl: image.getAttribute("src"),
    file: null,
    previewUrl: image.getAttribute("src"),
  };
  imageDialog.value?.showModal();
};

const closeDialogs = () => {
  if (imageDraft.value?.previewObjectUrl) {
    URL.revokeObjectURL(imageDraft.value.previewObjectUrl);
  }

  textDialog.value?.close();
  imageDialog.value?.close();
  textDraft.value = null;
  imageDraft.value = null;
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

const getExistingImage = async (originalSrc) => {
  const { data, error } = await supabase
    .from("website_cards")
    .select("*")
    .eq("section_key", "inline_images")
    .eq("card_key", imageKey(originalSrc))
    .maybeSingle();

  if (error) throw error;
  return data;
};

const saveText = async () => {
  isBusy.value = true;
  try {
    const existing = await getExistingInlineText(textDraft.value.key);
    const translationsPayload = {
      ...(existing?.translations || {}),
      [selectedLanguage.value]: textDraft.value.isHtml
        ? { html: textDraft.value.value }
        : { text: textDraft.value.value },
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
    const existing = await getExistingImage(originalSrc);
    const extension = imageDraft.value.file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `${selectedPage.value}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("cms-media")
      .upload(filePath, imageDraft.value.file, {
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from("cms-media").getPublicUrl(filePath);
    const imageUrl = publicUrlData.publicUrl;
    const payload = {
      section_key: "inline_images",
      card_key: imageKey(originalSrc),
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
