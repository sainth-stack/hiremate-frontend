import { memo } from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';

const statConfig = [
  {
    key: 'total',
    label: 'Total Applications',
    icon: AssignmentRoundedIcon,
    color: 'var(--primary)',
    bgTint: 'var(--light-blue-bg-08)',
  },
  {
    key: 'interviews',
    label: 'Interviews',
    icon: EventAvailableRoundedIcon,
    color: 'var(--warning)',
    bgTint: 'var(--warning-bg)',
  },
  {
    key: 'responseRate',
    label: 'Response Rate',
    icon: TrendingUpRoundedIcon,
    color: 'var(--success)',
    bgTint: 'var(--success-bg)',
  },
  {
    key: 'closed',
    label: 'Closed',
    icon: EmojiEventsRoundedIcon,
    color: 'var(--primary)',
    bgTint: 'var(--light-blue-bg-08)',
  },
];

const statItem = {
  hidden: { opacity: 0, y: 8 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: 'easeOut' },
  }),
};

function StatCard({ config, value, index }) {
  const Icon = config.icon;
  return (
    <motion.div
      custom={index}
      variants={statItem}
      initial="hidden"
      animate="visible"
      style={{ flex: '1 1 0', minWidth: 140 }}
    >
    <Box
      sx={{
        borderRadius: 2,
        height: 90,
        p: 2,
        bgcolor: 'var(--bg-paper)',
        boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
        },
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(0,0,0,0.03)',
          flexShrink: 0,
        }}
      >
        <Icon sx={{ color: config.color, fontSize: 20 }} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography component="div" sx={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>
          {config.label}
        </Typography>
        <Typography component="div" sx={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
          {value}
        </Typography>
      </Box>
    </Box>
    </motion.div>
  );
}

function StatsRow({ jobs }) {
  const total = jobs.length;
  const interviews = jobs.filter((j) => j.application_status === 'interview').length;
  const applied = jobs.filter((j) => ['applied', 'interview', 'closed'].includes(j.application_status)).length;
  const closed = jobs.filter((j) => j.application_status === 'closed').length;
  const responseRate = applied > 0 ? Math.round((interviews / applied) * 100) : 0;

  const values = {
    total: String(total),
    interviews: String(interviews),
    responseRate: `${responseRate}%`,
    closed: String(closed),
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        flexWrap: 'wrap',
      }}
    >
      {statConfig.map((config, i) => (
        <StatCard key={config.key} config={config} value={values[config.key]} index={i} />
      ))}
    </Box>
  );
}

export default memo(StatsRow);
