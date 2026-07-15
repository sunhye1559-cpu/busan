import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Board from '../views/Board.vue'
import MapView from '../views/Map.vue'
import Dashboard from '../views/Dashboard.vue'
import Calendar from '../views/Calendar.vue'
import Bookmarks from '../views/Bookmarks.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/board', component: Board },
    { path: '/map', component: MapView },
    { path: '/dashboard', component: Dashboard },
    { path: '/calendar', component: Calendar },
    { path: '/bookmarks', component: Bookmarks },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
