import { useDispatch, useSelector } from 'react-redux';
import { Box, IconButton, Card, CardContent } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomInput from '../../../components/inputs/CustomInput';
import CustomButton from '../../../components/common/CustomButton';
import { setLinks } from '../../../store/profile/profileSlice';

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

  const formGridSx = {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) minmax(0, 1fr)' },
    columnGap: 2,
    rowGap: 1.5,
    width: '100%',
    '& .custom-input': { marginBottom: 0 },
    '& .custom-select': { marginBottom: 0 },
  };
  const sectionHeaderSx = { mb: 1.5, fontSize: 'var(--font-size-section-header)', fontWeight: 600 };
  const sectionWrapperSx = { mt: 3, pt: 3, borderTop: '1px solid var(--border-color)', '&:first-of-type': { mt: 0, pt: 0, borderTop: 'none' } };
  const cardSx = {
    borderRadius: 2,
    width: '100%',
    border: '1px solid var(--border-color)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  };
  const innerCardSx = { ...cardSx };

  return (
    <Box sx={{ width: '100%' }}>
      <Card variant="outlined" sx={cardSx}>
        <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
          <Box component="p" sx={{ display: 'block', m: 0, mb: 0, fontSize: 'var(--font-size-helper)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            LinkedIn URL is required for many ATS systems.
          </Box>

          {/* Main Links */}
          <Box sx={sectionWrapperSx}>
            <Box component="span" sx={{ display: 'block', ...sectionHeaderSx }}>
              Main Links
            </Box>
            <Box sx={formGridSx}>
              <CustomInput label="LinkedIn URL *" type="url" placeholder="https://linkedin.com/in/username" value={linkedin} onChange={(e) => dispatch(setLinks({ linkedInUrl: e.target.value }))} />
              <CustomInput label="GitHub URL" type="url" placeholder="https://github.com/username" value={github} onChange={(e) => dispatch(setLinks({ githubUrl: e.target.value }))} />
              <Box sx={{ gridColumn: '1 / -1' }}>
                <CustomInput label="Portfolio Website" type="url" placeholder="https://yourportfolio.com" value={portfolio} onChange={(e) => dispatch(setLinks({ portfolioUrl: e.target.value }))} />
              </Box>
            </Box>
          </Box>

          {/* Other Links */}
          <Box sx={sectionWrapperSx}>
            <Box component="span" sx={{ display: 'block', ...sectionHeaderSx }}>
              Other Links
            </Box>
            <Box component="p" sx={{ display: 'block', m: 0, mb: 1.5, fontSize: 'var(--font-size-helper)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Example: Blog, Behance, Kaggle
            </Box>
            {otherLinks.map((link, idx) => (
              <Card key={idx} variant="outlined" sx={{ ...innerCardSx, mt: idx > 0 ? 1.5 : 0 }}>
                <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
                <Box sx={{ ...formGridSx, alignItems: 'flex-end' }}>
                  <CustomInput label="Label" placeholder="Blog" value={link.label} onChange={(e) => updateOtherAt(idx, 'label', e.target.value)} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%' }}>
                    <CustomInput label="URL" type="url" placeholder="https://..." sx={{ flex: 1 }} value={link.url} onChange={(e) => updateOtherAt(idx, 'url', e.target.value)} />
                    <IconButton size="small" onClick={() => removeLink(idx)} disabled={otherLinks.length <= 1} sx={{ flexShrink: 0, alignSelf: 'flex-end' }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </CardContent>
      </Card>

      <CustomButton variant="outlined" startIcon={<AddIcon />} onClick={addLink} sx={{ mt: 2 }}>
        Add Link
      </CustomButton>
    </Box>
  );
}
