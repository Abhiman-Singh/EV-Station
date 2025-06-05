// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import AuthPage from '../views/AuthPage.vue';
import ChargerListPage from '../views/ChargerListPage.vue';
import HomePage from '../views/HomePage.vue'; // Import the new Home Page

const routes = [
  {
    path: '/',
    name: 'Home', // Give it a name
    component: HomePage, // Set Home Page as the default route
    meta: { requiresAuth: false } // No auth required for home page
  },
  {
    path: '/login', // Explicit login path
    name: 'Login',
    component: AuthPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/chargers',
    name: 'Chargers', // Give it a name
    component: ChargerListPage,
    meta: { requiresAuth: true } // This route requires authentication
  },
  // Catch-all route for 404s (optional, but good practice)
  {
    path: '/:catchAll(.*)',
    redirect: '/' // Redirects any unmatched path to the home page
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token'); // Check for token

  if (to.meta.requiresAuth && !isAuthenticated) {
    // If route requires auth and user is not authenticated, redirect to Home
    next({ name: 'Home' });
  } else if ((to.name === 'Home' || to.name === 'Login') && isAuthenticated) {
    // If user is authenticated and trying to go to Home or Login, redirect to Chargers
    next({ name: 'Chargers' });
  } else {
    // Otherwise, proceed to route
    next();
  }
});

export default router;