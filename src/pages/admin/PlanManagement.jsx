import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Button, IconButton, Chip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControlLabel, Checkbox, Paper, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import * as Yup from 'yup';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminPlansAPI, updateAdminPlanAPI, createAdminPlanAPI, deleteAdminPlanAPI } from '../../services/adminService';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SubscriptionsRoundedIcon from '@mui/icons-material/SubscriptionsRounded';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import PageContainer from '../../components/common/PageContainer';
import { toast } from 'react-hot-toast';
import { EmptyState, TableRowsSkeleton } from '../../components/admin';

// ─── Constants ────────────────────────────────────────────────────────────────

const PLANS_QUERY_KEY = ['admin', 'plans'];

const EMPTY_PLAN = {
  id: '', name: '', description: '', amount: 0,
  monthly_tokens: 25000, features: [], features_str: '', is_active: true, is_featured: false,
};

const validationSchema = Yup.object({
  name: Yup.string().required('Plan name is required').min(3, 'Min 3 characters'),
  description: Yup.string().required('Description is required'),
  amount: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  monthly_tokens: Yup.number().typeError('Must be a number').min(-1).required(),
});

const QUOTA_FIELDS = [
  { label: 'Monthly AI Tokens', name: 'monthly_tokens', helper: 'Use -1 for unlimited' },
];

const tableCellHeadSx = {
  fontWeight: 700, fontSize: 13, bgcolor: 'var(--grey-4)',
  borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)',
  letterSpacing: '0.02em', py: 1.5,
};

const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: 'var(--bg-paper)' } };

// ─── Plan Form Dialog ─────────────────────────────────────────────────────────
// Uses UNCONTROLLED inputs (inputRef + defaultValue) so keystrokes cause
// zero React re-renders. Only amount & is_active are controlled (for live preview).

const PlanFormDialog = ({ open, isNewPlan, initialValues, onClose }) => {
  const queryClient = useQueryClient();

  // Refs for uncontrolled text inputs
  const refs = {
    name: useRef(),
    description: useRef(),
    features_str: useRef(),
    monthly_tokens: useRef(),
  };

  // Only controlled state — for live INR preview and checkboxes
  const [amount, setAmount] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [errors, setErrors] = useState({});

  // Populate fields when dialog opens
  useEffect(() => {
    if (!open) return;
    const v = initialValues || EMPTY_PLAN;
    // Set controlled state
    setAmount(v.amount ?? 0);
    setIsActive(v.is_active ?? true);
    setIsFeatured(v.is_featured ?? false);
    setErrors({});
    // Set uncontrolled input values via ref
    Object.keys(refs).forEach((key) => {
      if (refs[key].current) {
        refs[key].current.value = v[key] ?? '';
      }
    });
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Read all values from refs + controlled state
  const collectValues = useCallback(() => ({
    id: initialValues?.id || refs.name.current?.value?.toLowerCase().replace(/\s+/g, '_') || '',
    name: refs.name.current?.value || '',
    description: refs.description.current?.value || '',
    features_str: refs.features_str.current?.value || '',
    amount: Number(amount),
    is_active: isActive,
    is_featured: isFeatured,
    monthly_tokens: Number(refs.monthly_tokens.current?.value ?? 0),
  }), [amount, isActive, isFeatured, initialValues]); // eslint-disable-line react-hooks/exhaustive-deps

  const createMutation = useMutation({
    mutationFn: (payload) => createAdminPlanAPI(payload),
    onSuccess: (_, payload) => {
      toast.success(`Plan "${payload.name}" created`);
      queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Failed to create plan'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateAdminPlanAPI(id, payload),
    onSuccess: (_, { payload }) => {
      toast.success(`"${payload.name}" updated`);
      queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Failed to update plan'),
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async () => {
    const values = collectValues();
    try {
      await validationSchema.validate(values, { abortEarly: false });
      setErrors({});
      const features = values.features_str.split('\n').map(f => f.trim()).filter(Boolean);
      const payload = { ...values, features };
      delete payload.features_str;
      if (isNewPlan) {
        createMutation.mutate(payload);
      } else {
        updateMutation.mutate({ id: initialValues.id, payload });
      }
    } catch (err) {
      const errs = {};
      err.inner?.forEach(e => { errs[e.path] = e.message; });
      setErrors(errs);
    }
  };

  const handleClose = () => { setErrors({}); onClose(); };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: '16px', boxShadow: '0 24px 48px rgba(0,0,0,0.15)' } }}
    >
      <DialogTitle sx={{ px: 4, py: 3, borderBottom: '1px solid var(--divider)', bgcolor: 'var(--bg-paper)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: 'var(--bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            <SubscriptionsRoundedIcon />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
              {isNewPlan ? 'Add New Plan' : 'Edit Plan Details'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block' }}>
              {isNewPlan ? 'Configure a new subscription tier.' : `Editing "${initialValues?.name}" plan.`}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small" sx={{ ml: 'auto', color: 'var(--text-muted)', '&:hover': { color: 'var(--error)' } }}>
            <CloseRoundedIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: 'var(--bg-paper)' }}>
        <Box sx={{ p: 4 }}>
          <Stack spacing={4}>

            {/* Basic Info */}
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'var(--text-label)', mb: 1 }}>Plan Name</Typography>
                  <TextField
                    fullWidth size="small"
                    inputRef={refs.name}
                    defaultValue={initialValues?.name || ''}
                    error={Boolean(errors.name)}
                    helperText={errors.name}
                    placeholder="e.g. Professional Plan"
                    sx={inputSx}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'var(--text-label)', mb: 1 }}>Pricing (paise)</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <TextField
                      type="number" size="small"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      error={Boolean(errors.amount)}
                      helperText={errors.amount}
                      sx={{ flex: 1, ...inputSx }}
                      InputProps={{ startAdornment: <Typography variant="caption" sx={{ color: 'var(--text-muted)', mr: 1, fontWeight: 600 }}>₹</Typography> }}
                    />
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', minWidth: 80, whiteSpace: 'nowrap' }}>
                      = ₹{(Number(amount) / 100).toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'var(--text-label)', mb: 1 }}>Visibility</Typography>
                  <Box sx={{ height: 40, display: 'flex', alignItems: 'center', px: 2, borderRadius: '8px', border: '1px solid var(--divider)', bgcolor: isActive ? 'var(--success-bg)' : 'var(--bg-paper)' }}>
                    <FormControlLabel
                      control={<Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} color="success" size="small" />}
                      label={<Typography sx={{ fontSize: 13, fontWeight: 600, color: isActive ? 'var(--success-dark)' : 'var(--text-secondary)' }}>{isActive ? 'Active & visible' : 'Hidden from users'}</Typography>}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'var(--text-label)', mb: 1 }}>Featured Plan</Typography>
                  <Box sx={{ height: 40, display: 'flex', alignItems: 'center', px: 2, borderRadius: '8px', border: '1px solid var(--divider)', bgcolor: isFeatured ? 'var(--light-blue-bg-08)' : 'var(--bg-paper)' }}>
                    <FormControlLabel
                      control={<Checkbox checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} color="primary" size="small" />}
                      label={<Typography sx={{ fontSize: 13, fontWeight: 600, color: isFeatured ? 'var(--primary)' : 'var(--text-secondary)' }}>{isFeatured ? 'Most Popular' : 'Standard Plan'}</Typography>}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Service Quotas */}
            <Box>
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#1e293b', mb: 0.5 }}>Service Quotas</Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2 }}>Define usage limits. Use -1 for unlimited tokens.</Typography>
              <Grid container spacing={2}>
                {QUOTA_FIELDS.map((field) => (
                  <Grid item key={field.name} xs={12} sm={4}>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#475569', mb: 1 }}>{field.label}</Typography>
                    <TextField
                      fullWidth type="number" size="small"
                      inputRef={refs[field.name]}
                      defaultValue={initialValues?.[field.name] ?? 25000}
                      error={Boolean(errors[field.name])}
                      helperText={errors[field.name] || field.helper}
                      sx={inputSx}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Marketing Details */}
            <Box>
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', mb: 0.5 }}>Marketing Details</Typography>
              <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block', mb: 2 }}>Describe the plan for your users.</Typography>
              <Stack spacing={3}>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'var(--text-label)', mb: 1 }}>Short Summary</Typography>
                  <TextField
                    fullWidth multiline rows={2}
                    inputRef={refs.description}
                    defaultValue={initialValues?.description || ''}
                    error={Boolean(errors.description)}
                    helperText={errors.description}
                    placeholder="Briefly describe what this plan offers..."
                    sx={inputSx}
                  />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'var(--text-label)', mb: 1 }}>Marketing Bullet Points</Typography>
                  <TextField
                    fullWidth multiline rows={5}
                    inputRef={refs.features_str}
                    defaultValue={initialValues?.features_str || ''}
                    placeholder={'Feature 1\nFeature 2\n...'}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: 'var(--bg-paper)', fontSize: 14 } }}
                  />
                </Box>
              </Stack>
            </Box>

          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 4, pt: 0, gap: 2, justifyContent: 'flex-end', bgcolor: 'var(--bg-paper)' }}>
        <Button onClick={handleClose} sx={{ textTransform: 'none', fontWeight: 600, color: 'var(--text-secondary)', '&:hover': { bgcolor: 'var(--bg-light)' } }}>
          Cancel
        </Button>
        <Button
          variant="contained" onClick={handleSubmit} disabled={isSaving}
          startIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : <SaveRoundedIcon />}
          sx={{ px: 4, py: 1.2, borderRadius: '10px', textTransform: 'none', fontWeight: 700, bgcolor: 'var(--primary)', fontSize: 14, boxShadow: '0 4px 12px rgba(var(--primary-rgb),0.15)', '&:hover': { bgcolor: 'var(--primary-dark)' } }}
        >
          {isSaving ? 'Saving...' : isNewPlan ? 'Create Plan' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const PlanManagement = () => {
  const queryClient = useQueryClient();
  const [modalState, setModalState] = useState({ open: false, isNew: false, values: null });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: PLANS_QUERY_KEY,
    queryFn: async () => {
      const res = await getAdminPlansAPI();
      return res.data.data || [];
    },
  });

  const handleEditClick = useCallback((plan) => {
    const features_str = Array.isArray(plan.features) ? plan.features.join('\n') : '';
    setModalState({ open: true, isNew: false, values: { ...plan, features_str } });
  }, []);

  const handleAddClick = useCallback(() => {
    setModalState({ open: true, isNew: true, values: EMPTY_PLAN });
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, open: false }));
  }, []);

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteAdminPlanAPI(id),
    onSuccess: () => {
      toast.success('Plan deleted successfully');
      queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
      setConfirmDelete(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || 'Failed to delete plan');
    },
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <PageContainer sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, py: 4, bgcolor: 'var(--bg-light)' }}>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 4, pb: 3, borderBottom: '1px solid var(--divider)' }}>
        <Box>
          <Typography component="h1" sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Subscription Plans
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mt: 0.5, fontSize: 14 }}>
            Configure pricing and quotas for all platform subscription tiers.
          </Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<AddRoundedIcon />} onClick={handleAddClick}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px', bgcolor: 'var(--primary)', px: 3, py: 1, boxShadow: '0 4px 12px rgba(var(--primary-rgb),0.2)', '&:hover': { bgcolor: 'var(--primary-dark)' } }}
        >
          Add New Plan
        </Button>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--dashboard-card-shadow)' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={tableCellHeadSx}>Plan Details</TableCell>
                <TableCell align="right" sx={tableCellHeadSx}>Price (INR)</TableCell>
                <TableCell align="center" sx={tableCellHeadSx}>Monthly Tokens</TableCell>
                <TableCell sx={tableCellHeadSx}>Status</TableCell>
                <TableCell width={72} sx={tableCellHeadSx} />
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRowsSkeleton rows={5} cols={5} />
              ) : plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ border: 'none' }}>
                    <EmptyState icon={InboxOutlinedIcon} title="No plans configured" description="Click 'Add New Plan' to create your first subscription tier." />
                  </TableCell>
                </TableRow>
              ) : (
                plans.map((plan) => (
                  <TableRow key={plan.id} hover sx={{ '&:hover': { bgcolor: 'var(--light-blue-bg-02)' }, transition: 'background 0.15s ease', '& td': { borderBottom: '1px solid var(--divider)' } }}>
                    <TableCell sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'var(--light-blue-bg-08)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <SubscriptionsRoundedIcon fontSize="small" />
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{plan.name}</Typography>
                          <Typography variant="caption" sx={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>ID: {plan.id}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', py: 1.5 }}>₹{plan.amount / 100}</TableCell>
                    <TableCell align="center" sx={{ py: 1.5 }}><Typography sx={{ fontSize: 13, fontWeight: 600 }}>{plan.monthly_tokens === -1 ? '∞' : (plan.monthly_tokens || 0).toLocaleString()}</Typography></TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip label={plan.is_active ? 'Active' : 'Inactive'} size="small"
                        sx={{ height: 22, fontWeight: 700, fontSize: 11, letterSpacing: '0.02em', border: 'none', borderRadius: '999px', bgcolor: plan.is_active ? 'var(--success-bg)' : 'var(--grey-4)', color: plan.is_active ? 'var(--success-dark)' : 'var(--text-secondary)' }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => handleEditClick(plan)} sx={{ color: 'var(--text-muted)', '&:hover': { color: 'var(--primary)', bgcolor: 'var(--light-blue-bg-08)' } }}>
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => setConfirmDelete(plan)} sx={{ color: 'var(--text-muted)', '&:hover': { color: 'var(--error)', bgcolor: 'var(--error-bg)' } }}>
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <PlanFormDialog
        open={modalState.open}
        isNewPlan={modalState.isNew}
        initialValues={modalState.values}
        onClose={handleCloseModal}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ px: 3, pt: 3, pb: 1 }}>
          <Typography sx={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>Delete Plan?</Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 2 }}>
          <Typography sx={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            You are about to permanently delete the <strong>{confirmDelete?.name}</strong> plan.
            This cannot be undone and may affect existing subscribers.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
          <Button
            onClick={() => setConfirmDelete(null)}
            sx={{ textTransform: 'none', fontWeight: 600, color: 'var(--text-secondary)', '&:hover': { bgcolor: 'var(--bg-light)' } }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => deleteMutation.mutate(confirmDelete?.id)}
            disabled={deleteMutation.isPending}
            startIcon={deleteMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <DeleteOutlineRoundedIcon />}
            sx={{ textTransform: 'none', fontWeight: 700, bgcolor: 'var(--error)', borderRadius: '10px', px: 3, boxShadow: 'none', '&:hover': { bgcolor: 'var(--error-dark)', boxShadow: 'none' } }}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Plan'}
          </Button>
        </DialogActions>
      </Dialog>

    </PageContainer>
  );
};

export default PlanManagement;
