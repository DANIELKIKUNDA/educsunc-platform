<template>
  <main class="access-denied" aria-labelledby="access-denied-title">
    <div class="access-denied__icon" aria-hidden="true">!</div>
    <p class="access-denied__eyebrow">Accès protégé</p>
    <h1 id="access-denied-title">Aucun espace de travail disponible</h1>
    <p>
      Votre session est valide, mais aucune page ne correspond actuellement à vos
      permissions et à votre périmètre actif.
    </p>
    <button type="button" @click="onRetry">
      Relire mes accès
    </button>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { rechargerProfilEffectifFrontend } from '../auth/session.bootstrap';
import { getFirstAccessibleRoute } from '../doctrine/doctrine.resolver';

const router = useRouter();

async function onRetry(): Promise<void> {
  await rechargerProfilEffectifFrontend();
  const target = getFirstAccessibleRoute();
  if (target !== '/app/acces-refuse') {
    await router.replace(target);
  }
}
</script>

<style scoped>
.access-denied {
  width: min(620px, calc(100% - 32px));
  margin: clamp(48px, 12vh, 120px) auto;
  padding: clamp(28px, 5vw, 48px);
  border: 1px solid #dce5ef;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 24px 70px rgb(23 48 76 / 10%);
  text-align: center;
}

.access-denied__icon {
  display: grid;
  width: 48px;
  height: 48px;
  margin: 0 auto 18px;
  place-items: center;
  border-radius: 16px;
  color: #a76008;
  background: #fff4df;
  font-size: 1.3rem;
  font-weight: 900;
}

.access-denied__eyebrow {
  margin: 0 0 8px;
  color: #58718c;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: #102844;
  font-size: clamp(1.5rem, 3vw, 2.25rem);
}

p:not(.access-denied__eyebrow) {
  max-width: 500px;
  margin: 14px auto 24px;
  color: #5f738a;
  line-height: 1.65;
}

button {
  min-height: 44px;
  padding: 0 20px;
  border: 0;
  border-radius: 12px;
  color: #fff;
  background: #0c62d6;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}
</style>
