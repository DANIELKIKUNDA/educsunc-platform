export type FormErrors<T extends string> = Partial<Record<T, string>>;
export const required = (value: string, label: string, max = 160): string | undefined => {
  const v=value.trim(); if(!v) return `${label} est requis.`; if(v.length>max) return `${label} ne peut pas depasser ${max} caracteres.`; return undefined;
};
export const finiteNonNegative = (value: number, label: string): string | undefined => Number.isFinite(value) && value >= 0 ? undefined : `${label} doit etre un nombre positif ou nul.`;
export const correlation = (value: string): string | undefined => required(value, 'Correlation ID', 128);
