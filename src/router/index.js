import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import GenererView from '../views/GenererView.vue'
import CVEditorView from '../views/CVEditorView.vue'
import CVColorfulView from '../views/CVColorfulView.vue'
import Login from '../views/Login.vue'
import SignUp from '../views/SignUp.vue'
import ForgotPassword from '../views/ForgotPassword.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/generer',
    name: 'generer',
    component: GenererView
  },
  {
    path: '/generer/ats',
    name: 'cv-ats',
    component: CVEditorView
  },
  {
    path: '/generer/main',
    name: 'cv-main',
    component: CVColorfulView
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/signup',
    name: 'signup',
    component: SignUp
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPassword
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router