import { createRouter, createWebHistory } from 'vue-router'
import MainView from "@/views/MainView"
import ExampleView from "@/views/ExampleView"
import TryView from "@/views/TryView"
import HelpView from "@/views/HelpView"

const routes = [
  {
    path: '/about',
    component: MainView
  },
  {
    path: '/',
    component: ExampleView
  },
  {
    path: '/try',
    component: TryView
  },
  {
    path: '/help',
    component: HelpView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
