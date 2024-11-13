import type * as PropTypes from "prop-types";
import { Validator } from '@/perfect-seo-shared-components/utils/validators';
import classNames from 'classnames';
import FormField from './FormField';
import useFormInput from '@/perfect-seo-shared-components/hooks/useFormInput';
import FieldErrors from './FieldErrors';

interface ColorInputProps extends React.HTMLProps<HTMLInputElement> {
  fieldName: string;
  borderless?: boolean;
  error?: string;
  icon?: React.ReactNode;
  label?: string | any;
  validator?: PropTypes.Validator;
  className?: string;
  hideErrorMessage?: boolean;
  autoComplete?: string
  bottomSpacing?: boolean
  button?: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ColorInput = ({
  borderless,
  bottomSpacing = true,
  error,
  icon,
  label,
  fieldName,
  required,
  validator,
  className,
  hideErrorMessage,
  autoComplete,
  autoFocus,
  onPaste,
  ...props
}: ColorInputProps) => {
  const { errors, hasErrors, form, inputRef } = useFormInput({
    fieldName,
    error,
    required,
    validator,
  });

  const inputClass = 'colorInput-input';

  const inputClassNames = classNames(`${inputClass} form-control form-control-color`, {
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
    form.handleInputChange(e);
    if (props?.onChange) {
      props.onChange?.(e)
    }
  }

  return (
    <FormField fieldName={fieldName} label={label} bottomSpacing={bottomSpacing}>
      <div className="colorInput-container">
        <input
          type='color'
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
        <div className='text-white ms-3'>{form?.getState[fieldName] ? form?.getState[fieldName] : 'None'}</div>
        {props.button && <div className='input-button' id="input-buttons">{props.button}</div>}
        {icon && (
          <div className="colorInput-icon" id={`ColorInputIcon-${fieldName}`}>
            {icon}
          </div>
        )}
      </div>
      {hasErrors && !hideErrorMessage ? (
        <FieldErrors
          id={`fieldError-${fieldName}`}
          errors={errors}
        />
      ) : null}
    </FormField>
  );
};



export default ColorInput;
