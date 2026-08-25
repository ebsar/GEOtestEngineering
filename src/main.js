import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import StaticPage from "./views/StaticPage.vue";
import EditPage from "./views/EditPage.vue";
import { applySeo } from "./seo.js";
import "./admin.css";

const routes = [
  { path: "/", component: StaticPage, props: { page: "home" } },
  { path: "/about", component: StaticPage, props: { page: "about" } },
  { path: "/projects", component: StaticPage, props: { page: "projects" } },
  { path: "/contact", component: StaticPage, props: { page: "contact" } },
  { path: "/designing", component: StaticPage, props: { page: "designing" } },
  { path: "/supervision", component: StaticPage, props: { page: "supervision" } },
  { path: "/consulting", component: StaticPage, props: { page: "consulting" } },
  {
    path: "/geometric-investigation",
    component: StaticPage,
    props: { page: "geometric-investigation" },
  },
  { path: "/edit", component: EditPage },
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: "smooth",
      };
    }

    return { top: 0 };
  },
});

// Keep the document head in sync with the active route so every page has a
// unique title, description, canonical URL and social preview.
router.afterEach((to) => {
  applySeo(to.path);
});

createApp(App).use(router).mount("#app");
