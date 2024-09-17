import Select from "react-select";


const SearchSelect = ({ defaultValue = '', isDisabled = false, isLoading = false, isClearable = true, isSearchable = true, onChange, options, ...props }) => {

  return (
    <Select
      className="react-select"
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
  );
}
export default SearchSelect
