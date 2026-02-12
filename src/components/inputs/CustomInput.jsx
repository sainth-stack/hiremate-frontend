import { TextField } from '@mui/material';
import './style.scss';

export default function CustomInput({
  label,
  type = 'text',
  placeholder,
  fullWidth = true,
  error,
  helperText,
  className = '',
  ...props
}) {
  return (
    <div className={`custom-input ${className}`.trim()}>
      <TextField
        label={label}
        type={type}
        placeholder={placeholder || label}
        fullWidth={fullWidth}
        variant="outlined"
        error={error}
        helperText={helperText}
        margin="none"
        InputLabelProps={{ shrink: true }}
        {...props}
      />
    </div>
  );
}
