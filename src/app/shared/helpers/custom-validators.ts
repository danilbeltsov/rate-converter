import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const positiveValueValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    return value > 0 ? null : { positive: false };
  };
};
