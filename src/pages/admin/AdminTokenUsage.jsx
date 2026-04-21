import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Grid,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Select,
  MenuItem,
  Button,
  LinearProgress,
  Avatar,
  TextField,
  Skeleton,
} from '@mui/material';
import { format, parseISO, isValid } from 'date-fns';

// Icons
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SensorsIcon from '@mui/icons-material/Sensors';
import SecurityIcon from '@mui/icons-material/Security';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';

import PageContainer from '../../components/common/PageContainer';
import DateFilter from '../../components/dashboard/DateFilter';
import { getAdminTokenUsageAPI } from '../../services';

// --- STYLING CONSTANTS ---
const DESIGN_TOKENS = {
  card_bg: 'var(--bg-paper)',
  header_bg: 'var(--grey-4)',
  border: 'var(--divider)',
  text_primary: 'var(--text-primary)',
  text_secondary: 'var(--text-secondary)',
  success: 'var(--success)',
  error: 'var(--error)',
  warning: 'var(--warning)',
  blue: 'var(--primary)',
  purple: '#7c3aed',
  orange: '#ea580c',
};

const FEATURE_COLORS = {
  SEMANTIC_SEARCH: { bg: '#E0E7FF', text: '#3730A3' },
  SEARCH: { bg: '#E0E7FF', text: '#3730A3' },
  CODE_ASSIST: { bg: '#F3E8FF', text: '#6B21A8' },
  BULK_EMBEDDINGS: { bg: '#FFedd5', text: '#9A3412' },
  SUMMARIZATION: { bg: '#f0f9ff', text: '#075985' },
  TRANSLATION: { bg: '#E0F2FE', text: '#075985' },
  NUDGE_ENGINE: { bg: '#FDF2F2', text: '#9B1C1C' },
  RESUME_ANALYSIS: { bg: '#EBF5FF', text: '#1E429F' },
};

// --- SUB-COMPONENTS ---

/**
 * KPI Metric Card with Trend/Info Support
 */
const MetricCard = ({ label, value, sublabel, trend, trendValue, icon: Icon, loading, warning }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: '12px',
      border: `1px solid ${DESIGN_TOKENS.border}`,
      boxShadow: 'var(--dashboard-card-shadow)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      bgcolor: DESIGN_TOKENS.card_bg,
    }}
  >
    <Box>
      <Typography variant="overline" sx={{ color: DESIGN_TOKENS.text_secondary, fontWeight: 700, fontSize: 11, letterSpacing: '0.05em' }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 0.5, gap: 1 }}>
        <Typography sx={{ fontSize: 28, fontWeight: 700, color: DESIGN_TOKENS.text_primary }}>
          {loading ? '—' : value}
        </Typography>
      </Box>
    </Box>
    
    <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {trend && (
        <Box sx={{ display: 'flex', alignItems: 'center', color: trend === 'up' ? DESIGN_TOKENS.success : DESIGN_TOKENS.error }}>
          {trend === 'up' ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
          <Typography sx={{ fontSize: 12, fontWeight: 700, ml: 0.25 }}>{trendValue}</Typography>
        </Box>
      )}
      {warning ? (
         <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.25, borderRadius: '4px', bgcolor: 'var(--error-bg)' }}>
            <ErrorOutlineIcon sx={{ fontSize: 14, color: DESIGN_TOKENS.error }} />
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: DESIGN_TOKENS.error }}>{sublabel}</Typography>
         </Box>
      ) : (
        <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 500 }}>
          {sublabel}
        </Typography>
      )}
    </Box>
  </Paper>
);

/**
 * Filter Bar Section
 */
const FilterBar = ({ 
  dateRange, 
  onDateRangeChange, 
  selectedModel, 
  onModelChange, 
  searchEmail, 
  onSearchEmailChange, 
  onClearFilters,
  availableModels = [],
  isFiltered
}) => (
  <Box sx={{ mb: 3, display: 'flex', alignItems: 'end', gap: 2, flexWrap: 'wrap' }}>
    <Box>
      <Typography variant="overline" sx={{ fontWeight: 700, fontSize: 10, color: DESIGN_TOKENS.text_secondary, mb: 0.5, display: 'block' }}>
        MODEL
      </Typography>
      <Select 
        size="small" 
        value={selectedModel} 
        onChange={(e) => onModelChange(e.target.value)}
        sx={{ height: 38, minWidth: 160, bgcolor: 'var(--bg-paper)', borderRadius: '8px', fontSize: 13, fontWeight: 500, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border-color)' } }}
      >
        <MenuItem value="All Models">All Models</MenuItem>
        {availableModels.map(m => (
          <MenuItem key={m.model} value={m.model}>{m.model}</MenuItem>
        ))}
      </Select>
    </Box>
    <Box>
      <Typography variant="overline" sx={{ fontWeight: 700, fontSize: 10, color: DESIGN_TOKENS.text_secondary, mb: 0.5, display: 'block' }}>
        DATE RANGE
      </Typography>
      <DateFilter value={dateRange} onChange={onDateRangeChange} />
    </Box>
    <Box>
      <Typography variant="overline" sx={{ fontWeight: 700, fontSize: 10, color: DESIGN_TOKENS.text_secondary, mb: 0.5, display: 'block' }}>
        EMAIL SEARCH
      </Typography>
      <Box sx={{ position: 'relative' }}>
        <TextField
          size="small"
          placeholder="Filter by email..."
          value={searchEmail}
          onChange={(e) => onSearchEmailChange(e.target.value)}
          sx={{ 
            height: 38, 
            width: 220, 
            '& .MuiOutlinedInput-root': { height: 38, borderRadius: '8px', bgcolor: 'var(--bg-paper)', fontSize: 13 } 
          }}
        />
      </Box>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'flex-end', height: 58 }}>
      {isFiltered && (
        <Button 
          variant="outlined" 
          size="small" 
          startIcon={<FilterListOffIcon sx={{ fontSize: 16 }} />}
          onClick={onClearFilters}
          sx={{ 
            height: 38,
            borderRadius: '8px',
            color: DESIGN_TOKENS.error, 
            borderColor: 'rgba(220, 38, 38, 0.2)',
            bgcolor: 'rgba(220, 38, 38, 0.02)',
            fontWeight: 700, 
            fontSize: 12, 
            px: 2,
            textTransform: 'none',
            '&:hover': { 
              bgcolor: 'rgba(220, 38, 38, 0.08)',
              borderColor: DESIGN_TOKENS.error,
              boxShadow: '0 2px 4px rgba(220, 38, 38, 0.1)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          Clear Filters
        </Button>
      )}
    </Box>
  </Box>
);

// --- MAIN COMPONENT ---

export default function AdminTokenUsage() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState({ preset: 7, from: null, to: null });
  const [selectedModel, setSelectedModel] = useState('All Models');
  const [searchEmail, setSearchEmail] = useState('');
  const limit = 20;

  // React Query for data fetching
  const { data: rawData, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'token-usage', page, dateRange, selectedModel, searchEmail],
    queryFn: async () => {
      let from_date = dateRange.from;
      let to_date = dateRange.to;

      if (dateRange.preset) {
        const d = new Date();
        d.setDate(d.getDate() - dateRange.preset);
        from_date = d.toISOString().split('T')[0];
        to_date = new Date().toISOString().split('T')[0]; // Reset to today for presets
      }

      const response = await getAdminTokenUsageAPI({ 
        page, 
        limit, 
        from_date, 
        to_date,
        model: selectedModel === 'All Models' ? null : selectedModel,
        email: searchEmail || null
      });
      return response?.data || {};
    }
  });

  const data = useMemo(() => ({
    logs: rawData?.logs || rawData?.items || [],
    summary: rawData?.summary || { total_cost: 0, total_tokens: 0, records: 0 },
    chartData: rawData?.chart_data || [],
    models: rawData?.models || [],
    providers: rawData?.providers || [],
  }), [rawData]);

  const totalRecords = data.summary.records || 0;
  const totalPages = Math.ceil(totalRecords / limit);

  // Helper to generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(page - 1);
        pages.push(page);
        pages.push(page + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const tableRows = useMemo(() => data.logs.map((row, i) => ({
    id: row.id || i,
    date: row.created_at || row.timestamp,
    email: row.email || '—',
    feature: row.feature?.toUpperCase().replace(/_/g, ' ') || 'GENERAL',
    model: row.model || 'Unknown',
    provider: row.provider || 'AI',
    tokens: row.total_tokens || 0,
    prompt_tokens: row.prompt_tokens || 0,
    completion_tokens: row.completion_tokens || 0,
    cost: row.cost || 0,
  })), [data.logs]);

  const handleCopyEmail = (email) => {
    if (email && email !== '—') {
      navigator.clipboard.writeText(email);
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries(['admin', 'token-usage']);
  };

  const handleClearFilters = () => {
    setPage(1);
    setSelectedModel('All Models');
    setDateRange({ preset: 7, from: null, to: null });
    setSearchEmail('');
  };

  const isFiltered = selectedModel !== 'All Models' || !!searchEmail || dateRange.preset !== 7 || !!dateRange.from;

  const showingStart = totalRecords === 0 ? 0 : (page - 1) * limit + 1;
  const showingEnd = Math.min(page * limit, totalRecords);

  return (
    <PageContainer maxWidth={false} sx={{ bgcolor: 'var(--bg-light)', minHeight: '100vh', pb: 8, px: { xs: 2, sm: 3, md: 4 }, py: 4 }}>
      {/* Page Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 2,
          mb: 4,
          pb: 3,
          borderBottom: '1px solid var(--divider)',
        }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: 22, md: 28 },
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            AI Token Usage
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mt: 0.5, fontSize: 14 }}>
            Real-time monitoring of AI consumption and expenditure
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<FileDownloadOutlinedIcon />}
            sx={{ 
              borderRadius: '8px', 
              color: 'var(--text-secondary)', 
              borderColor: 'var(--border-color)', 
              bgcolor: 'var(--bg-paper)', 
              px: 2, 
              height: 38, 
              fontWeight: 600, 
              fontSize: 13, 
              textTransform: 'none',
              '&:hover': { borderColor: 'var(--primary)', color: 'var(--primary)', bgcolor: 'var(--light-blue-bg-08)' }
            }}
          >
            Export CSV
          </Button>
          <Button 
            variant="contained" 
            size="small" 
            onClick={handleRefresh}
            startIcon={<RefreshIcon />}
            sx={{ 
              borderRadius: '8px', 
              bgcolor: 'var(--primary)', 
              color: 'white', 
              px: 2, 
              height: 38, 
              fontWeight: 600, 
              fontSize: 13, 
              textTransform: 'none', 
              '&:hover': { bgcolor: 'var(--primary-dark)' } 
            }}
          >
            Refresh Logs
          </Button>
        </Box>
      </Box>

      <FilterBar 
        dateRange={dateRange} 
        onDateRangeChange={(val) => {
          setPage(1); // Reset page on filter change
          setDateRange(val);
        }} 
        selectedModel={selectedModel}
        onModelChange={(val) => {
          setPage(1);
          setSelectedModel(val);
        }}
        searchEmail={searchEmail}
        onSearchEmailChange={(val) => {
          setPage(1);
          setSearchEmail(val);
        }}
        availableModels={data.models}
        onClearFilters={handleClearFilters}
        isFiltered={isFiltered}
      />

      {/* KPI Section - Occupies entire row with better spreading */}
      <Grid container gap={"24px"} mb={"24px"} justifyContent={"space-between"} flexWrap={"nowrap"}>
        <Grid item width={"100%"}>
          <MetricCard 
            label="TOTAL REQUESTS" 
            value={data.summary.records?.toLocaleString() || '1.2M'} 
            trend="up" 
            trendValue="+12.4%" 
            sublabel="Last 30 days" 
            loading={isLoading}
          />
        </Grid>
        <Grid item width={"100%"}>
          <MetricCard 
            label="AVG. LATENCY" 
            value="—" 
            sublabel="System Metric" 
            loading={isLoading}
          />
        </Grid>
        <Grid item width={"100%"}>
          <MetricCard 
            label="TOTAL TOKENS" 
            value={data.summary.total_tokens > 1000000 ? `${(data.summary.total_tokens / 1000000).toFixed(1)}M` : data.summary.total_tokens?.toLocaleString() || '0'} 
            sublabel="Units consumed" 
            loading={isLoading}
          />
        </Grid>
        <Grid item width={"100%"}>
          <MetricCard 
            label="EST. COST" 
            value={`$${data.summary.total_cost?.toFixed(data.summary.total_cost < 0.01 ? 4 : 2)}`} 
            sublabel="USD Expenditure" 
            loading={isLoading}
          />
        </Grid>
      </Grid>

      {/* Main Table Section */}
      <Paper elevation={0} sx={{ marginBottom: "24px", borderRadius: '12px', border: `1px solid ${DESIGN_TOKENS.border}`, overflow: 'hidden', bgcolor: 'white' }}>
        <TableContainer>
          <Table sx={{ minWidth: 1000 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: DESIGN_TOKENS.header_bg }}>
                {['DATE', 'EMAIL', 'FEATURE', 'MODEL', 'PROVIDER', 'TOKENS', 'COST'].map(h => (
                  <TableCell key={h} sx={{ borderBottom: `1px solid ${DESIGN_TOKENS.border}`, py: 2, px: 3, fontWeight: 700, fontSize: 11, color: DESIGN_TOKENS.text_secondary, letterSpacing: '0.05em' }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                [...Array(limit)].map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    {Array(7).fill(0).map((__, j) => (
                      <TableCell key={`cell-${j}`} sx={{ py: 2.5, px: 3 }}>
                        <Skeleton variant="text" sx={{ fontSize: '1rem', width: j === 1 ? '80%' : '60%' }} />
                        {j === 0 && <Skeleton variant="text" sx={{ fontSize: '0.8rem', width: '40%' }} />}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : tableRows.length > 0 ? (
                tableRows.map((row) => (
                  <TableRow key={row.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ py: 2.5, px: 3 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: DESIGN_TOKENS.text_primary }}>
                        {row.date ? format(parseISO(row.date), 'MMM d, yyyy') : '—'}
                      </Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 500, color: DESIGN_TOKENS.text_secondary }}>
                        {row.date ? format(parseISO(row.date), 'HH:mm:ss') : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ px: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          onClick={() => handleCopyEmail(row.email)}
                          sx={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                        >
                          {row.email}
                        </Typography>
                        {row.email !== '—' && (
                          <IconButton size="small" onClick={() => handleCopyEmail(row.email)} sx={{ p: 0.25 }}>
                            <ContentCopyIcon sx={{ fontSize: 12, color: DESIGN_TOKENS.text_secondary }} />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ px: 3 }}>
                      <Chip 
                        label={row.feature} 
                        size="small" 
                        sx={{ 
                          borderRadius: '4px', 
                          height: 22, 
                          fontWeight: 700, 
                          fontSize: 10,
                          letterSpacing: '0.02em',
                          bgcolor: FEATURE_COLORS[row.feature?.replace(/ /g, '_')]?.bg || '#F1F5F9',
                          color: FEATURE_COLORS[row.feature?.replace(/ /g, '_')]?.text || '#64748B'
                        }} 
                      />
                    </TableCell>
                    <TableCell sx={{ px: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SensorsIcon sx={{ fontSize: 16, color: DESIGN_TOKENS.text_secondary }} />
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: DESIGN_TOKENS.text_primary }}>
                          {row.model}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ px: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 18, height: 18, bgcolor: DESIGN_TOKENS.text_primary, fontSize: 10, fontWeight: 800 }}>
                            {row.provider?.[0]}
                          </Avatar>
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: DESIGN_TOKENS.text_secondary }}>
                            {row.provider}
                          </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ px: 3 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: DESIGN_TOKENS.text_primary }}>
                        {row.tokens.toLocaleString()}
                      </Typography>
                      <Typography sx={{ fontSize: 11, fontWeight: 500, color: DESIGN_TOKENS.text_secondary }}>
                        In: {row.prompt_tokens.toLocaleString()} | Out: {row.completion_tokens.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ px: 3 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 700, color: DESIGN_TOKENS.text_primary }}>
                        ${row.cost > 0 ? row.cost.toFixed(4) : '0.0000'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} sx={{ py: 8, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: DESIGN_TOKENS.text_secondary }}>
                      No usage logs found for this filter combination.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${DESIGN_TOKENS.border}` }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: DESIGN_TOKENS.text_secondary }}>
            SHOWING {showingStart} TO {showingEnd} OF {totalRecords.toLocaleString()} ENTRIES
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
             {getPageNumbers().map((p, i) => (
                <Button 
                  key={i} 
                  variant={p === page ? 'contained' : 'text'}
                  disabled={p === '...'}
                  onClick={() => typeof p === 'number' && setPage(p)}
                  sx={{ 
                    minWidth: 32, 
                    height: 32, 
                    p: 0,
                    borderRadius: '6px', 
                    fontSize: 12, 
                    fontWeight: 700,
                    bgcolor: p === page ? 'var(--primary)' : 'transparent',
                    color: p === page ? 'white' : DESIGN_TOKENS.text_secondary,
                    '&:hover': { bgcolor: p === page ? 'var(--primary-dark)' : '#f1f5f9' }
                  }}
                >
                  {p}
                </Button>
             ))}
          </Box>
        </Box>
      </Paper>

      {/* Footer Blocks */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} lg={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '12px', border: `1px solid ${DESIGN_TOKENS.border}`, height: '100%', bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Box>
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: DESIGN_TOKENS.text_primary }}>Cost Breakdown by Provider</Typography>
                <Typography sx={{ fontSize: 12, color: DESIGN_TOKENS.text_secondary }}>Last 24 hours aggregated data</Typography>
              </Box>
              <IconButton size="small"><MoreVertIcon /></IconButton>
            </Box>
            {data.providers.length > 0 ? (
              data.providers.slice(0, 5).map((prov) => {
                const totalProvCost = data.summary.total_cost || 1;
                const percentage = Math.round((prov.cost / totalProvCost) * 100);
                const color = prov.provider?.toLowerCase().includes('openai') ? DESIGN_TOKENS.blue :
                             prov.provider?.toLowerCase().includes('anthropic') ? DESIGN_TOKENS.purple :
                             prov.provider?.toLowerCase().includes('google') ? DESIGN_TOKENS.orange : DESIGN_TOKENS.text_secondary;
                             
                return (
                  <Box key={prov.provider} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{prov.provider}</Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 700 }}>${prov.cost.toFixed(4)}</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={percentage || 0} 
                      sx={{ height: 8, borderRadius: 4, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 } }} 
                    />
                  </Box>
                );
              })
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: DESIGN_TOKENS.text_secondary }}>No provider data available</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '12px', border: `1px solid ${DESIGN_TOKENS.border}`, height: '100%', bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Box>
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: DESIGN_TOKENS.text_primary }}>Top Models by Cost</Typography>
                <Typography sx={{ fontSize: 12, color: DESIGN_TOKENS.text_secondary }}>Detailed Efficiency</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {data.models.length > 0 ? (
                data.models.sort((a, b) => b.cost - a.cost).slice(0, 5).map((m) => (
                  <Box key={m.model} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{m.model}</Typography>
                      <Typography sx={{ fontSize: 11, color: DESIGN_TOKENS.text_secondary }}>{m.calls.toLocaleString()} calls</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 700 }}>${m.cost.toFixed(4)}</Typography>
                      <Typography sx={{ fontSize: 11, fontWeight: 600, color: DESIGN_TOKENS.success }}>
                        {((m.cost / (data.summary.total_cost || 1)) * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: DESIGN_TOKENS.text_secondary }}>No model data available</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </PageContainer>
  );
}
