import { useEffect, useState } from 'react';
import classNames from 'classnames';
import FieldErrors from './FieldErrors';
import FormField from './FormField';
import useFormInput from '@/hooks/useFormInput';
import { Validator } from '@/utilities/validators';

interface CheckboxProps extends React.HTMLProps<HTMLInputElement> {
  bottomSpacing?: boolean;
  error?: string;
  fieldName: string;
  label?: any;
  onValueChange?: (e) => void;
  shouldUseCheckedProp?: boolean;
  validator?: Validator;
}

const Checkbox = ({
  bottomSpacing,
  error,
  fieldName,
  label,
  onValueChange,
  required,
  shouldUseCheckedProp,
  validator,
  ...props
}: CheckboxProps) => {
  const [focused, setFocused] = useState(false);
  const [ariaProps, setAriaProps] = useState({});
  const [checked, setChecked] = useState(props.checked || false);

  const { errors, hasErrors, form, inputRef } = useFormInput({
    fieldName,
    error,
    required,
    validator,
  });

  const checkboxClasses = classNames('checkboxContainer', {
    'checkboxContainer_checked': shouldUseCheckedProp ? props.checked : checked,
    'checkboxContainer_focused': focused,
    'checkboxContainer_error': hasErrors,
  });

  useEffect(() => {
    setAriaProps({
      'aria-invalid': hasErrors,
      'aria-checked': shouldUseCheckedProp ? props.checked : checked,
      'aria-describedby': hasErrors ? `fieldError-${fieldName}` : undefined,
      'aria-required': !!required,
    });
  }, [checked, required, hasErrors]);

  const formState = form.getState;

  useEffect(() => {
    if (Object.keys(formState).length > 0) {
      setChecked(!!formState[fieldName]);
    }
  }, [formState[fieldName]]);

  const changeHandler = (e) => {
    let newChecked = e.target.checked;

    setChecked(newChecked);
    form.handleInputChange(e);
    return onValueChange?.(newChecked);
  };

  return (
    <FormField fieldName={fieldName} bottomSpacing={bottomSpacing} renderChildrenFirst withCheckbox className={props.className}>
      <div className="form-check">
        <input
          {...props}
          {...ariaProps}
          type="checkbox"
          onChange={changeHandler}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="form-check-input"
          checked={checked}
          name={fieldName}
          id={fieldName}
          ref={inputRef}
        />
        <label className="form-check-label" htmlFor={fieldName} key={`${fieldName}-label`}>
          {label}
        </label>
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

export default Checkbox;
