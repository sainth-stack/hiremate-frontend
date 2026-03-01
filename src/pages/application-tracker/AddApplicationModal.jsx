import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { STATUSES, PRIORITIES } from './constants';
import { createJobAPI } from '../../services';

const initialForm = {
  company: '',
  position_title: '',
  location: '',
  job_posting_url: '',
  notes: '',
  application_status: 'saved',
  priority: 'medium',
};

export default function AddApplicationModal({ open, onClose, onSuccess, editJob }) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEdit = Boolean(editJob);

  useEffect(() => {
    if (open) {
      setError('');
      if (editJob) {
        setForm({
          company: editJob.company || '',
          position_title: editJob.position_title || '',
          location: editJob.location || '',
          job_posting_url: editJob.job_posting_url || '',
          notes: editJob.notes || '',
          application_status: editJob.application_status || 'saved',
          priority: editJob.priority || 'medium',
        });
      } else {
        setForm(initialForm);
      }
    }
  }, [open, editJob]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.position_title?.trim()) {
      setError('Job title is required');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        company: form.company?.trim() || '',
        position_title: form.position_title?.trim(),
        location: form.location?.trim() || '',
        job_posting_url: form.job_posting_url?.trim() || null,
        notes: form.notes?.trim() || null,
        application_status: form.application_status,
      };
      if (isEdit) {
        // TODO: Add updateJobAPI when backend supports full update
        return;
      }
      await createJobAPI(payload);
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
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
          boxShadow: '0 24px 48px rgba(0,0,0,0.12)',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle sx={{ p: 3, pb: 2 }}>
        <Typography variant="h6" fontWeight={600} color="var(--text-primary)">
          {isEdit ? 'Edit Application' : 'Add Application'}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pt: 0 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Company"
            value={form.company}
            onChange={handleChange('company')}
            placeholder="e.g. Acme Inc"
            fullWidth
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField
            label="Job Title"
            value={form.position_title}
            onChange={handleChange('position_title')}
            placeholder="e.g. Senior Software Engineer"
            fullWidth
            required
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField
            label="Location"
            value={form.location}
            onChange={handleChange('location')}
            placeholder="e.g. Remote, San Francisco"
            fullWidth
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField
            label="Job Link"
            value={form.job_posting_url}
            onChange={handleChange('job_posting_url')}
            placeholder="https://..."
            fullWidth
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField
            label="Notes"
            value={form.notes}
            onChange={handleChange('notes')}
            placeholder="Optional notes..."
            fullWidth
            multiline
            rows={2}
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <FormControl size="small" sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={form.application_status}
              label="Status"
              onChange={handleChange('application_status')}
            >
              {STATUSES.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
            <InputLabel>Priority</InputLabel>
            <Select value={form.priority} label="Priority" onChange={handleChange('priority')}>
              {PRIORITIES.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        {error && (
          <Typography variant="caption" color="error" sx={{ mt: 2, display: 'block' }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
        <Button onClick={onClose} sx={{ color: 'var(--text-secondary)' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          sx={{
            bgcolor: 'var(--primary)',
            '&:hover': { bgcolor: 'var(--primary-light)' },
            borderRadius: 2,
          }}
        >
          {submitting ? 'Saving...' : isEdit ? 'Save' : 'Add Application'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
