import React, { useState } from 'react';
import { Box, Card, Typography, TextField, IconButton, Chip, Button, InputBase } from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

export const EMPTY_EDUCATION = { degree: '', fieldOfStudy: '', institution: '', startYear: '', endYear: '', grade: '', location: '' };
export const EMPTY_EXPERIENCE = { jobTitle: '', companyName: '', payrollCompany: '', employmentType: '', startDate: '', endDate: '', location: '', workMode: '', description: '', techStack: '' };
export const EMPTY_TECH_SKILL = { name: '', level: '', years: '' };
export const EMPTY_SOFT_SKILL = { name: '' };
export const EMPTY_SKILL_CATEGORY = { categoryName: '', skills: [], order: 0 };
export const EMPTY_CUSTOM_SECTION = { sectionId: '', sectionName: '', content: '', format: 'bullets', order: 0, enabled: true };
export const EMPTY_PROJECT = { name: '', description: '', role: '', techStack: '', githubUrl: '', liveUrl: '', projectType: '' };

export function ResumeSectionCard({ title, defaultOpen = false, badge, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const isStringTitle = typeof title === 'string';
  
  return (
    <Card sx={{ mb: 2, borderRadius: 1.5, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'visible', border: '1px solid var(--border-color)', bgcolor: 'var(--bg-paper)' }}>
      <Box
        onClick={() => setOpen((o) => !o)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.75, cursor: 'pointer', '&:hover': { bgcolor: 'var(--sidebar-item-hover-bg)' } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
          {isStringTitle ? (
            <Typography variant="subtitle2" sx={{ fontFamily: 'var(--font-family)', fontWeight: 600, fontSize: '0.9375rem' }} color="var(--text-primary)">
              {title}
            </Typography>
          ) : (
            title
          )}
          {badge != null && (
            <Box sx={{ flexShrink: 0 }}>
              {typeof badge === 'string' ? (
                <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontFamily: 'var(--font-family)' }}>{badge}</Typography>
              ) : (
                badge
              )}
            </Box>
          )}
        </Box>
        {open ? <ExpandLessRoundedIcon sx={{ color: 'var(--text-muted)', flexShrink: 0 }} /> : <ExpandMoreRoundedIcon sx={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
      </Box>
      {open && <Box sx={{ px: 2, pb: 2, pt: 0 }}>{children}</Box>}
    </Card>
  );
}

export function TemplateThumbnail({ id, label, img, selected, onSelect, ats }) {
  const [imgErr, setImgErr] = React.useState(false);
  const palettes = { classic: '#374151', accent: '#1e3a5f', minimalist: '#222', modern: '#2d3748', executive: '#0f2952', harvard: '#000' };
  const bg = palettes[id] || '#374151';
  return (
    <Card
      onClick={onSelect}
      sx={{
        overflow: 'hidden',
        cursor: 'pointer',
        border: 2,
        borderColor: selected ? 'var(--primary)' : 'var(--border-color)',
        bgcolor: selected ? 'var(--light-blue-bg)' : 'var(--bg-paper)',
        boxShadow: selected ? '0 2px 12px rgba(51, 94, 222, 0.2)' : '0 1px 4px rgba(0,0,0,0.06)',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
        '&:hover': {
          borderColor: selected ? 'var(--primary)' : 'rgba(51, 94, 222, 0.4)',
          bgcolor: selected ? 'rgba(51, 94, 222, 0.06)' : 'var(--bg-light)',
          boxShadow: selected ? '0 2px 12px rgba(51, 94, 222, 0.25)' : '0 2px 8px rgba(0,0,0,0.08)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box sx={{ aspectRatio: '120/160', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {!imgErr ? (
          <Box
            component="img"
            src={img}
            alt={label}
            loading="eager"
            onError={() => setImgErr(true)}
            sx={{ width: '100%', height: 'auto', objectFit: 'contain', flex: 1, p: 0.75, bgcolor: 'var(--bg-light)', display: 'block' }}
          />
        ) : (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'var(--bg-light)', gap: 0.5, p: 1 }}>
            <Box sx={{ width: '80%', height: 6, bgcolor: bg, borderRadius: 0.5, mb: 0.5 }} />
            {[1, 0.7, 0.7, 0.5, 0.5, 0.5, 0.5].map((w, i) => (
              <Box key={i} sx={{ width: `${w * 80}%`, height: 3, bgcolor: 'var(--border-hover)', borderRadius: 0.5, mt: i === 2 ? 0.75 : 0 }} />
            ))}
          </Box>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.25, py: 0.75, borderTop: '1px solid var(--border-color)', bgcolor: selected ? 'rgba(51, 94, 222, 0.08)' : 'transparent' }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" sx={{ fontFamily: 'var(--font-family)', fontWeight: selected ? 600 : 500, color: selected ? 'var(--primary)' : 'var(--text-secondary)', display: 'block', lineHeight: 1.2 }}>
              {label}
            </Typography>
            {ats && (
              <Typography sx={{ fontSize: '0.6rem', color: 'var(--success)', fontWeight: 600, fontFamily: 'var(--font-family)' }}>ATS</Typography>
            )}
          </Box>
          {selected ? <CheckCircleRoundedIcon sx={{ color: 'var(--primary)', fontSize: 18, flexShrink: 0 }} /> : null}
        </Box>
      </Box>
    </Card>
  );
}

export function getBulletChar(bulletIcon) {
  if (!bulletIcon) return '•';
  const ch = bulletIcon.trim().charAt(0);
  return ch || '•';
}

export function BulletEditor({ value, onChange, bulletChar = '•' }) {
  const toLines = (v) => {
    if (!v) return [''];
    const raw = v.split('\n').map((l) => l.trim()).filter(Boolean);
    if (raw.length >= 2) return raw;
    const para = raw[0] || '';
    if (para.length > 120) {
      const sentences = para.split(/\.\s+/).map((s) => s.trim()).filter(Boolean).map((s) => (s.endsWith('.') ? s : s + '.'));
      if (sentences.length >= 2) return sentences;
    }
    return raw.length ? raw : [''];
  };

  const [lines, setLines] = React.useState(() => toLines(value));
  const inputRefs = React.useRef([]);
  const pendingFocus = React.useRef(null);

  React.useEffect(() => {
    setLines(toLines(value));
  }, [value]);

  React.useEffect(() => {
    if (pendingFocus.current !== null) {
      const idx = pendingFocus.current;
      pendingFocus.current = null;
      setTimeout(() => inputRefs.current[idx]?.focus(), 20);
    }
  });

  const commit = (next) => {
    setLines(next);
    onChange(next.join('\n'));
  };

  const updateLine = (i, text) => {
    const next = [...lines]; next[i] = text; commit(next);
  };

  const handleKeyDown = (e, i) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const next = [...lines.slice(0, i + 1), '', ...lines.slice(i + 1)];
      pendingFocus.current = i + 1;
      commit(next);
    } else if (e.key === 'Backspace' && lines[i] === '' && lines.length > 1) {
      e.preventDefault();
      const next = lines.filter((_, idx) => idx !== i);
      pendingFocus.current = Math.max(0, i - 1);
      commit(next);
    }
  };

  const removeLine = (i) => {
    if (lines.length <= 1) { commit(['']); return; }
    const next = lines.filter((_, idx) => idx !== i);
    pendingFocus.current = Math.max(0, i - 1);
    commit(next);
  };

  const addLine = () => {
    const next = [...lines, ''];
    pendingFocus.current = next.length - 1;
    commit(next);
  };

  return (
    <Box sx={{ border: '1px solid var(--border-hover)', borderRadius: 1, bgcolor: 'var(--bg-paper)', overflow: 'hidden', '&:focus-within': { borderColor: 'var(--primary)', boxShadow: '0 0 0 2px rgba(37,99,235,0.1)' } }}>
      {lines.map((line, i) => (
        <Box
          key={i}
          sx={{ display: 'flex', alignItems: 'flex-start', borderBottom: '1px solid var(--bg-light)', '&:last-of-type': { borderBottom: 'none' }, '&:hover': { bgcolor: 'var(--bg-light)' }, '&:hover .bdel': { opacity: 1 } }}
        >
          <Box sx={{ px: 1.5, pt: '10px', color: 'var(--text-muted)', fontSize: '0.875rem', flexShrink: 0, userSelect: 'none', lineHeight: 1, fontWeight: 500 }}>
            {bulletChar}
          </Box>
          <TextField
            inputRef={(el) => { inputRefs.current[i] = el; }}
            variant="standard"
            fullWidth
            multiline
            value={line}
            onChange={(e) => updateLine(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            placeholder={i === 0 ? 'e.g. Led migration of monolith to microservices, reducing p99 latency by 40%…' : 'Add another bullet…'}
            InputProps={{ disableUnderline: true }}
            sx={{
              flex: 1,
              '& .MuiInputBase-root': { px: 0, py: '8px', fontSize: '0.875rem', lineHeight: 1.55, fontFamily: 'var(--font-family)', color: 'var(--text-primary)', bgcolor: 'transparent' },
              '& textarea': { resize: 'none' },
              '& .MuiInputBase-input::placeholder': { color: 'var(--placeholder)', opacity: 1, fontSize: '0.8rem' },
            }}
          />
          <IconButton
            className="bdel"
            size="small"
            tabIndex={-1}
            onClick={() => removeLine(i)}
            sx={{ opacity: 0, transition: 'opacity 0.12s', color: 'var(--border-hover)', '&:hover': { color: 'var(--error)', bgcolor: 'transparent' }, m: '4px', flexShrink: 0 }}
          >
            <DeleteOutlinedIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      ))}
      <Box
        onClick={addLine}
        sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.75, cursor: 'pointer', bgcolor: 'var(--bg-light)', color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-family)', borderTop: '1px dashed var(--border-hover)', '&:hover': { bgcolor: 'var(--sidebar-item-hover-bg)', color: 'var(--text-secondary)' } }}
      >
        <AddRoundedIcon sx={{ fontSize: 14 }} /> Add bullet point
      </Box>
    </Box>
  );
}

export function KeywordMatchCompact({ keywordCount = 0, totalKeywords = 0, matchPct = 0 }) {
  const pct = totalKeywords > 0 ? Math.round((keywordCount / totalKeywords) * 100) : matchPct;
  if (totalKeywords === 0 && matchPct === 0) return null;
  const color = pct >= 85 ? 'var(--success)' : pct >= 65 ? 'var(--warning)' : 'var(--error)';
  const bgColor = pct >= 85 ? 'var(--success-bg)' : pct >= 65 ? 'var(--warning-bg)' : 'var(--error-bg)';
  const borderColor = pct >= 85 ? 'var(--success-bk)' : pct >= 65 ? 'var(--warning-light)' : 'var(--error-bk)';
  const circumference = 2 * Math.PI * 13;
  const dash = (pct / 100) * circumference;
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        py: 0.75,
        borderRadius: 2,
        bgcolor: bgColor,
        border: `1px solid ${borderColor}`,
      }}
    >
      <Box sx={{ position: 'relative', width: 28, height: 28, flexShrink: 0 }}>
        <svg width="28" height="28" viewBox="0 0 28 28" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="14" cy="14" r="13" fill="none" stroke={borderColor} strokeWidth="2.5" />
          <circle
            cx="14" cy="14" r="13"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
          />
        </svg>
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, color, lineHeight: 1 }}>{pct}</Typography>
        </Box>
      </Box>
      <Box>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color, lineHeight: 1, fontFamily: 'var(--font-family)' }}>
          {pct}% match
        </Typography>
        <Typography sx={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.2, mt: 0.25, fontFamily: 'var(--font-family)' }}>
          {keywordCount}/{totalKeywords} keywords
        </Typography>
      </Box>
    </Box>
  );
}

/**
 * SkillCategoryEditor - Simplified chip-based skill editor
 * categoryName: string - name of the skill category (left side label)
 * skills: string[] - array of skill names
 * onChange: (categoryName: string, skills: string[]) => void
 * onRemove: () => void - callback to remove entire category
 * canRemove: boolean - whether the remove button should be enabled
 */
export function SkillCategoryEditor({ categoryName, skills = [], onChange, onRemove, canRemove = true }) {
  const [inputValue, setInputValue] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempCategoryName, setTempCategoryName] = useState(categoryName);

  const handleAddSkill = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange(categoryName, [...skills, trimmed]);
      setInputValue('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    onChange(categoryName, skills.filter(s => s !== skillToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSaveCategoryName = () => {
    const trimmed = tempCategoryName.trim();
    if (trimmed) {
      onChange(trimmed, skills);
      setIsEditingName(false);
    }
  };

  const handleCategoryNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveCategoryName();
    } else if (e.key === 'Escape') {
      setTempCategoryName(categoryName);
      setIsEditingName(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        p: 2.5,
        borderRadius: 2,
        bgcolor: 'var(--bg-paper)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ flex: 1, minWidth: 0, mr: 2 }}>
          {isEditingName ? (
            <InputBase
              autoFocus
              value={tempCategoryName}
              onChange={(e) => setTempCategoryName(e.target.value)}
              onKeyDown={handleCategoryNameKeyDown}
              onBlur={handleSaveCategoryName}
              sx={{
                fontFamily: 'var(--font-family)',
                fontWeight: 600,
                fontSize: '0.9375rem',
                color: 'var(--text-primary)',
                border: '1.5px solid var(--primary)',
                borderRadius: 1,
                px: 1.5,
                py: 0.75,
                bgcolor: 'var(--light-blue-bg)',
                width: '100%',
              }}
            />
          ) : (
            <Box 
              onClick={() => setIsEditingName(true)}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                cursor: 'pointer',
                px: 1.5,
                py: 0.75,
                borderRadius: 1,
                transition: 'all 0.15s',
                '&:hover': {
                  bgcolor: 'var(--light-blue-bg)',
                },
              }}
            >
              <Typography
                sx={{
                  fontFamily: 'var(--font-family)',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  color: 'var(--text-primary)',
                }}
              >
                {categoryName}
              </Typography>
              <Chip
                label={`${skills.length} skill${skills.length !== 1 ? 's' : ''}`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  bgcolor: 'var(--light-blue-bg-08)',
                  color: 'var(--primary)',
                  '& .MuiChip-label': { px: 0.75, py: 0 }
                }}
              />
            </Box>
          )}
        </Box>
        <IconButton
          size="small"
          onClick={onRemove}
          disabled={!canRemove}
          sx={{
            color: 'var(--text-muted)',
            flexShrink: 0,
            '&:hover': {
              color: 'var(--error)',
              bgcolor: 'var(--error-bg)',
            },
            '&:disabled': {
              opacity: 0.3,
            },
          }}
        >
          <DeleteOutlinedIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center', minHeight: 32 }}>
        {skills.map((skill, idx) => (
          <Chip
            key={idx}
            label={skill}
            onDelete={() => handleRemoveSkill(skill)}
            deleteIcon={<CloseRoundedIcon sx={{ fontSize: '14px !important' }} />}
            size="small"
            sx={{
              fontFamily: 'var(--font-family)',
              fontSize: '0.8125rem',
              height: 28,
              bgcolor: 'var(--light-blue-bg)',
              border: '1px solid var(--light-blue-bg-08)',
              color: 'var(--text-primary)',
              '& .MuiChip-label': {
                px: 1.25
              },
              '& .MuiChip-deleteIcon': {
                color: 'var(--text-muted)',
                fontSize: 14,
                '&:hover': {
                  color: 'var(--error)',
                },
              },
            }}
          />
        ))}
        <TextField
          size="small"
          placeholder={skills.length === 0 ? "Type a skill and press Enter..." : "Add another..."}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleAddSkill}
          sx={{
            minWidth: 140,
            flex: '0 1 auto',
            '& .MuiOutlinedInput-root': {
              height: 28,
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-family)',
              bgcolor: 'var(--bg-paper)',
              borderRadius: 1,
              '& fieldset': {
                borderColor: 'var(--border-color)',
              },
              '&:hover fieldset': {
                borderColor: 'var(--primary)',
              },
              '&.Mui-focused fieldset': {
                borderWidth: 1.5,
                borderColor: 'var(--primary)',
              },
            },
            '& input::placeholder': {
              fontSize: '0.8125rem',
              opacity: 0.6
            }
          }}
        />
      </Box>
    </Box>
  );
}
