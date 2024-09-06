import { useEffect, useRef } from 'react';

interface FormErrorProps {
  children: React.ReactNode;
}

const FormError = ({ children }: FormErrorProps) => {
  const containerRef = useRef(null);

  useEffect(() => {
    containerRef.current.focus();
  }, []);

  return (
    <div
      className="formError"
      role="alert"
      tabIndex={0}
      ref={containerRef}
    >
      <div className="formError-icon">
        {/* add icon later  */}
      </div>
      <div className="formError-message">
        {children}
      </div>
    </div>
  );
};

export default FormError;
