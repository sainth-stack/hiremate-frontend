import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Tabs, Tab, Link } from '@mui/material';
import PageContainer from '../../components/common/PageContainer';
import { getProfile } from '../../store/auth/authSlice';
import { fetchProfile, mergeFromResume } from '../../store/profile/profileSlice';
import ProfileTab from './tabs/ProfileTab';
import ExperienceTab from './tabs/ExperienceTab';
import EducationTab from './tabs/EducationTab';
import SkillsTab from './tabs/SkillsTab';
import ProjectsTab from './tabs/ProjectsTab';
import PreferencesTab from './tabs/PreferencesTab';
import LinksTab from './tabs/LinksTab';
import ReviewTab from './tabs/ReviewTab';

const TAB_LABELS = [
  'Profile',
  'Experience',
  'Education',
  'Skills',
  'Projects',
  'Preferences',
  'Links',
  'Review',
];

export default function Profile() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const parsedData = useSelector((state) => state.resume?.parsedData);
  const [activeTab, setActiveTab] = useState(0);
  const fromRegister = location.state?.fromRegister === true;

  useEffect(() => {
    dispatch(getProfile());
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (parsedData) dispatch(mergeFromResume(parsedData));
  }, [parsedData, dispatch]);

  const handleTabChange = (_, newValue) => setActiveTab(newValue);

  const renderTabPanel = (index) => {
    switch (index) {
      case 0:
        return <ProfileTab />;
      case 1:
        return <ExperienceTab />;
      case 2:
        return <EducationTab />;
      case 3:
        return <SkillsTab />;
      case 4:
        return <ProjectsTab />;
      case 5:
        return <PreferencesTab />;
      case 6:
        return <LinksTab />;
      case 7:
        return <ReviewTab />;
      default:
        return null;
    }
  };

  return (
    <PageContainer sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      {fromRegister && (
        <Box sx={{ mb: 2 }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/', { replace: true })}
            sx={{
              fontSize: 'var(--font-size-helper)',
              color: 'var(--primary)',
              fontWeight: 600,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            ← Continue to Dashboard
          </Link>
        </Box>
      )}
      <Box sx={{ mb: 4 }}>
        <Box component="h1" sx={{ display: 'block', fontSize: 'var(--font-size-page-title)', fontWeight: 700, color: 'var(--text-primary)', mb: 0.5 }}>
          Profile Builder
        </Box>
        <Box component="p" sx={{ display: 'block', m: 0, fontSize: 'var(--font-size-page-subtitle)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Complete your profile across all tabs. Fields marked are used for ATS matching.
        </Box>
      </Box>

      <Box
        sx={{
          border: '1px solid var(--border-color)',
          borderRadius: 2,
          bgcolor: 'var(--bg-paper)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          mb: 3,
          overflow: 'hidden',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            px: { xs: 1, sm: 2 },
            minHeight: 52,
            borderBottom: '1px solid var(--border-color)',
            '& .MuiTab-root': { minHeight: 52, textTransform: 'none', fontWeight: 600, fontSize: 'var(--font-size-tab)' },
          }}
        >
          {TAB_LABELS.map((label, idx) => (
            <Tab key={idx} label={label} id={`profile-tab-${idx}`} aria-controls={`profile-tabpanel-${idx}`} />
          ))}
        </Tabs>

        <Box
          role="tabpanel"
          id={`profile-tabpanel-${activeTab}`}
          aria-labelledby={`profile-tab-${activeTab}`}
          sx={{ p: { xs: 2, sm: 3 } }}
        >
          {renderTabPanel(activeTab)}
        </Box>
      </Box>
    </PageContainer>
  );
}
