import { ref, watch } from 'vue';

type Theme = 'light' | 'dark';

const theme = ref<Theme>('light');

export function useTheme() {
  const isDark = ref(false);

  // Initialiser le thème depuis localStorage ou système
  const initTheme = () => {
    const savedTheme = localStorage.getItem('educsyn-theme') as Theme;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    theme.value = savedTheme || systemTheme;
    updateTheme();
  };

  const updateTheme = () => {
    isDark.value = theme.value === 'dark';
    document.documentElement.setAttribute('data-theme', theme.value);
    localStorage.setItem('educsyn-theme', theme.value);
  };

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    
    // Ajouter la classe de transition pour un changement fluide
    document.documentElement.classList.add('theme-transition');
    
    updateTheme();
    
    // Retirer la classe après la transition
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 600);
  };

  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme;
    updateTheme();
  };

  // Écouter les changements système
  watch(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
    (isDarkSystem) => {
      if (!localStorage.getItem('educsyn-theme')) {
        setTheme(isDarkSystem ? 'dark' : 'light');
      }
    }
  );

  return {
    theme,
    isDark,
    toggleTheme,
    setTheme,
    initTheme
  };
}
