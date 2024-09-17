import Select from "react-select";


const SearchSelect = ({ defaultValue = '', isDisabled = false, isLoading = false, isClearable = true, isSearchable = true, onChange, options, ...props }) => {

  const handleClear = (e) => {
    e.preventDefault()
    onChange('')
  }
  return (
    <div className="row g-3">
      <div className="col col-lg-6">
        <Select
          className="react-select text-dark"
          classNamePrefix="select"
          isDisabled={isDisabled}
          isLoading={isLoading}
          isClearable={isClearable}
          isSearchable={isSearchable}
          options={options}
          components={props?.components}
          onChange={onChange}
          value={props?.value}
          {...props}
        />
      </div>
    </div>
  );
}
export default SearchSelect
