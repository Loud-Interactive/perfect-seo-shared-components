import type * as PropTypes from "prop-types";
import { MutableRefObject, useContext, useEffect, useRef } from 'react';
import { FormContext } from '@/perfect-seo-shared-components/components/Form/Form';
import type { FormController } from './useForm';
import type { Validator } from '@/perfect-seo-shared-components/utils/validators';

interface FormInputConfig {
  fieldName: string;
  error?: string;
  required?: boolean;
  validator?: PropTypes.Validator;
}

interface FormInputData {
  form: FormController;
  errors: string[];
  hasErrors: boolean;
  inputRef: MutableRefObject<any>;
}

/**
 * TODO: @description
 */
export default function useFormInput({ fieldName, error, required = false, validator }: FormInputConfig): FormInputData {
  const form = useContext(FormContext);
  const fieldErrors = form.getFieldErrors(fieldName);
  const inputRef = useRef<HTMLElement>(null!);

  const errors = error
    ? [error, ...fieldErrors]
    : fieldErrors;

  const hasErrors = errors?.length > 0;

  useEffect(() => {
    form.register(fieldName, {
      ref: inputRef?.current,
      required: required || false,
      validator,
    });

    return () => form.unregister(fieldName);
  }, [fieldName, required, validator]);

  return {
    form,
    errors,
    hasErrors,
    inputRef,
  };
}