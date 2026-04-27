import type { UseCase } from '../../../../../shared/application/UseCase';

// Ce fichier definit un type court pour injecter des use-cases dans les controleurs HTTP.
export type CasUsageHttp<TEntree = any, TSortie = any> = UseCase<TEntree, TSortie>;
