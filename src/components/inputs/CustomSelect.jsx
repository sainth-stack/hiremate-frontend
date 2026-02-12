import { FormControl, InputLabel, Select } from '@mui/material';
import './style.scss';

export default function CustomSelect({
  label,
  fullWidth = true,
  multiple = false,
  displayEmpty = false,
  value,
  onChange,
  renderValue,
  children,
  error,
  className = '',
  sx,
  ...props
}) {
  return (
    <FormControl
      className={`custom-select ${className}`.trim()}
      fullWidth={fullWidth}
      variant="outlined"
      error={error}
      margin="none"
      sx={sx}
    >
      <InputLabel shrink>{label}</InputLabel>
      <Select
        label={label}
        multiple={multiple}
        displayEmpty={displayEmpty}
        value={value}
        onChange={onChange}
        renderValue={renderValue}
        {...props}
      >
        {children}
      </Select>
    </FormControl>
  );
}
