<template>
  <div ref="pageRoot" v-html="pageHtml"></div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { initSitePage } from "../site-runtime.js";

const props = defineProps({
  page: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["page-loading"]);
const router = useRouter();
const pageRoot = ref(null);
const pageHtml = ref("");

const routeMap = new Map([
  ["index.html#home", "/#home"],
  ["index.html", "/"],
  ["about.html", "/about"],
  ["projects.html", "/projects"],
  ["contact.html", "/contact"],
  ["designing.html", "/designing"],
  ["supervision.html", "/supervision"],
  ["consulting.html", "/consulting"],
  ["geometric-investigation.html", "/geometric-investigation"],
]);

const normalizeInternalLinks = (html) =>
  html
    .replace(/(src|href)="public\//g, '$1="/')
    .replace(/href="([^"]+)"/g, (match, href) => {
      if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return match;
      }

      const [path, hash = ""] = href.split("#");
      const mapped = routeMap.get(path);

      if (!mapped) {
        return match;
      }

      return `href="${mapped}${hash ? `#${hash}` : ""}"`;
    });

const extractBody = (documentText) => {
  const parser = new DOMParser();
  const parsed = parser.parseFromString(documentText, "text/html");
  parsed.body.querySelectorAll("script").forEach((script) => script.remove());
  return normalizeInternalLinks(parsed.body.innerHTML);
};

const loadPage = async () => {
  emit("page-loading", true);

  try {
    const response = await fetch(`/static-pages/${props.page}.html`, {
      cache: "no-cache",
    });

    if (!response.ok) {
      throw new Error(`Could not load ${props.page}`);
    }

    pageHtml.value = extractBody(await response.text());
    await nextTick();
    initSitePage(pageRoot.value, router);
  } finally {
    window.setTimeout(() => emit("page-loading", false), 260);
  }
};

onMounted(loadPage);
watch(() => props.page, loadPage);
</script>
