import { Validator } from '@/perfect-seo-shared-components/utils/validators';
import classNames from 'classnames';
import FormField from './FormField';
import useFormInput from '@/perfect-seo-shared-components/hooks/useFormInput';
import FieldErrors from './FieldErrors';
import { useEffect, useState } from 'react';

interface ListInputProps extends React.HTMLProps<HTMLInputElement> {
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
  long?: boolean
}

const ListInput = ({
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
  long,
  onPaste,
  ...props
}: ListInputProps) => {
  const { errors, hasErrors, form, inputRef } = useFormInput({
    fieldName,
    error,
    required,
    validator,
  });

  const inputClass = '-input';

  const [values, setValues] = useState<string[]>([])
  const [addOn, setAddOn] = useState("")


  const ariaProps = {
    'aria-invalid': hasErrors,
    'aria-describedby': hasErrors ? `fieldError-${fieldName}` : undefined,
    'aria-required': !!required,
  };


  function onChange(e) {
    form.handleInputChange(e);
    props.onChange?.(e);
    let value = e.target.value
    if (value.includes("|")) {
      setValues(value?.split("|"))
    }
    else if (value.includes(", ")) {
      setValues(value?.split(", "))
    }
  }

  useEffect(() => {
    let value = props.value ?? form.getState[fieldName] ?? ''
    if (value.includes("|")) {
      setValues(value?.split("|"))
    }
    else if (value.includes(", ")) {
      setValues(value?.split(", "))
    }
    else if (value.includes(",")) {
      setValues(value?.split(","))
    }
    else if (value) {
      setValues([value])
    }
  }, [props.value])

  const handleAdd = (e) => {
    e.preventDefault()
    let newFormState = { ...form.getState };
    let newValues = [...values, addOn]
    setValues(newValues)
    newFormState[fieldName] = newValues.join(" | ")
    form.setState(newFormState)
    setAddOn('')
  }

  const changeAddOnHandler = (e) => {
    e.preventDefault();
    setAddOn(e.target.value)
  }

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd(e)
    }
  }

  const itemClasses = classNames("d-flex align-items-start col-12",
    { 'col-lg-6': !long }
  )


  return (

    <FormField fieldName={fieldName} label={label} bottomSpacing={bottomSpacing}>
      <div className="listInput-container card p-3">
        {values?.length > 0 && <ul className='clear-list-properties mb-2 d-flex row g-0'>
          {values.map((val, idx) => {
            const deleteItemHandler = (e) => {
              e.preventDefault();
              let newFormState = { ...form.getState };
              let newValues = values.filter((val, i) => i !== idx)
              setValues(newValues)
              newFormState[fieldName] = newValues.join(",")
              form.setState(newFormState)

            }
            return (
              <li key={idx} className={itemClasses}>
                {props?.disabled ? <i className="bi bi-dash" /> : <button onClick={deleteItemHandler} className='btn btn-transparent p-0'><i className="bi bi-x text-primary" /></button>}
                <p className='pb-1 text-wrap w-100'>{val}
                </p>
              </li>
            )
          })}
        </ul>}
        {!props.disabled && <div className='input-group'>
          <input
            className="form-control"
            type="text"
            autoFocus={autoFocus}
            autoComplete="off"
            name={`additional-${fieldName}`}
            placeholder={props.placeholder || `Add ${label}`}
            value={addOn}
            onKeyDown={handleInputKeyDown}
            onChange={changeAddOnHandler}
          />
          <button className="btn btn-primary input-group-append" type="button" disabled={!addOn} onClick={handleAdd}><i className="bi bi-plus" /></button>
        </div>}
        <input
          type={type}
          {...props}
          {...ariaProps}
          autoComplete='off'
          autoFocus={autoFocus}
          value={props.value ?? form.getState[fieldName] ?? ''}
          onChange={onChange}
          className="d-none"
          onPaste={onPaste}
          name={fieldName}
          id={fieldName}
          ref={inputRef}
        />
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


export default ListInput;
