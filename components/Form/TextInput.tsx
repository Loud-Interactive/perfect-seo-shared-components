import { Validator } from '@/perfect-seo-shared-components/utils/validators';
import classNames from 'classnames';
import FormField from './FormField';
import useFormInput from '@/perfect-seo-shared-components/hooks/useFormInput';
import FieldErrors from './FieldErrors';

interface TextInputProps extends React.HTMLProps<HTMLInputElement> {
  fieldName: string;
  borderless?: boolean;
  error?: string;
  icon?: React.ReactNode;
  label?: string | any;
  validator?: Validator;
  className?: string;
  hideErrorMessage?: boolean;
  autoComplete?: string
  bottomSpacing?: boolean
  button?: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TextInput = ({
  borderless,
  bottomSpacing = true,
  error,
  icon,
  label,
  fieldName,
  required,
  type = 'text',
  validator,
  className,
  hideErrorMessage,
  autoComplete,
  autoFocus,
  onPaste,
  ...props
}: TextInputProps) => {
  const { errors, hasErrors, form, inputRef } = useFormInput({
    fieldName,
    error,
    required,
    validator,
  });

  const inputClass = 'textInput-input';

  const inputClassNames = classNames(`${inputClass} form-control`, {
    [`${inputClass}_withIcon`]: !!icon,
    [`${inputClass}_withError`]: hasErrors,
    [`${inputClass}_borderless`]: !!borderless,
    [`${inputClass}_readOnly`]: props.readOnly || props.disabled,
    [`${inputClass}_bottomSpacing`]: bottomSpacing,
    [`${inputClass}_button`]: props.button,
    [`${className}`]: className,
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
      <div className="textInput-container">
        <input
          type={type}
          {...props}
          {...ariaProps}
          autoFocus={autoFocus}
          value={props.value || form.getState[fieldName] || ''}
          onChange={onChange}
          onPaste={onPaste}
          onKeyDown={props.onKeyDown}
          className={inputClassNames}
          name={fieldName}
          id={fieldName}
          ref={inputRef}
          autoComplete={autoComplete}
        />
        {props.button && <div className='input-button'>{props.button}</div>}
        {icon && (
          <div className="textInput-icon" id={`textInputIcon-${fieldName}`}>
            {icon}
          </div>
        )}
      </div>
      {(type === 'url' && (props.value || form.getState[fieldName])) &&
        <a className='pt-5 text-primary' href={props.value || form.getState[fieldName]} target="_blank"><small>{props.value || form.getState[fieldName]}</small></a>
      }
      {hasErrors && !hideErrorMessage ? (
        <FieldErrors
          id={`fieldError-${fieldName}`}
          errors={errors}
        />
      ) : null}
    </FormField>
  );
};



export default TextInput;
