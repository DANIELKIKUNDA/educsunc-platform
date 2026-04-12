import { executerSeedSectionsScolaires } from './seed-sections-scolaires';
import { executerSeedOptionsEtudes } from './seed-options-etudes';
import { executerSeedClassesAcademiques } from './seed-classes-academiques';

// Ce seed principal regroupe les donnees de reference du BC Referentiel Academique.
const executerSeedReferentielAcademique = async (): Promise<void> => {
  const bilanSections = await executerSeedSectionsScolaires();
  const bilanOptions = await executerSeedOptionsEtudes();
  const bilanClasses = await executerSeedClassesAcademiques();

  console.log('Seed du referentiel academique termine.', {
    sectionsScolaires: bilanSections,
    optionsEtudes: bilanOptions,
    classesAcademiques: bilanClasses,
  });
};

void executerSeedReferentielAcademique().catch((erreur: unknown) => {
  if (erreur instanceof Error) {
    const erreurAvecMetadata = erreur as Error & { metadata?: unknown; code?: string };

    console.error('Echec du seed du referentiel academique.', {
      nom: erreur.name,
      message: erreur.message,
      code: erreurAvecMetadata.code,
      metadata: erreurAvecMetadata.metadata,
      stack: erreur.stack,
    });
  } else {
    console.error('Echec du seed du referentiel academique.', { valeur: erreur });
  }

  process.exitCode = 1;
});
