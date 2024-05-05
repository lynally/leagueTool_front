import { createRouter, createWebHashHistory } from "vue-router";

import HomeView from "../views/HomeView.vue";
import GameSet from "../views/GameSet.vue";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/gameSet/:gameId?",
      name: "gameSet",
      component: GameSet,
    },
  ],
});

export default router;
