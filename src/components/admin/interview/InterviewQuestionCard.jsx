import { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Collapse,
  TextField,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RecordVoiceOverRoundedIcon from '@mui/icons-material/RecordVoiceOverRounded';
import { CATEGORY_COLORS } from './constants';

function categoryStyle(category) {
  const key = String(category || '').toLowerCase();
  if (key.includes('tech') || key.includes('coding') || key.includes('system')) {
    return CATEGORY_COLORS.technical;
  }
  if (key.includes('behavior') || key.includes('soft')) return CATEGORY_COLORS.behavioral;
  if (key.includes('lead')) return CATEGORY_COLORS.leadership;
  if (key.includes('hr') || key.includes('culture')) return CATEGORY_COLORS.hr;
  return CATEGORY_COLORS.default;
}

export default function InterviewQuestionCard({
  question,
  index,
  editable = false,
  onQuestionChange,
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(question.question_text || '');

  const catStyle = categoryStyle(question.category);
  const expectations = question.expectations || [];

  const saveEdit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== question.question_text) {
      onQuestionChange?.(question.id, trimmed);
    }
    setEditing(false);
  };

  const cancelEdit = () => {
    setDraft(question.question_text || '');
    setEditing(false);
  };

  return (
    <Box
      sx={{
        borderRadius: '14px',
        border: '1px solid var(--border-color)',
        bgcolor: 'var(--bg-paper)',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          borderColor: 'rgba(37, 99, 235, 0.25)',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)',
        },
      }}
    >
      <Box sx={{ p: 2.25, pb: expanded ? 1.5 : 2.25 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '10px',
              bgcolor: 'var(--light-blue-bg-08)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            {index + 1}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mb: 1 }}>
              <Chip
                label={question.category || 'General'}
                size="small"
                sx={{
                  height: 22,
                  fontSize: 10,
                  fontWeight: 700,
                  bgcolor: catStyle.bg,
                  color: catStyle.color,
                  border: 'none',
                }}
              />
              <Chip
                label={question.complexity || 'Medium'}
                size="small"
                sx={{
                  height: 22,
                  fontSize: 10,
                  fontWeight: 600,
                  bgcolor: 'var(--grey-4)',
                  color: 'var(--text-secondary)',
                  border: 'none',
                }}
              />
              {question.duration && (
                <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                  {question.duration}
                </Typography>
              )}
            </Box>

            {editing ? (
              <Box sx={{ mt: 0.5 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  autoFocus
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      fontSize: 14,
                      lineHeight: 1.6,
                    },
                  }}
                />
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <IconButton size="small" onClick={saveEdit} sx={{ color: 'var(--success-dark)' }}>
                    <CheckRoundedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={cancelEdit} sx={{ color: 'var(--text-muted)' }}>
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ) : (
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  lineHeight: 1.55,
                  letterSpacing: '-0.01em',
                }}
              >
                {question.question_text}
              </Typography>
            )}

            {question.intent && !editing && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mt: 1.25 }}>
                <RecordVoiceOverRoundedIcon sx={{ fontSize: 15, color: 'var(--text-muted)', mt: 0.2 }} />
                <Typography sx={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>
                  {question.intent}
                </Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flexShrink: 0 }}>
            {editable && !editing && (
              <IconButton
                size="small"
                title="Edit question wording"
                onClick={() => {
                  setDraft(question.question_text || '');
                  setEditing(true);
                }}
                sx={{ color: 'var(--text-muted)', '&:hover': { color: 'var(--primary)' } }}
              >
                <EditRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={() => setExpanded((v) => !v)}
              sx={{
                color: 'var(--text-muted)',
                transform: expanded ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            >
              <ExpandMoreRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box
          sx={{
            px: 2.25,
            pb: 2.25,
            pt: 0,
            borderTop: '1px solid var(--divider)',
            bgcolor: 'rgba(248, 250, 252, 0.6)',
          }}
        >
          {question.overview && (
            <Box sx={{ pt: 2, pb: expectations.length ? 1.5 : 0 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}>
                Context
              </Typography>
              <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {question.overview}
              </Typography>
            </Box>
          )}

          {expectations.length > 0 && (
            <Box sx={{ pt: question.overview ? 0 : 2 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}>
                What a strong answer covers
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.25 }}>
                {expectations.map((item, i) => (
                  <Typography
                    component="li"
                    key={i}
                    sx={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, mb: 0.5 }}
                  >
                    {item}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
