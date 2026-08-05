import { createApp } from 'vue';
import { configurationApplicationFrontend } from './config/app.config';
import { configurationOffline } from './config/offline.config';
import App from './App.vue';
import { routeur } from './router';
import { initializeFrontendSession } from './shared/auth/session.bootstrap';
import { initializeDomainStoreLifecycleRegistry } from './shared/lifecycle/domain-store-lifecycle.registry';
import { useTheme } from './composables/useTheme';
import { registerServiceWorker } from './shared/pwa/register-sw';
import './styles/variables.css';
import './styles/base.css';
import './styles/design-system.css';
import './styles/layout.css';
import './styles/composants.css';
import './styles/referentiel.css';
import './styles/animations.css';
import './styles/shell.css';
import './styles/theme-dark.css';
import './styles/auth.css';

// Point d'entree technique du frontend.
void configurationApplicationFrontend;
void configurationOffline;

async function demarrerFrontend(): Promise<void> {
  initializeDomainStoreLifecycleRegistry();
  const initialisationSession = initializeFrontendSession();

  const application = createApp(App);

  application.use(routeur);
  application.mount('#app');
  registerServiceWorker();

  await initialisationSession;
  await useTheme().initTheme();

  const { initializeOfflineRuntime } = await import('./offline/runtime/offline-runtime');
  initializeOfflineRuntime();
}

void demarrerFrontend();
