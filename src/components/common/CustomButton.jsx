import { Button } from '@mui/material';

export default function CustomButton({
  children,
  variant = 'contained',
  fullWidth = false,
  type = 'button',
  ...props
}) {
  return (
    <Button
      variant={variant}
      fullWidth={fullWidth}
      type={type}
      disableElevation
      {...props}
    >
      {children}
    </Button>
  );
}
