import { useState } from 'react';
import { Box, Chip, Autocomplete, TextField, Typography } from '@mui/material';
import { SOFT_SKILL_SUGGESTIONS, SOFT_SKILL_CATEGORIES, MAX_SOFT_SKILLS } from './constants';

export default function SoftSkillChips({ skills = [], onChange, disabled }) {
  const [inputValue, setInputValue] = useState('');
  const list = skills.filter((s) => (s.name ?? '').trim());
  const atLimit = list.length >= MAX_SOFT_SKILLS;

  const handleAdd = (_, newValue) => {
    const name = typeof newValue === 'string' ? newValue.trim() : newValue?.trim?.() ?? '';
    if (!name || atLimit) return;
    if (list.some((s) => (s.name ?? '').toLowerCase() === name.toLowerCase())) return;
    const newSkill = { id: `soft_${Date.now()}`, name, category: '', aiRelevanceScore: null };
    onChange([...list, newSkill]);
    setInputValue('');
  };

  const handleRemove = (idx) => {
    onChange(list.filter((_, i) => i !== idx));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="caption" sx={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
          Soft skills ({list.length}/{MAX_SOFT_SKILLS})
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {list.map((skill, idx) => (
          <Chip
            key={skill.id || idx}
            label={skill.name}
            size="small"
            onDelete={() => handleRemove(idx)}
            sx={{
              borderRadius: 2,
              fontWeight: 500,
              fontSize: 13,
              '& .MuiChip-deleteIcon': { fontSize: 16 },
            }}
          />
        ))}
      </Box>

      {!atLimit && (
        <Autocomplete
          freeSolo
          options={SOFT_SKILL_SUGGESTIONS}
          value={null}
          inputValue={inputValue}
          onInputChange={(_, v) => setInputValue(v)}
          onChange={handleAdd}
          disabled={disabled}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Add soft skill..."
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 14, minHeight: 44 },
                '& .MuiInputLabel-root': { fontSize: 12 },
              }}
            />
          )}
        />
      )}

      {atLimit && (
        <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontSize: 12 }}>
          Max {MAX_SOFT_SKILLS} soft skills for ATS. Remove one to add another.
        </Typography>
      )}
    </Box>
  );
}
