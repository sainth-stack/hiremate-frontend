import { useDispatch, useSelector } from 'react-redux';
import { Box, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomInput from '../../../components/inputs/CustomInput';
import CustomButton from '../../../components/common/CustomButton';
import SectionCard from '../components/SectionCard';
import { setLinks } from '../../../store/profile/profileSlice';
import { FORM_GRID_SX, SECTION_TITLE_SX } from '../constants';

const defaultLink = { label: '', url: '' };

export default function LinksTab() {
  const dispatch = useDispatch();
  const links = useSelector((state) => state.profile?.form?.links) ?? {};
  const linkedin = links.linkedInUrl ?? '';
  const github = links.githubUrl ?? '';
  const portfolio = links.portfolioUrl ?? '';
  const otherLinks = Array.isArray(links.otherLinks) && links.otherLinks.length > 0 ? links.otherLinks : [{ ...defaultLink }];

  const updateOtherAt = (idx, field, value) => {
    const next = otherLinks.map((x, i) => (i === idx ? { ...x, [field]: value } : x));
    dispatch(setLinks({ otherLinks: next }));
  };

  const addLink = () => dispatch(setLinks({ otherLinks: [...otherLinks, { ...defaultLink }] }));
  const removeLink = (idx) => {
    if (otherLinks.length <= 1) return;
    dispatch(setLinks({ otherLinks: otherLinks.filter((_, i) => i !== idx) }));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Box component="p" sx={{ m: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          LinkedIn URL is required for many ATS systems.
        </Box>
      </Box>

      <SectionCard sx={{ mb: 3 }}>
        <Box component="span" sx={{ ...SECTION_TITLE_SX, mb: 2 }}>
          Main Links
        </Box>
        <Box sx={FORM_GRID_SX}>
          <CustomInput label="LinkedIn URL *" type="url" placeholder="https://linkedin.com/in/username" value={linkedin} onChange={(e) => dispatch(setLinks({ linkedInUrl: e.target.value }))} />
          <CustomInput label="GitHub URL" type="url" placeholder="https://github.com/username" value={github} onChange={(e) => dispatch(setLinks({ githubUrl: e.target.value }))} />
          <Box sx={{ gridColumn: '1 / -1' }}>
            <CustomInput label="Portfolio Website" type="url" placeholder="https://yourportfolio.com" value={portfolio} onChange={(e) => dispatch(setLinks({ portfolioUrl: e.target.value }))} />
          </Box>
        </Box>
      </SectionCard>

      <SectionCard sx={{ mb: 3 }}>
        <Box component="span" sx={{ ...SECTION_TITLE_SX, mb: 2 }}>
          Other Links
        </Box>
        <Box component="p" sx={{ m: 0, mb: 2, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Example: Blog, Behance, Kaggle
        </Box>
        {otherLinks.map((link, idx) => (
          <Box key={idx} sx={{ ...FORM_GRID_SX, alignItems: 'flex-end', mb: idx < otherLinks.length - 1 ? 2 : 0 }}>
            <CustomInput label="Label" placeholder="Blog" value={link.label} onChange={(e) => updateOtherAt(idx, 'label', e.target.value)} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%' }}>
              <CustomInput label="URL" type="url" placeholder="https://..." sx={{ flex: 1 }} value={link.url} onChange={(e) => updateOtherAt(idx, 'url', e.target.value)} />
              <IconButton size="small" onClick={() => removeLink(idx)} disabled={otherLinks.length <= 1} sx={{ flexShrink: 0, alignSelf: 'flex-end' }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        ))}
        <CustomButton variant="outlined" startIcon={<AddIcon />} onClick={addLink} size="small" sx={{ mt: 2 }}>
          Add Link
        </CustomButton>
      </SectionCard>
    </Box>
  );
}
