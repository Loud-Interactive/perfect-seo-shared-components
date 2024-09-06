import { useEffect, useRef } from 'react';

interface FormSuccessProps {
  children: React.ReactNode;
}

const FormSuccess = ({ children }: FormSuccessProps) => {
  const containerRef = useRef(null);

  useEffect(() => {
    containerRef.current.focus();
  }, []);

  return (
    <div
      className="formSuccess"
      role="alert"
      tabIndex={0}
      ref={containerRef}
    >
      <div className="formSuccess-icon">
        {/* Add success icon later  */}
      </div>
      {children}
    </div>
  );
};

export default FormSuccess;
