import { configurationApplicationFrontend } from './config/app.config';
import { configurationOffline } from './config/offline.config';
import { createApp } from 'vue';
import App from './App.vue';
import { routeur } from './router';
import './styles/variables.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/composants.css';
import './styles/referentiel.css';
import './styles/animations.css';

// Point d'entree technique du frontend.
void configurationApplicationFrontend;
void configurationOffline;

const application = createApp(App);

application.use(routeur);
application.mount('#app');
