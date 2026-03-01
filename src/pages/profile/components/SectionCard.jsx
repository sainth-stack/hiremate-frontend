import { Card } from '@mui/material';
import { CARD_BORDER_RADIUS } from '../constants';

const sectionCardSx = {
  borderRadius: CARD_BORDER_RADIUS,
  p: 3,
  mb: 3,
  boxShadow: '0px 4px 16px rgba(0,0,0,0.04)',
  border: '1px solid rgba(0,0,0,0.06)',
  bgcolor: '#fff',
};

export default function SectionCard({ children, sx = {} }) {
  return (
    <Card
      variant="outlined"
      sx={{
        ...sectionCardSx,
        ...sx,
      }}
    >
      {children}
    </Card>
  );
}
