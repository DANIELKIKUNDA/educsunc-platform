import { Money } from '../../../../domain/value-objects/Money';
import type { RecusPaiementReadModel } from '../../../../application/read-models/RecusPaiementReadModel';
import { BaseDepotPostgresPaiementsFacturation } from '../depots/BaseDepotPostgresPaiementsFacturation';
import type { ClientPostgresPaiementsFacturation } from '../depots/ClientPostgresPaiementsFacturation';

interface RecuPaiementOfficielResumePostgres {
  id: string;
  numero_recu: string;
  id_paiement: string;
  id_eleve: string;
  id_caissier: string;
  total_paye: number;
  devise: 'CDF' | 'USD';
  mode_paiement: string;
  date_emission: Date | string;
  statut_recu: string;
}

export class RecusPaiementQueryRepository extends BaseDepotPostgresPaiementsFacturation {
  constructor(clientLecture: ClientPostgresPaiementsFacturation) {
    super(clientLecture);
  }

  public async listerRecus(params: {
    idEcole: string;
    idEleve?: string;
    numeroRecu?: string;
    dateDebut?: string;
    dateFin?: string;
  }): Promise<RecusPaiementReadModel> {
    const clauses = ['"id_ecole" = $1'];
    const valeurs: unknown[] = [params.idEcole];

    if (params.idEleve !== undefined) {
      clauses.push(`"id_eleve" = $${valeurs.length + 1}`);
      valeurs.push(params.idEleve);
    }

    if (params.numeroRecu !== undefined) {
      clauses.push(`"numero_recu" = $${valeurs.length + 1}`);
      valeurs.push(params.numeroRecu);
    }

    if (params.dateDebut !== undefined) {
      clauses.push(`DATE("date_emission") >= $${valeurs.length + 1}`);
      valeurs.push(params.dateDebut);
    }

    if (params.dateFin !== undefined) {
      clauses.push(`DATE("date_emission") <= $${valeurs.length + 1}`);
      valeurs.push(params.dateFin);
    }

    const lignes = await this.executerRequete<RecuPaiementOfficielResumePostgres>(
      [
        'SELECT "id", "numero_recu", "id_paiement", "id_eleve", "id_caissier",',
        '"total_paye", "devise", "mode_paiement", "date_emission", "statut_recu"',
        'FROM "recus_paiement_officiels"',
        `WHERE ${clauses.join(' AND ')}`,
        'ORDER BY "date_emission" DESC, "numero_recu" DESC',
      ].join(' '),
      valeurs,
    );

    return {
      idEcole: params.idEcole,
      filtres: {
        idEleve: params.idEleve,
        numeroRecu: params.numeroRecu,
        dateDebut: params.dateDebut,
        dateFin: params.dateFin,
      },
      recus: lignes.map((ligne) => ({
        idRecu: ligne.id,
        numeroRecu: ligne.numero_recu,
        idPaiement: ligne.id_paiement,
        idEleve: ligne.id_eleve,
        idCaissier: ligne.id_caissier,
        dateEmission: new Date(ligne.date_emission),
        modePaiement: ligne.mode_paiement,
        totalPaye: new Money(ligne.total_paye, ligne.devise),
        statutRecu: ligne.statut_recu,
      })),
    };
  }
}
