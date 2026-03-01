import { useState } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { SKILL_SUGGESTIONS, TECH_SKILL_CATEGORIES } from './constants';

// Simulated async fetch (replace with real API)
function searchSkills(query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) return Promise.resolve(SKILL_SUGGESTIONS.slice(0, 15));
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = SKILL_SUGGESTIONS.filter(
        (s) => s.name.toLowerCase().includes(q) || (s.category && s.category.toLowerCase().includes(q))
      ).slice(0, 15);
      resolve(filtered.length ? filtered : [{ name: query.trim(), category: '' }]);
    }, 200);
  });
}

export default function SkillAutocomplete({
  value = '',
  onChange,
  onCategoryChange,
  placeholder = 'Search or add skill',
  label = 'Skill',
  error,
  disabled,
}) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState(SKILL_SUGGESTIONS.slice(0, 15));
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const handleInputChange = (_, newInputValue) => {
    setInputValue(newInputValue);
    if (open && newInputValue) {
      setLoading(true);
      searchSkills(newInputValue).then((list) => {
        setOptions(list);
        setLoading(false);
      });
    }
  };

  const handleChange = (_, newValue) => {
    const name = typeof newValue === 'string' ? newValue : newValue?.name ?? '';
    const category = newValue?.category ?? '';
    setInputValue(name);
    onChange(name);
    if (onCategoryChange) onCategoryChange(category);
  };

  const optionLabel = (opt) => (typeof opt === 'string' ? opt : opt?.name ?? '');
  const inputVal = value || inputValue;

  return (
    <Autocomplete
      freeSolo
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
      loading={loading}
      value={inputVal ? { name: inputVal, category: '' } : null}
      inputValue={inputVal}
      onInputChange={handleInputChange}
      onChange={handleChange}
      getOptionLabel={optionLabel}
      renderOption={(props, option) => (
        <li {...props} key={option.name}>
          <span style={{ fontWeight: 500 }}>{option.name}</span>
          {option.category && (
            <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--text-secondary)' }}>{option.category}</span>
          )}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 14, minHeight: 44 },
            '& .MuiInputLabel-root': { fontSize: 12 },
          }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={18} sx={{ mr: 1 }} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      disabled={disabled}
    />
  );
}
