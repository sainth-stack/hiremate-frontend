import { useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';
import { format, subMonths, startOfDay, getDay, addDays, differenceInDays } from 'date-fns';
import { computeStreak, getPeakApplyDay } from '../../utils/dashboardUtils';
import SkeletonCard from './SkeletonCard';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const CELL_SIZE = 14;
const CELL_GAP = 4;

function getColor(count) {
  if (!count || count === 0) return 'var(--grey-5)';
  if (count <= 1) return 'var(--heat-1, #ede9fe)';
  if (count <= 2) return 'var(--heat-2, #ddd6fe)';
  if (count <= 4) return 'var(--heat-3, #a78bfa)';
  return 'var(--heat-4, #6d28d9)';
}

/** Get Monday of the week containing `d` (ISO week) */
function getMonday(d) {
  const day = getDay(d);
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(startOfDay(d), diff);
}

export default function ActivityHeatmap({ applicationsByDay, loading }) {
  const [tooltip, setTooltip] = useState(null);

  const countByDate = useMemo(() => {
    return (applicationsByDay || []).reduce((acc, d) => {
      acc[d.date] = d.count || 0;
      return acc;
    }, {});
  }, [applicationsByDay]);

  const today = startOfDay(new Date());
  const startDate = subMonths(today, 4);
  const gridStart = getMonday(startDate);
  const totalDays = differenceInDays(today, gridStart) + 1;
  const weekCount = Math.ceil(totalDays / 7);

  const grid = useMemo(() => {
    const rows = [];
    for (let w = 0; w < weekCount; w++) {
      const row = [];
      for (let d = 0; d < 7; d++) {
        const cellDate = addDays(gridStart, w * 7 + d);
        const isInRange = cellDate >= startDate && cellDate <= today;
        row.push(isInRange ? cellDate : null);
      }
      rows.push(row);
    }
    return rows;
  }, [weekCount, gridStart, startDate, today]);

  const streak = computeStreak(applicationsByDay || []);
  const peakDay = getPeakApplyDay(applicationsByDay || []);
  const totalApps = (applicationsByDay || []).reduce((sum, d) => sum + (d.count || 0), 0);

  if (loading) return <SkeletonCard height={260} />;

  const heatColors = [
    'var(--heat-0, var(--grey-5))',
    'var(--heat-1, #ede9fe)',
    'var(--heat-2, #ddd6fe)',
    'var(--heat-3, #a78bfa)',
    'var(--heat-4, #6d28d9)',
  ];

  return (
    <Box
      sx={{
        borderRadius: 'var(--dashboard-card-radius)',
        px: 'var(--dashboard-card-px)',
        py: 'var(--dashboard-card-py)',
        bgcolor: 'var(--bg-paper)',
        border: '1px solid var(--dashboard-border-subtle, var(--border-color))',
        boxShadow: 'var(--dashboard-card-shadow)',
        transition: 'all 0.2s ease',
        '&:hover': { boxShadow: 'var(--dashboard-card-shadow-hover)', transform: 'translateY(-2px)' },
      }}
    >
      {/* Header: title + period + application funnel */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <Typography
            sx={{
              color: 'var(--text-secondary)',
              opacity: 0.9,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontSize: 'var(--dashboard-section-label)',
              fontWeight: 600,
            }}
          >
            Activity Heatmap
          </Typography>
          <Typography sx={{ color: 'var(--text-muted)', fontSize: '12px', letterSpacing: '0.02em' }}>
            Last 5 months
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
            pt: 0.5,
            pb: 0.5,
            px: 1.5,
            borderRadius: '12px',
            bgcolor: 'var(--grey-5)',
            border: '1px solid var(--dashboard-border-subtle, transparent)',
            width: 'fit-content',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
            <Typography sx={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {totalApps}
            </Typography>
            <Typography sx={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              applications
            </Typography>
          </Box>
          {streak > 0 && (
            <Box
              sx={{
                px: 1.25,
                py: 0.5,
                borderRadius: '999px',
                bgcolor: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.22)',
                color: 'var(--warning)',
                fontSize: '12px',
                fontWeight: 700,
                lineHeight: 1,
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <WhatshotRoundedIcon sx={{ fontSize: 16, color: 'var(--warning)' }} />
              {streak}-day streak
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{ position: 'relative' }}>
        <Box
          sx={{
            display: 'flex',
            gap: `${CELL_GAP}px`,
            overflowX: 'auto',
            overflowY: 'hidden',
            pb: 1.5,
            pr: 0.5,
            maxWidth: '100%',
            '&::-webkit-scrollbar': { height: 8 },
            '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(16, 24, 40, 0.2)', borderRadius: 999 },
            '&::-webkit-scrollbar-track': { backgroundColor: 'rgba(16, 24, 40, 0.06)' },
          }}
        >
          {/* Day labels */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: `${CELL_GAP}px`,
              mr: `${CELL_GAP}px`,
              mt: 3.5,
              flexShrink: 0,
            }}
          >
            {DAYS.map((d) => (
              <Typography
                key={d}
                sx={{
                  height: CELL_SIZE,
                  color: 'var(--text-muted)',
                  lineHeight: 1,
                  fontSize: '10px',
                  letterSpacing: '0.04em',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {d}
              </Typography>
            ))}
          </Box>

          {/* Week columns: each column is one week (Mon–Sun) */}
          {grid.map((week, wi) => {
            const firstDay = week.find(Boolean);
            const showMonth = firstDay && Number(format(firstDay, 'd')) <= 7;
            return (
              <Box
                key={wi}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: `${CELL_GAP}px`,
                  flexShrink: 0,
                }}
              >
                <Box sx={{ height: 20, display: 'flex', alignItems: 'center' }}>
                  {showMonth && firstDay && (
                    <Typography sx={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.04em' }}>
                      {format(firstDay, 'MMM')}
                    </Typography>
                  )}
                </Box>
                {week.map((day, di) => {
                  if (!day) {
                    return (
                      <Box
                        key={di}
                        sx={{
                          width: CELL_SIZE,
                          height: CELL_SIZE,
                          borderRadius: '3px',
                          bgcolor: 'transparent',
                          flexShrink: 0,
                        }}
                      />
                    );
                  }
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const count = countByDate[dateStr] || 0;
                  const label = `${format(day, 'EEE, MMM d')}: ${count} application${count !== 1 ? 's' : ''}`;
                  return (
                    <Box
                      key={di}
                      role="button"
                      tabIndex={0}
                      aria-label={label}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({ label, dateStr: format(day, 'MMM d'), count, x: rect.left + rect.width / 2, y: rect.top });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      onFocus={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({ label, dateStr: format(day, 'MMM d'), count, x: rect.left + rect.width / 2, y: rect.top });
                      }}
                      onBlur={() => setTooltip(null)}
                      sx={{
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        borderRadius: '3px',
                        bgcolor: count === 0 ? heatColors[0] : getColor(count),
                        cursor: 'default',
                        border: '1px solid rgba(16, 24, 40, 0.08)',
                        transition: 'transform 0.12s ease, box-shadow 0.12s ease',
                        flexShrink: 0,
                        '&:hover': {
                          transform: 'scale(1.15)',
                          boxShadow: '0 0 0 2px rgba(109, 40, 217, 0.25)',
                          zIndex: 1,
                        },
                        '&:focus-visible': {
                          outline: 'none',
                          boxShadow: '0 0 0 2px rgba(109, 40, 217, 0.4)',
                          zIndex: 1,
                        },
                      }}
                    />
                  );
                })}
              </Box>
            );
          })}
        </Box>

        {tooltip && (
          <Box
            sx={{
              position: 'fixed',
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translate(-50%, calc(-100% - 12px))',
              px: 1.5,
              py: 1,
              borderRadius: '12px',
              bgcolor: 'var(--bg-paper)',
              border: '1px solid var(--dashboard-border-subtle, var(--border-color))',
              boxShadow: '0 12px 28px rgba(16, 24, 40, 0.12), 0 0 0 1px rgba(0,0,0,0.04)',
              pointerEvents: 'none',
              zIndex: 1400,
              transition: 'opacity 0.1s ease',
              minWidth: 140,
            }}
          >
            <Typography sx={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4, letterSpacing: '0.02em' }}>
              {tooltip.dateStr}
            </Typography>
            <Typography sx={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, mt: 0.25 }}>
              {tooltip.count} application{tooltip.count !== 1 ? 's' : ''}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Legend + peak day */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
          mt: 2,
          pt: 1.5,
          borderTop: '1px solid var(--dashboard-border-subtle, rgba(16, 24, 40, 0.08))',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.06em', fontWeight: 600 }}>
            LESS
          </Typography>
          {heatColors.map((c) => (
            <Box
              key={c}
              sx={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                borderRadius: '3px',
                bgcolor: c,
                border: '1px solid rgba(16, 24, 40, 0.08)',
              }}
            />
          ))}
          <Typography sx={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.06em', fontWeight: 600 }}>
            MORE
          </Typography>
        </Box>
        {peakDay && (
          <Typography sx={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
            Peak day:{' '}
            <Box component="span" fontWeight={700} sx={{ color: 'var(--primary)' }}>
              {peakDay}
            </Box>
          </Typography>
        )}
      </Box>
    </Box>
  );
}
