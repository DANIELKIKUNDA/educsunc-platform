<template>
  <PageContainer>
    <LoadingState
      v-if="vm.destination.value"
      title="Ouverture du Centre Notifications"
      message="Les outils correspondant à votre niveau sont en cours d'ouverture."
    />

    <template v-else>
      <PageHeader
        eyebrow="CENTRE PLATEFORME"
        title="Centre Notifications"
        description="Comprenez et gouvernez la diffusion des informations sans mélanger les responsabilités de la Plateforme, des organisations et des écoles."
      />

      <section class="notifications-hero" aria-labelledby="notifications-hero-title">
        <div class="notifications-hero__icon" aria-hidden="true">
          <BellRing :size="28" />
        </div>
        <div>
          <span class="notifications-hero__eyebrow">Niveau Plateforme</span>
          <h2 id="notifications-hero-title">Une diffusion gouvernée au plus près des établissements</h2>
          <p>
            Les messages sont envoyés depuis les écoles et supervisés au niveau des organisations.
            Aucune opération globale directe n'est exposée au niveau Plateforme dans les capacités actuelles.
          </p>
        </div>
      </section>

      <SectionBlock
        title="Organisation du service"
        description="Chaque niveau retrouve uniquement les outils correspondant à ses responsabilités réelles."
      >
        <div class="notifications-capabilities">
          <article class="notifications-capability">
            <span class="notifications-capability__icon notifications-capability__icon--school">
              <School :size="22" />
            </span>
            <div>
              <small>École</small>
              <h3>Diffusion locale</h3>
              <p>Composer, consulter et suivre les notifications destinées à la communauté scolaire.</p>
            </div>
          </article>

          <article class="notifications-capability">
            <span class="notifications-capability__icon notifications-capability__icon--organization">
              <Building2 :size="22" />
            </span>
            <div>
              <small>Organisation</small>
              <h3>Supervision consolidée</h3>
              <p>Suivre les archives, les remontées et les capacités de diffusion des écoles rattachées.</p>
            </div>
          </article>

          <article class="notifications-capability">
            <span class="notifications-capability__icon notifications-capability__icon--automatic">
              <Workflow :size="22" />
            </span>
            <div>
              <small>Automatisation</small>
              <h3>Événements métier</h3>
              <p>Les événements scolaires et financiers produisent les notifications prévues par les workflows actifs.</p>
            </div>
          </article>
        </div>
      </SectionBlock>

      <div class="notifications-guidance" role="status">
        <Info :size="20" aria-hidden="true" />
        <div>
          <strong>Pourquoi aucune action globale n'apparaît ici ?</strong>
          <p>
            Le niveau Plateforme ne possède actuellement aucun workflow de diffusion directe.
            Les actions deviennent disponibles dans le niveau et pour l'acteur officiellement autorisés.
          </p>
        </div>
      </div>
    </template>
  </PageContainer>
</template>

<script setup lang="ts">
import { BellRing, Building2, Info, School, Workflow } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import { useNotificationsEntryViewModel } from '../viewmodels/useNotificationsEntryViewModel';

const vm = useNotificationsEntryViewModel();
</script>

<style scoped>
.notifications-hero {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 1.2rem;
  align-items: start;
  overflow: hidden;
  padding: clamp(1.25rem, 3vw, 2rem);
  border: 1px solid color-mix(in srgb, var(--ui-primary) 18%, var(--ui-border));
  border-radius: var(--ui-radius-xl);
  background:
    radial-gradient(circle at 92% 12%, color-mix(in srgb, var(--ui-primary) 14%, transparent), transparent 34%),
    linear-gradient(145deg, var(--ui-surface), var(--ui-surface-subtle));
  box-shadow: var(--ui-shadow-md);
}

.notifications-hero__icon,
.notifications-capability__icon {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  color: #fff;
  background: linear-gradient(135deg, #8b1e4f, #d45a7f);
  box-shadow: 0 12px 28px rgb(139 30 79 / 20%);
}

.notifications-hero__icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 1.1rem;
}

.notifications-hero__eyebrow,
.notifications-capability small {
  color: var(--ui-primary);
  font-size: .75rem;
  font-weight: 800;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.notifications-hero h2,
.notifications-capability h3 {
  margin: .35rem 0 .45rem;
  color: var(--ui-text-strong);
}

.notifications-hero h2 {
  font-size: clamp(1.25rem, 2vw, 1.7rem);
}

.notifications-hero p,
.notifications-capability p,
.notifications-guidance p {
  margin: 0;
  color: var(--ui-text-muted);
  line-height: 1.6;
}

.notifications-capabilities {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.notifications-capability {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: .9rem;
  min-height: 10rem;
  padding: 1.1rem;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  background: linear-gradient(180deg, var(--ui-surface), var(--ui-surface-subtle));
  box-shadow: var(--ui-shadow-sm);
}

.notifications-capability__icon {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: .9rem;
}

.notifications-capability__icon--school {
  background: linear-gradient(135deg, #075d78, #14a3b8);
}

.notifications-capability__icon--organization {
  background: linear-gradient(135deg, #234b8f, #4f7dd6);
}

.notifications-capability__icon--automatic {
  background: linear-gradient(135deg, #8a5a00, #d79a1d);
}

.notifications-guidance {
  display: flex;
  align-items: flex-start;
  gap: .8rem;
  padding: 1rem 1.1rem;
  border: 1px solid color-mix(in srgb, var(--ui-primary) 20%, var(--ui-border));
  border-radius: var(--ui-radius-lg);
  color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 6%, var(--ui-surface));
}

.notifications-guidance svg {
  flex: 0 0 auto;
  margin-top: .1rem;
}

.notifications-guidance strong {
  display: block;
  margin-bottom: .2rem;
  color: var(--ui-text-strong);
}

@media (max-width: 960px) {
  .notifications-capabilities {
    grid-template-columns: 1fr;
  }

  .notifications-capability {
    min-height: 0;
  }
}

@media (max-width: 560px) {
  .notifications-hero,
  .notifications-capability {
    grid-template-columns: 1fr;
  }
}
</style>
