import classNames from 'classnames';
import FieldErrors from './FieldErrors';
import FormField from './FormField';
import useFormInput from '@/perfect-seo-shared-components/hooks/useFormInput';
import { Validator } from '@/perfect-seo-shared-components/utils/validators';

interface TextAreaInputProps extends React.HTMLProps<HTMLTextAreaElement> {
  fieldName: string;
  borderless?: boolean;
  error?: string;
  icon?: React.ReactNode;
  label?: string;
  validator?: Validator;
  className?: string;
  hideErrorMessage?: boolean;
  bottomSpacing?: boolean;
}

const TextArea = ({
  error,
  label,
  fieldName,
  required = false,
  validator,
  bottomSpacing,
  type = "text",
  className,
  ...props
}: TextAreaInputProps) => {
  const { errors, hasErrors, form, inputRef } = useFormInput({
    fieldName,
    error,
    required,
    validator,
  });

  const inputClass = 'textArea-input';

  const inputClassNames = classNames(`${inputClass} form-control`, {
    [`${inputClass}_withError`]: hasErrors,
    [`${className}`]: className,
    [`${inputClass}_disabled`]: props.disabled,
  });

  const ariaProps = {
    'aria-invalid': hasErrors,
    'aria-describedby': hasErrors ? `fieldError-${fieldName}` : undefined,
    'aria-required': !!required,
  };

  function onChange(e) {
    e.preventDefault()
    form.handleInputChange(e);
    props.onChange?.(e);
  }

  return (
    <FormField fieldName={fieldName} label={label} bottomSpacing={bottomSpacing}>
      <div className="textArea-container">
        <textarea
          {...props}
          {...ariaProps}
          value={props.value ?? form.getState[fieldName] ?? ''}
          onChange={onChange}
          className={inputClassNames}
          name={fieldName}
          id={fieldName}
          ref={inputRef}
        />
      </div>
      {hasErrors && (
        <FieldErrors
          id={`fieldError-${fieldName}`}
          errors={errors}
        />
      )}
    </FormField>
  );
};



export default TextArea;