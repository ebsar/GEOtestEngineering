<template>
  <main class="edit-page">
    <section class="edit-shell" aria-labelledby="edit-title">
      <div class="edit-topbar">
        <div>
          <p class="edit-kicker">GEOtest CMS</p>
          <h1 id="edit-title">Website editor</h1>
          <p>Edit one section or card once, with English and Albanian content inside it.</p>
        </div>
        <RouterLink class="edit-home-link" to="/">View website</RouterLink>
      </div>

      <section v-if="status" class="edit-alert" :class="`is-${statusType}`">
        {{ status }}
      </section>

      <section v-if="!session" class="edit-login-card" aria-label="Admin login">
        <h2>Admin login</h2>
        <p>Use your Supabase admin user email and password to open the editor.</p>
        <form class="edit-login-form" @submit.prevent="signIn">
          <label>
            Email
            <input v-model="login.email" type="email" autocomplete="email" required />
          </label>
          <label>
            Password
            <input v-model="login.password" type="password" autocomplete="current-password" required />
          </label>
          <button type="submit" :disabled="isBusy">
            {{ isBusy ? "Signing in..." : "Sign in" }}
          </button>
        </form>
      </section>

      <section v-else class="edit-workspace">
        <aside class="edit-sidebar">
          <div class="edit-user">
            <span>Signed in</span>
            <strong>{{ session.user.email }}</strong>
          </div>
          <button class="edit-secondary-button" type="button" @click="signOut">Sign out</button>

          <label class="edit-search">
            Search content
            <input v-model="search" type="search" placeholder="section, card, title..." />
          </label>

          <div class="edit-tabs" role="tablist" aria-label="Content type">
            <button
              type="button"
              :class="{ 'is-active': activeTable === 'sections' }"
              @click="activeTable = 'sections'"
            >
              Sections
            </button>
            <button
              type="button"
              :class="{ 'is-active': activeTable === 'cards' }"
              @click="activeTable = 'cards'"
            >
              Cards
            </button>
          </div>

          <button class="edit-primary-button" type="button" @click="createItem">
            New {{ activeTable === "sections" ? "section" : "card" }}
          </button>
        </aside>

        <div class="edit-content">
          <header class="edit-list-header">
            <h2>{{ activeTable === "sections" ? "Website sections" : "Website cards" }}</h2>
            <button class="edit-secondary-button" type="button" @click="loadData">Refresh</button>
          </header>

          <div class="edit-table" role="table">
            <button
              v-for="item in filteredItems"
              :key="item.id"
              class="edit-row"
              type="button"
              @click="openItem(item)"
            >
              <span>
                <strong>{{ item.section_key }}</strong>
                <small v-if="item.card_key">{{ item.card_key }}</small>
              </span>
              <span>{{ getTitle(item) || "Untitled" }}</span>
              <span class="edit-badges">
                <em :class="{ 'is-missing': !item.translations?.en }">EN</em>
                <em :class="{ 'is-missing': !item.translations?.sq }">AL</em>
                <em :class="{ 'is-off': !item.is_published }">
                  {{ item.is_published ? "Published" : "Hidden" }}
                </em>
              </span>
            </button>
          </div>
        </div>
      </section>
    </section>

    <dialog ref="editorDialog" class="edit-modal" @close="resetDraft">
      <form v-if="draft" method="dialog" @submit.prevent>
        <header class="edit-modal-header">
          <div>
            <p class="edit-kicker">{{ activeTable === "sections" ? "Section" : "Card" }}</p>
            <h2>{{ draft.id ? "Edit content" : "Create content" }}</h2>
          </div>
          <button type="button" class="edit-icon-button" @click="closeDialog">×</button>
        </header>

        <div class="edit-modal-grid">
          <section class="edit-shared-fields">
            <h3>Shared fields</h3>
            <label>
              Section key
              <input v-model.trim="draft.section_key" required />
            </label>
            <label v-if="activeTable === 'cards'">
              Card key
              <input v-model.trim="draft.card_key" required />
            </label>
            <label>
              Image URL
              <input v-model.trim="draft.image_url" placeholder="public/images/example.png" />
            </label>
            <label v-if="activeTable === 'cards'">
              Icon
              <input v-model.trim="draft.icon" placeholder="document-pen" />
            </label>
            <label>
              Button URL
              <input v-model.trim="draft.button_url" placeholder="/contact" />
            </label>
            <label v-if="activeTable === 'cards'">
              Category
              <input v-model.trim="draft.category" placeholder="service, faq, project..." />
            </label>
            <label v-if="activeTable === 'cards'">
              Sort order
              <input v-model.number="draft.sort_order" type="number" />
            </label>
            <label class="edit-checkbox">
              <input v-model="draft.is_published" type="checkbox" />
              Published
            </label>
          </section>

          <section class="edit-language-fields">
            <div class="edit-language-tabs" role="tablist" aria-label="Language">
              <button
                type="button"
                :class="{ 'is-active': activeLanguage === 'en' }"
                @click="activeLanguage = 'en'"
              >
                English
              </button>
              <button
                type="button"
                :class="{ 'is-active': activeLanguage === 'sq' }"
                @click="activeLanguage = 'sq'"
              >
                Albanian
              </button>
            </div>

            <div class="edit-language-panel">
              <label>
                Title
                <input v-model="draft.translations[activeLanguage].title" />
              </label>
              <label>
                Subtitle
                <input v-model="draft.translations[activeLanguage].subtitle" />
              </label>
              <label>
                Description
                <textarea v-model="draft.translations[activeLanguage].description" rows="8"></textarea>
              </label>
              <label>
                Button text
                <input v-model="draft.translations[activeLanguage].button_text" />
              </label>
            </div>
          </section>
        </div>

        <footer class="edit-modal-actions">
          <button type="button" class="edit-secondary-button" @click="closeDialog">Cancel</button>
          <button type="button" class="edit-primary-button" :disabled="isBusy" @click="saveDraft">
            {{ isBusy ? "Saving..." : "Save changes" }}
          </button>
        </footer>
      </form>
    </dialog>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { getSupabaseClient } from "../supabase.js";

const session = ref(null);
const sections = ref([]);
const cards = ref([]);
const activeTable = ref("sections");
const activeLanguage = ref("en");
const editorDialog = ref(null);
const draft = ref(null);
const search = ref("");
const isBusy = ref(false);
const status = ref("");
const statusType = ref("info");
const login = reactive({
  email: "",
  password: "",
});

let supabase;

const showStatus = (message, type = "info") => {
  status.value = message;
  statusType.value = type;
};

const activeItems = computed(() => (activeTable.value === "sections" ? sections.value : cards.value));

const filteredItems = computed(() => {
  const query = search.value.trim().toLowerCase();
  if (!query) return activeItems.value;

  return activeItems.value.filter((item) => {
    const haystack = [
      item.section_key,
      item.card_key,
      item.category,
      item.translations?.en?.title,
      item.translations?.sq?.title,
      item.translations?.en?.description,
      item.translations?.sq?.description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
});

const getTitle = (item) => item.translations?.en?.title || item.translations?.sq?.title || "";

const normalizeDraft = (item = {}) => ({
  id: item.id || null,
  section_key: item.section_key || "",
  card_key: item.card_key || "",
  translations: {
    en: {
      title: item.translations?.en?.title || "",
      subtitle: item.translations?.en?.subtitle || "",
      description: item.translations?.en?.description || "",
      button_text: item.translations?.en?.button_text || "",
    },
    sq: {
      title: item.translations?.sq?.title || "",
      subtitle: item.translations?.sq?.subtitle || "",
      description: item.translations?.sq?.description || "",
      button_text: item.translations?.sq?.button_text || "",
    },
  },
  image_url: item.image_url || "",
  icon: item.icon || "",
  button_url: item.button_url || "",
  category: item.category || "",
  sort_order: item.sort_order || 0,
  is_published: item.is_published ?? true,
  metadata: item.metadata || {},
});

const loadData = async () => {
  if (!supabase || !session.value) return;

  isBusy.value = true;
  const [sectionResult, cardResult] = await Promise.all([
    supabase.from("website_sections").select("*").order("section_key"),
    supabase.from("website_cards").select("*").order("section_key").order("sort_order"),
  ]);
  isBusy.value = false;

  if (sectionResult.error || cardResult.error) {
    showStatus(sectionResult.error?.message || cardResult.error?.message, "error");
    return;
  }

  sections.value = sectionResult.data || [];
  cards.value = cardResult.data || [];
  showStatus("CMS content loaded.", "success");
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
  showStatus("Signed in successfully.", "success");
  await loadData();
};

const signOut = async () => {
  await supabase.auth.signOut();
  session.value = null;
  sections.value = [];
  cards.value = [];
  showStatus("Signed out.", "info");
};

const openItem = (item) => {
  draft.value = normalizeDraft(item);
  editorDialog.value?.showModal();
};

const createItem = () => {
  draft.value = normalizeDraft();
  editorDialog.value?.showModal();
};

const closeDialog = () => {
  editorDialog.value?.close();
};

const resetDraft = () => {
  draft.value = null;
  activeLanguage.value = "en";
};

const saveDraft = async () => {
  if (!draft.value?.section_key) {
    showStatus("Section key is required.", "error");
    return;
  }

  if (activeTable.value === "cards" && !draft.value.card_key) {
    showStatus("Card key is required.", "error");
    return;
  }

  const table = activeTable.value === "sections" ? "website_sections" : "website_cards";
  const payload = {
    section_key: draft.value.section_key,
    translations: draft.value.translations,
    image_url: draft.value.image_url || null,
    button_url: draft.value.button_url || null,
    is_published: draft.value.is_published,
    metadata: draft.value.metadata || {},
    updated_at: new Date().toISOString(),
  };

  if (activeTable.value === "cards") {
    Object.assign(payload, {
      card_key: draft.value.card_key,
      icon: draft.value.icon || null,
      category: draft.value.category || null,
      sort_order: Number(draft.value.sort_order || 0),
    });
  }

  isBusy.value = true;
  const query = draft.value.id
    ? supabase.from(table).update(payload).eq("id", draft.value.id).select().single()
    : supabase.from(table).insert(payload).select().single();

  const { error } = await query;
  isBusy.value = false;

  if (error) {
    showStatus(error.message, "error");
    return;
  }

  closeDialog();
  showStatus("Content saved.", "success");
  await loadData();
};

onMounted(async () => {
  try {
    supabase = await getSupabaseClient();
    const { data } = await supabase.auth.getSession();
    session.value = data.session;

    if (session.value) {
      await loadData();
    }
  } catch (error) {
    showStatus(error.message, "error");
  }
});

watch(activeTable, () => {
  search.value = "";
});
</script>
