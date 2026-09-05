import { useCallback } from 'react';

/**
 * Form validation result
 */
export interface ValidationResult {
  valid: boolean;
  error?: 'form_invalid';
}

/**
 * Form validation options
 */
export interface FormValidationOptions {
  creditCost: number;
  validateFormFields: () => { valid: boolean; error?: string };
}

/**
 * Unified form validation hook
 *
 * Provides unified validation logic before form submission.
 *
 * Advantages:
 * - Only handles frontend form integrity validation
 * - Not coupled with login, expiration, and in-site credits logic
 *
 * @example
 * ```tsx
 * const { validate } = useFormValidation();
 *
 * const onSubmit = async (formData) => {
 *   const validation = validate({
 *     creditCost: 10,
 *     validateFormFields: () => {
 *       if (!formData.prompt) {
 *         toast.error('Please enter a prompt');
 *         return { valid: false, error: 'form_invalid' };
 *       }
 *       return { valid: true };
 *     },
 *   });
 *
 *   if (!validation.valid) return;
 *
 *   // Execute submission logic
 * };
 * ```
 */
export function useFormValidation() {
  /**
   * Execute form validation
   *
   * @param options - Validation options
   * @returns Validation result
   */
  const validate = useCallback((options: FormValidationOptions): ValidationResult => {
    void options.creditCost;

    const formValidation = options.validateFormFields();
    if (!formValidation.valid) {
      return { valid: false, error: 'form_invalid' };
    }

    return { valid: true };
  }, []);

  return { validate };
}
