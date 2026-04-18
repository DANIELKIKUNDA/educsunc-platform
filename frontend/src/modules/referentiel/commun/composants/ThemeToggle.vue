<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next';
import { useTheme } from '../../../../composables/useTheme';

const { isDark, toggleTheme } = useTheme();
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    @click="toggleTheme"
    :aria-label="isDark ? 'Passer au mode clair' : 'Passer au mode sombre'"
  >
    <Sun v-if="isDark" class="theme-icon theme-icon--sun" />
    <Moon v-else class="theme-icon theme-icon--moon" />
    <span class="theme-label">{{ isDark ? 'Clair' : 'Sombre' }}</span>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: var(--rayon-moyen);
  background: var(--couleur-surface);
  color: var(--couleur-texte);
  cursor: pointer;
  transition: all var(--transition-rapide) ease;
  font-size: 0.875rem;
  font-weight: 500;
}

.theme-toggle:hover {
  background: var(--couleur-surface-froide);
  border-color: var(--couleur-principale);
  transform: translateY(-1px);
}

.theme-toggle:active {
  transform: translateY(0);
}

.theme-icon {
  width: 1rem;
  height: 1rem;
  transition: transform var(--transition-rapide) ease;
}

.theme-icon--sun {
  color: #fbbf24;
}

.theme-icon--moon {
  color: #6366f1;
}

.theme-toggle:hover .theme-icon {
  transform: rotate(15deg) scale(1.1);
}

.theme-label {
  font-weight: 600;
  letter-spacing: 0.025em;
}

@media (max-width: 768px) {
  .theme-label {
    display: none;
  }
  
  .theme-toggle {
    padding: 0.5rem;
  }
}
</style>
