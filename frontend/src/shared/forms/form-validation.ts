export type FormFieldErrors<TForm extends object> = Partial<Record<keyof TForm, string>>;

export type FormFieldValidator<TForm extends object> = (
  value: unknown,
  form: Readonly<TForm>,
) => string | null;

export type FormValidationSchema<TForm extends object> = Partial<{
  [TField in keyof TForm]: readonly FormFieldValidator<TForm>[];
}>;

export interface FormValidationResult<TForm extends object> {
  readonly valid: boolean;
  readonly errors: FormFieldErrors<TForm>;
  readonly firstError: string | null;
}

export function validateForm<TForm extends object>(
  form: Readonly<TForm>,
  schema: FormValidationSchema<TForm>,
): FormValidationResult<TForm> {
  const errors: FormFieldErrors<TForm> = {};

  for (const field of Object.keys(schema) as Array<keyof TForm>) {
    const validators = schema[field] ?? [];
    for (const validate of validators) {
      const error = validate(form[field], form);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  }

  const firstError = Object.values(errors).find(
    (error): error is string => typeof error === 'string' && error.length > 0,
  ) ?? null;

  return {
    valid: firstError === null,
    errors,
    firstError,
  };
}

export function requiredText(message: string): FormFieldValidator<object> {
  return (value) => typeof value === 'string' && value.trim().length > 0 ? null : message;
}

export function validEmail(message: string, optional = false): FormFieldValidator<object> {
  return (value) => {
    const email = typeof value === 'string' ? value.trim() : '';
    if (optional && email.length === 0) return null;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? null : message;
  };
}

export function minimumLength(length: number, message: string): FormFieldValidator<object> {
  return (value) => typeof value === 'string' && value.length >= length ? null : message;
}

export function matchesPattern(pattern: RegExp, message: string): FormFieldValidator<object> {
  return (value) => typeof value === 'string' && pattern.test(value) ? null : message;
}

export function matchesField<TForm extends object>(
  otherField: keyof TForm,
  message: string,
): FormFieldValidator<TForm> {
  return (value, form) => value === form[otherField] ? null : message;
}
