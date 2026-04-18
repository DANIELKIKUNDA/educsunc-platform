<script setup lang="ts">
import { AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-vue-next';
import type { MessageAlerte } from '../../ecole/stores/referentiel-ecole-demo.store';

interface Props {
  message: MessageAlerte;
}

defineProps<Props>();

const getIcon = (type: MessageAlerte['type']) => {
  switch (type) {
    case 'danger':
      return AlertTriangle;
    case 'attention':
      return AlertCircle;
    case 'succes':
      return CheckCircle;
    case 'info':
      return Info;
    default:
      return AlertCircle;
  }
};

const getIconColor = (type: MessageAlerte['type']) => {
  switch (type) {
    case 'danger':
      return '#f87171';
    case 'attention':
      return '#fbbf24';
    case 'succes':
      return '#34d399';
    case 'info':
      return '#60a5fa';
    default:
      return '#6b7280';
  }
};
</script>

<template>
  <!-- Affiche une alerte lisible sans exposer les détails techniques. -->
  <article class="alerte-metier interactive-card">
    <div
      class="alerte-metier__icone"
      :style="{ backgroundColor: getIconColor(message.type) }"
    >
      <component :is="getIcon(message.type)" class="alerte-icon" />
    </div>
    <div class="alerte-metier__contenu">
      <h4 class="alerte-metier__titre">{{ message.titre }}</h4>
      <p class="alerte-metier__message">{{ message.message }}</p>
      <div class="alerte-metier__actions" v-if="message.actions">
        <button
          v-for="action in message.actions"
          :key="action.libelle"
          class="alerte-action button-lift"
          @click="action.action"
        >
          {{ action.libelle }}
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.alerte-metier {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: var(--rayon-moyen);
  background: var(--couleur-surface);
  border: 1px solid var(--couleur-bordure);
  transition: all var(--transition-rapide) ease;
}

.alerte-metier:hover {
  border-color: var(--couleur-principale);
  box-shadow: 0 4px 12px rgba(45, 95, 159, 0.1);
}

.alerte-metier__icone {
  display: grid;
  width: 2rem;
  height: 2rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50%;
  color: white;
  transition: transform var(--transition-rapide) ease;
}

.alerte-metier:hover .alerte-metier__icone {
  transform: scale(1.1);
}

.alerte-icon {
  width: 1rem;
  height: 1rem;
}

.alerte-metier__contenu {
  flex: 1;
  min-width: 0;
}

.alerte-metier__titre {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--couleur-encre);
  line-height: 1.4;
}

.alerte-metier__message {
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
  color: var(--couleur-texte-douce);
  line-height: 1.5;
}

.alerte-metier__actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.alerte-action {
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: var(--rayon-moyen);
  background: var(--couleur-surface);
  color: var(--couleur-texte);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-rapide) ease;
}

.alerte-action:hover {
  background: var(--couleur-principale);
  color: white;
  border-color: var(--couleur-principale);
  transform: translateY(-1px);
}

.alerte-action:active {
  transform: translateY(0);
}
</style>
