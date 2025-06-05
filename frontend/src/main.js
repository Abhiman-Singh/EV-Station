// frontend/src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import '@fortawesome/fontawesome-free/css/all.css';

// Import Leaflet CSS
// main.js or main.ts
import 'leaflet/dist/leaflet.css';


const app = createApp(App);
app.use(router);
app.mount('#app');