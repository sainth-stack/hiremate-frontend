import { Box, Typography, IconButton, Select, MenuItem } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CustomInput from '../../../components/inputs/CustomInput';
import ProficiencyIndicator from './ProficiencyIndicator';
import SkillGapBadge from './SkillGapBadge';
import SkillAutocomplete from './SkillAutocomplete';
import { PROFICIENCY_LEVELS, TECH_SKILL_CATEGORIES } from './constants';

export default function SkillCard({
  skill,
  index,
  onUpdate,
  onRemove,
  onDragHandle,
  canRemove = true,
  showGapBadge = false,
  gapType,
}) {
  const update = (field, value) => onUpdate(index, field, value);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        p: 2,
        borderRadius: 2,
        bgcolor: '#fff',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.2s, border-color 0.2s',
        '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
      }}
    >
      {onDragHandle && (
        <Box sx={{ cursor: 'grab', touchAction: 'none', pt: 1 }} {...onDragHandle}>
          <DragIndicatorIcon sx={{ fontSize: 20, color: 'var(--text-muted)' }} />
        </Box>
      )}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <SkillAutocomplete
            value={skill.name}
            onChange={(name) => update('name', name)}
            onCategoryChange={(category) => update('category', category)}
            placeholder="e.g. React, Python"
            label="Skill name"
          />
          {showGapBadge && gapType && <SkillGapBadge type={gapType} />}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Proficiency
            </Typography>
            <Select
              size="small"
              value={skill.proficiencyLevel || skill.level || ''}
              onChange={(e) => update('proficiencyLevel', e.target.value)}
              displayEmpty
              sx={{
                width: '100%',
                borderRadius: 2,
                fontSize: 13,
                height: 40,
                '& .MuiSelect-select': { py: 1 },
              }}
            >
              <MenuItem value="">Select</MenuItem>
              {PROFICIENCY_LEVELS.map((p) => (
                <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
              ))}
            </Select>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Years
            </Typography>
            <CustomInput
              label=""
              placeholder="e.g. 3"
              value={skill.years ?? ''}
              onChange={(e) => update('years', e.target.value)}
              type="number"
              sx={{ '& .MuiOutlinedInput-root': { height: 40, borderRadius: 2 }, '& .MuiInputLabel-root': { display: 'none' } }}
            />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Category
            </Typography>
            <Select
              size="small"
              value={skill.category || ''}
              onChange={(e) => update('category', e.target.value)}
              displayEmpty
              sx={{
                width: '100%',
                borderRadius: 2,
                fontSize: 13,
                height: 40,
                '& .MuiSelect-select': { py: 1 },
              }}
            >
              <MenuItem value="">Select</MenuItem>
              {TECH_SKILL_CATEGORIES.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </Box>
        </Box>

        {skill.proficiencyLevel && (
          <Box sx={{ mt: 1.5 }}>
            <ProficiencyIndicator level={skill.proficiencyLevel} showLabel={false} size="small" />
          </Box>
        )}
      </Box>

      {canRemove && (
        <IconButton size="small" onClick={() => onRemove(index)} sx={{ color: 'var(--text-muted)', mt: 0.5 }} aria-label="Remove skill">
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}
