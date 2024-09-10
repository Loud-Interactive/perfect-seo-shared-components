import { createContext, useEffect, useState } from 'react';
import { FormController } from '@/perfect-seo-shared-components/hooks/useForm';
import FormError from './FormError';
import Router, { useRouter } from 'next/router';
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
  getChangeStatus: () => false,
  register: () => { },
  setFormError: () => { },
  setFormSuccess: () => { },
  unregister: () => { },
  validate: () => true,
  resetFieldErrors: () => { },

});

const Form = ({ children, controller, validation, onSave, className, id, onSubmit }: FormProps) => {
  const formError = controller.getFormError;
  const formSuccess = controller.getFormSuccess;
  const router = useRouter();
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState(undefined);
  const [approved, setApproved] = useState(false);

  useEffect(() => {

    const routeChangeStart = (url) => {
      let dirty = controller.getChangeStatus();

      if (dirty && approved === false) {
        setUnsavedChanges(true);
        setRedirectUrl(url);
        Router.events.emit('routeChangeError');
        /* eslint-disable */
        throw 'Abort route change due to unsaved pieces.';
        /* eslint-disable */
      }

    };

    if (validation) {
      Router.events.on('routeChangeStart', routeChangeStart);
    }

    return () => {
      Router.events.off('routeChangeStart', routeChangeStart);
    };
  }, [validation, controller, approved]);

  const onLeave = () => {

    setApproved(true)

    const url = redirectUrl;
    router.push(url);

  };

  const onSaveHandler = async () => {
    let result = await onSave();

    if (result) {
      setRedirectUrl(router.route);
      setApproved(true)
      return onLeave();
    } else {
      setUnsavedChanges(false);
    }

  };

  const onSubmitHandler = (e) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit(e)
    }
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

Form.defaultProps = {
  validation: false,
};

export default Form;
