import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Calendar, Mail, AlertCircle, Zap } from 'lucide-react';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const QUICK_PRESETS = [
  { label: 'Last 7 Days', value: 7, getDates: () => [format(subDays(new Date(), 7), 'yyyy-MM-dd'), format(new Date(), 'yyyy-MM-dd')] },
  { label: 'Last 30 Days', value: 30, getDates: () => [format(subDays(new Date(), 30), 'yyyy-MM-dd'), format(new Date(), 'yyyy-MM-dd')] },
  { label: 'Last 3 Months', value: 90, getDates: () => [format(subMonths(new Date(), 3), 'yyyy-MM-dd'), format(new Date(), 'yyyy-MM-dd')] },
  { label: 'This Month', value: 'month', getDates: () => [format(startOfMonth(new Date()), 'yyyy-MM-dd'), format(endOfMonth(new Date()), 'yyyy-MM-dd')] },
  { label: 'All Time', value: 'all', getDates: () => [null, null] },
];

export default function SyncModal({ open, onClose, onSync, isLoading }) {
  const [preset, setPreset] = useState(7);
  const [fromDate, setFromDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [customMode, setCustomMode] = useState(false);

  const handlePresetClick = (presetValue) => {
    const presetObj = QUICK_PRESETS.find(p => p.value === presetValue);
    if (presetObj) {
      const [from, to] = presetObj.getDates();
      setFromDate(from || '');
      setToDate(to || '');
      setPreset(presetValue);
      setCustomMode(false);
    }
  };

  const handleCustomToggle = () => {
    setCustomMode(!customMode);
    setPreset(null);
  };

  const handleSync = () => {
    onSync({
      from_date: fromDate || null,
      to_date: toDate || null,
    });
  };

  const estimateEmails = () => {
    if (!fromDate || !toDate) return 'Unknown';
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24));
    
    if (days <= 7) return '~50-200 emails';
    if (days <= 30) return '~200-500 emails';
    if (days <= 90) return '~500-1500 emails';
    return '~1500+ emails';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: 'rgba(37,99,235,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Mail size={20} color="#2563EB" />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
              Gmail Sync
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Select date range to scan for job applications
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Quick Presets */}
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, mb: 1.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Quick Select
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {QUICK_PRESETS.map((p) => (
                <Chip
                  key={p.value}
                  label={p.label}
                  onClick={() => handlePresetClick(p.value)}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    bgcolor: preset === p.value ? 'rgba(37,99,235,0.1)' : 'rgba(0,0,0,0.04)',
                    color: preset === p.value ? '#2563EB' : 'var(--text-secondary)',
                    border: preset === p.value ? '2px solid #2563EB' : 'none',
                    '&:hover': {
                      bgcolor: preset === p.value ? 'rgba(37,99,235,0.15)' : 'rgba(0,0,0,0.08)',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Custom Date Range */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Custom Range
              </Typography>
              <Button
                size="small"
                onClick={handleCustomToggle}
                sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}
              >
                {customMode ? 'Hide' : 'Show'}
              </Button>
            </Box>

            <AnimatePresence>
              {customMode && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <Stack spacing={2}>
                    <TextField
                      label="From Date"
                      type="date"
                      value={fromDate}
                      onChange={(e) => {
                        setFromDate(e.target.value);
                        setPreset(null);
                      }}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      size="small"
                    />
                    <TextField
                      label="To Date"
                      type="date"
                      value={toDate}
                      onChange={(e) => {
                        setToDate(e.target.value);
                        setPreset(null);
                      }}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      size="small"
                    />
                  </Stack>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>

          {/* Info Alert */}
          <Alert
            severity="info"
            icon={<AlertCircle size={16} />}
            sx={{
              fontSize: '0.8rem',
              bgcolor: 'rgba(37,99,235,0.05)',
              border: '1px solid rgba(37,99,235,0.2)',
              '& .MuiAlert-icon': { alignItems: 'center' },
            }}
          >
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5 }}>
              Estimated: {estimateEmails()}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              AI will analyze emails for job applications, recruiters, and interview schedules.
            </Typography>
          </Alert>

          {/* Current Selection Display */}
          {fromDate && toDate && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(16,185,129,0.05)',
                border: '1px solid rgba(16,185,129,0.2)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Calendar size={14} color="#10B981" />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#10B981' }}>
                  SELECTED RANGE
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {format(new Date(fromDate), 'MMM dd, yyyy')} → {format(new Date(toDate), 'MMM dd, yyyy')}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: 'var(--text-muted)', mt: 0.5 }}>
                {Math.ceil((new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24))} days
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          disabled={isLoading}
          sx={{ textTransform: 'none', fontWeight: 700 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSync}
          disabled={isLoading || (!fromDate && !toDate)}
          startIcon={isLoading ? <CircularProgress size={16} /> : <Zap size={16} />}
          sx={{
            textTransform: 'none',
            fontWeight: 800,
            px: 3,
            borderRadius: 2,
            bgcolor: '#2563EB',
            '&:hover': { bgcolor: '#1E40AF' },
          }}
        >
          {isLoading ? 'Starting Sync...' : 'Start Sync'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
