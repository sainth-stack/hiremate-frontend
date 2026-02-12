import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
} from '@mui/material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

export default function SignOutConfirmDialog({ open, onClose, onConfirm }) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(4px)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
          },
        },
      }}
      PaperProps={{
        sx: {
          fontFamily: 'var(--font-family)',
          borderRadius: 2,
          boxShadow: 'var(--navbar-shadow)',
          minWidth: 500,
          maxWidth: 600,
          minHeight: 320,
          maxHeight: 450,
          overflow: 'auto',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          fontWeight: 600,
          pt: 2.5,
          px: 3,
          pb: 1,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            bgcolor: 'error.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LogoutRoundedIcon fontSize="small" />
        </Box>
        Sign Out
      </DialogTitle>
      <DialogContent sx={{ px: 4, pt: 2, pb: 3 }}>
        <DialogContentText sx={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Are you sure you want to sign out? Your progress will be saved, but you'll need to sign
          in again to continue.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2.5, pt: 2, gap: 1.5 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
            textTransform: 'none',
            fontWeight: 600,
            minHeight: 42,
            py: 1.25,
            px: 2.5,
            fontSize: '0.9375rem',
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          startIcon={<LogoutRoundedIcon fontSize="small" />}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            minHeight: 42,
            py: 1.25,
            px: 2.5,
            fontSize: '0.9375rem',
          }}
        >
          Sign Out
        </Button>
      </DialogActions>
    </Dialog>
  );
}
