import vue from '@vitejs/plugin-vue';
import { defineConfig, type Plugin } from 'vite';

const KIBIBYTE = 1024;
const BUNDLE_BUDGETS = {
  entryJavaScript: 350 * KIBIBYTE,
  asyncJavaScript: 180 * KIBIBYTE,
  stylesheet: 120 * KIBIBYTE,
} as const;

function formatKibibytes(bytes: number): string {
  return `${(bytes / KIBIBYTE).toFixed(1)} KiB`;
}

function bundleBudgetPlugin(): Plugin {
  return {
    name: 'educsync-bundle-budgets',
    apply: 'build',
    generateBundle(_options, bundle) {
      const violations: string[] = [];

      for (const output of Object.values(bundle)) {
        if (output.type === 'chunk') {
          const size = Buffer.byteLength(output.code, 'utf8');
          const limit = output.isEntry
            ? BUNDLE_BUDGETS.entryJavaScript
            : BUNDLE_BUDGETS.asyncJavaScript;
          if (size > limit) {
            violations.push(
              `${output.fileName} depasse son budget (${formatKibibytes(size)} / ${formatKibibytes(limit)}).`,
            );
          }
          continue;
        }

        if (output.fileName.endsWith('.css')) {
          const size = typeof output.source === 'string'
            ? Buffer.byteLength(output.source, 'utf8')
            : output.source.byteLength;
          if (size > BUNDLE_BUDGETS.stylesheet) {
            violations.push(
              `${output.fileName} depasse son budget CSS (${formatKibibytes(size)} / ${formatKibibytes(BUNDLE_BUDGETS.stylesheet)}).`,
            );
          }
        }
      }

      if (violations.length > 0) {
        this.error(`Budgets de performance EduSync depasses:\n- ${violations.join('\n- ')}`);
      }
    },
  };
}

// Centralise la configuration Vite du frontend.
export default defineConfig({
  plugins: [vue(), bundleBudgetPlugin()],
  server: {
    port: 4174,
  },
});
