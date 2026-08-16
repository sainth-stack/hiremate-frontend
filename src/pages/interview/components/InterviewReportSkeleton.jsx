import { Box, Card, CardContent, Skeleton } from '@mui/material';

function SectionSkeleton({ lines = 3 }) {
  return (
    <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: 'var(--bg-light)', border: '1px solid var(--border-color)', mb: 2 }}>
      <Skeleton variant="text" width="35%" height={24} sx={{ mb: 1.5 }} />
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} variant="text" width={index === lines - 1 ? '70%' : '100%'} height={18} />
      ))}
    </Box>
  );
}

export default function InterviewReportSkeleton() {
  return (
    <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid rgba(226,232,240,0.95)', overflow: 'hidden' }}>
      <Box sx={{ textAlign: 'center', px: 3, py: 5, borderBottom: '1px solid rgba(15,23,42,0.06)' }}>
        <Skeleton variant="circular" width={56} height={56} sx={{ mx: 'auto', mb: 1.5 }} />
        <Skeleton variant="text" width="45%" height={36} sx={{ mx: 'auto', mb: 1 }} />
        <Skeleton variant="text" width="70%" height={20} sx={{ mx: 'auto' }} />
      </Box>
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Skeleton variant="circular" width={120} height={120} />
        </Box>
        <SectionSkeleton lines={4} />
        <SectionSkeleton lines={3} />
        <SectionSkeleton lines={3} />
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', mt: 2 }}>
          <Skeleton variant="rounded" width={140} height={42} />
          <Skeleton variant="rounded" width={160} height={42} />
        </Box>
      </CardContent>
    </Card>
  );
}
