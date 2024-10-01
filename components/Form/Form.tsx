import { createContext } from 'react';
import { FormController } from '@/perfect-seo-shared-components/hooks/useForm';
import FormError from './FormError';
import FormSuccess from './FormSuccess';

interface FormProps {
  children: React.ReactNode;
  controller: FormController;
  validation?: boolean;
  onSave?: () => boolean;
  className?: string;
  id?: string;
  onSubmit?: (any) => void
}

export const FormContext = createContext<FormController>({
  getFieldErrors: () => [],
  getFormError: '',
  getFormSuccess: '',
  getState: () => ({}),
  setState: () => { },
  handleInputChange: () => { },
  setInitialState: () => { },
  register: () => { },
  setFormError: () => { },
  setFormSuccess: () => { },
  unregister: () => { },
  validate: () => true,
  resetFieldErrors: () => { },

});

const Form = ({ children, controller, validation = false, onSave, className, id, onSubmit }: FormProps) => {
  const formError = controller.getFormError;
  const formSuccess = controller.getFormSuccess;




  const onSubmitHandler = (e) => {
    e.preventDefault()
    // if (onSubmit) {
    //   onSubmit(e)
    // }
  }

  return (
    <form className={className} id={id} onSubmit={onSubmitHandler}>
      <FormContext.Provider value={controller}>
        {formError && (
          <FormError>
            {formError}
          </FormError>
        )}
        {formSuccess && (
          <FormSuccess>
            {formSuccess}
          </FormSuccess>
        )}
        {children}
      </FormContext.Provider>
    </form>
  );
};



export default Form;
