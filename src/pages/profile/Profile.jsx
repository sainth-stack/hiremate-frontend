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
    <PageContainer>
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
      <Box component="span" sx={{ display: 'block', fontSize: 'var(--font-size-page-title)', fontWeight: 600, mb: 1 }}>
        Profile Builder
      </Box>
      <Box component="span" sx={{ display: 'block', mb: 3, fontSize: 'var(--font-size-page-subtitle)', color: 'text.secondary' }}>
        Complete your profile across all tabs. Fields marked are used for ATS matching.
      </Box>

      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'var(--border-color)',
          mb: 3,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            '& .MuiTab-root': { minHeight: 48, textTransform: 'none', fontWeight: 600, fontSize: 'var(--font-size-tab)' },
          }}
        >
          {TAB_LABELS.map((label, idx) => (
            <Tab key={idx} label={label} id={`profile-tab-${idx}`} aria-controls={`profile-tabpanel-${idx}`} />
          ))}
        </Tabs>
      </Box>

      <Box
        role="tabpanel"
        id={`profile-tabpanel-${activeTab}`}
        aria-labelledby={`profile-tab-${activeTab}`}
      >
        {renderTabPanel(activeTab)}
      </Box>
    </PageContainer>
  );
}
