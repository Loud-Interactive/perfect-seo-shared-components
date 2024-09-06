interface FieldErrorsProps {
  errors: string[];
  id: string;
}

const FieldErrors = ({ errors, id }: FieldErrorsProps) => (
  <ul className="fieldErrors" id={id}>
    {errors.map(error => (
      <li key={error} className="fieldErrors-message">
        {error}
      </li>
    ))}
  </ul>
);

export default FieldErrors;