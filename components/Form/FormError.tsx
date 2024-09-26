import { useEffect, useRef, ReactNode } from 'react';

interface FormErrorProps {
  children: ReactNode;
}

const FormError = ({ children }: FormErrorProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    containerRef?.current?.focus();
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
