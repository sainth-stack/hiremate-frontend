import React from 'react';
import { Box, Typography, Button, IconButton, InputBase, TextField, Chip, Tabs, Tab, Tooltip, FormControlLabel, Switch, FormControl, ToggleButtonGroup, ToggleButton, Card } from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import DriveFileRenameOutlineRoundedIcon from '@mui/icons-material/DriveFileRenameOutlineRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import FitScreenRoundedIcon from '@mui/icons-material/FitScreenRounded';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import GetAppRoundedIcon from '@mui/icons-material/GetAppRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import SubjectRoundedIcon from '@mui/icons-material/SubjectRounded';
import CircularProgress from '@mui/material/CircularProgress';
import CustomizationPanel from './CustomizationPanel';
import ContentSectionsEditor from './ContentSectionsEditor';
import { RESUME_STUDIO_THEME as T } from '../../../utilities/resumeStudioTheme';
import { CHROME_EXTENSION_WEBSTORE_URL } from '../../../utilities/const';

const toolbarBtnSecondary = {
  height: 36,
  minHeight: 36,
  textTransform: 'none',
  fontFamily: 'var(--font-family)',
  fontSize: '0.8125rem',
  fontWeight: 600,
  borderRadius: 1,
  px: 1.75,
  color: T.textPrimary,
  borderColor: T.mutedBorder,
  bgcolor: T.surface,
  '&:hover': { bgcolor: 'rgba(248, 250, 252, 0.95)', borderColor: 'rgba(51, 94, 222, 0.35)' },
};

export default function EditorPanel({
  activeTab,
  setActiveTab,
  selectedResume,
  jobDescription,
  jobRole,
  profile,
  setProfile,
  designConfig,
  templates,
  extensionBannerDismissed,
  downloading,
  tailoring,
  goToInput,
  confirmDelete,
  handleGenerateNew,
  handleAutoFit,
  handleDownload,
  handleSaveAndUse,
  handleSave,
  isSaving,
  resumeTitleValue,
  setResumeTitleValue,
  isTitleEditing,
  setIsTitleEditing,
  handleRenameResume,
  setJdDialogMode,
  setShowJdUploadDialog,
  scheduleProfilePatch,
  handleDesignChange,
  handleSectionsOrderChange,
  setExtensionBannerDismissedAndStore,
  handleTailorMore,
  selectedResumeId,
}) {
  const handleOpenExtensionStore = () => {
    window.open(CHROME_EXTENSION_WEBSTORE_URL, '_blank', 'noopener,noreferrer');
    setExtensionBannerDismissedAndStore(true);
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRight: `1px solid ${T.border}`,
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
        bgcolor: T.pageBg,
        overflow: 'hidden',
        zIndex: 2,
        position: 'relative',
      }}
    >
      <Box
        sx={{
          px: { xs: 1.5, sm: 2 },
          pt: 1.25,
          pb: 1,
          borderBottom: `1px solid ${T.border}`,
          bgcolor: T.surface,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
            <Button
              startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 15 }} />}
              onClick={goToInput}
              size="small"
              sx={{
                textTransform: 'none',
                fontFamily: 'var(--font-family)',
                color: T.textSecondary,
                fontWeight: 600,
                px: 0.75,
                minWidth: 0,
                fontSize: '0.8125rem',
                '&:hover': { bgcolor: T.primarySoft, color: T.primary },
              }}
            >
              Documents
            </Button>
            <ChevronRightRoundedIcon sx={{ fontSize: 14, color: T.border, flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.8125rem', color: T.textPrimary, fontFamily: 'var(--font-family)', fontWeight: 600 }} noWrap>
              Resume editor
            </Typography>
          </Box>
          {selectedResume && (
            <Tooltip title="Delete this resume">
              <IconButton
                size="small"
                onClick={() => confirmDelete(selectedResume)}
                sx={{ color: T.textSecondary, borderRadius: 1, '&:hover': { color: 'error.main', bgcolor: 'rgba(211, 47, 47, 0.06)' } }}
              >
                <DeleteOutlinedIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          <Tooltip title="Create a new resume">
            <Button
              variant="outlined"
              size="small"
              disableElevation
              startIcon={<AddRoundedIcon sx={{ fontSize: '16px !important' }} />}
              onClick={handleGenerateNew}
              sx={{ ...toolbarBtnSecondary }}
            >
              New
            </Button>
          </Tooltip>
          <Tooltip title={selectedResume ? 'Save changes' : 'Save as new resume'}>
            <Button
              variant="outlined"
              size="small"
              disableElevation
              startIcon={isSaving ? <CircularProgress size={14} sx={{ color: T.primary }} /> : <SaveRoundedIcon sx={{ fontSize: '16px !important' }} />}
              onClick={handleSave}
              disabled={isSaving}
              sx={{ ...toolbarBtnSecondary }}
            >
              {isSaving ? 'Saving…' : 'Save'}
            </Button>
          </Tooltip>
          <Tooltip title={
            designConfig.target_page_count === 'auto' || designConfig.target_page_count == null
              ? 'Auto-fit typography to natural page count'
              : `Auto-fit typography to ${designConfig.target_page_count} page${designConfig.target_page_count === 1 ? '' : 's'}`
          }>
            <Button
              variant="outlined"
              size="small"
              disableElevation
              startIcon={<FitScreenRoundedIcon sx={{ fontSize: '16px !important' }} />}
              onClick={handleAutoFit}
              sx={{ ...toolbarBtnSecondary }}
            >
              Fit Page
            </Button>
          </Tooltip>

          <Box sx={{ flex: 1, minWidth: 8 }} />

          <Tooltip title="Download PDF">
            <Button
              variant="outlined"
              size="small"
              disableElevation
              startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: '16px !important' }} />}
              onClick={handleDownload}
              disabled={downloading}
              sx={{ ...toolbarBtnSecondary }}
            >
              {downloading ? 'Generating…' : 'Download'}
            </Button>
          </Tooltip>
          {selectedResume ? (
            <Button
              variant="contained"
              size="small"
              disableElevation
              startIcon={<GetAppRoundedIcon sx={{ fontSize: '16px !important' }} />}
              onClick={handleSaveAndUse}
              disabled={downloading}
              sx={{
                height: 36,
                minHeight: 36,
                bgcolor: T.primary,
                textTransform: 'none',
                fontWeight: 600,
                fontFamily: 'var(--font-family)',
                borderRadius: 1,
                fontSize: '0.8125rem',
                px: 2,
                whiteSpace: 'nowrap',
                boxShadow: 'none',
                '&:hover': { bgcolor: T.primaryDark, boxShadow: 'none' },
              }}
            >
              Save & Use
            </Button>
          ) : (
            <Button
              variant="contained"
              size="small"
              disableElevation
              startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: '16px !important' }} />}
              onClick={() => { setJdDialogMode('add'); setShowJdUploadDialog(true); }}
              sx={{
                height: 36,
                minHeight: 36,
                bgcolor: T.primary,
                textTransform: 'none',
                fontWeight: 600,
                fontFamily: 'var(--font-family)',
                borderRadius: 1,
                fontSize: '0.8125rem',
                px: 2,
                whiteSpace: 'nowrap',
                boxShadow: 'none',
                '&:hover': { bgcolor: T.primaryDark, boxShadow: 'none' },
              }}
            >
              Tailor to Job
            </Button>
          )}
        </Box>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{
          borderBottom: `1px solid ${T.border}`,
          bgcolor: T.surface,
          px: { xs: 1.5, sm: 2 },
          minHeight: 44,
          flexShrink: 0,
          '& .MuiTab-root': {
            minHeight: 44,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
            fontFamily: 'var(--font-family)',
            color: T.textSecondary,
          },
          '& .Mui-selected': { color: `${T.primary} !important` },
          '& .MuiTabs-indicator': { bgcolor: T.primary, height: 3 },
        }}
      >
        <Tab icon={<EditNoteRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Edit Content" value="content" />
        <Tab icon={<PaletteRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Edit Design" value="design" />
      </Tabs>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          bgcolor: T.surface,
          minHeight: 0,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'var(--bg-light)',
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'var(--border-hover)',
            borderRadius: '4px',
            '&:hover': {
              bgcolor: 'var(--text-muted)',
            },
          },
        }}
      >
        {activeTab === 'content' && (
          <Box sx={{ px: 4, py: 2, width: '100%', boxSizing: 'border-box' }}>
            {!selectedResume && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip
                  label="Profile Preview"
                  size="small"
                  sx={{ bgcolor: T.primarySoft, color: T.primary, fontWeight: 700, fontSize: '0.7rem', height: 22, '& .MuiChip-label': { px: 1 } }}
                />
                <Typography sx={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-family)' }}>
                  Live preview from your profile
                </Typography>
              </Box>
            )}
            {/* Resume title row — editable inline */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5, minWidth: 0 }}>
              {isTitleEditing ? (
                <>
                  <InputBase
                    autoFocus
                    value={resumeTitleValue}
                    onChange={(e) => setResumeTitleValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameResume(resumeTitleValue);
                      if (e.key === 'Escape') setIsTitleEditing(false);
                    }}
                    sx={{
                      flex: 1,
                      fontFamily: 'var(--font-family)',
                      fontWeight: 600,
                      fontSize: '0.9375rem',
                      color: T.textPrimary,
                      border: `1.5px solid ${T.primary}`,
                      borderRadius: 1,
                      px: 1,
                      py: 0.25,
                      bgcolor: T.primarySoft,
                      minWidth: 0,
                    }}
                  />
                  <Tooltip title="Save name">
                    <IconButton size="small" onClick={() => handleRenameResume(resumeTitleValue)} sx={{ color: 'var(--success)', p: 0.5 }}>
                      <CheckRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Cancel">
                    <IconButton size="small" onClick={() => setIsTitleEditing(false)} sx={{ color: 'var(--text-muted)', p: 0.5 }}>
                      <CloseRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Tooltip title={resumeTitleValue || ''} placement="bottom-start">
                    <Typography
                      noWrap
                      sx={{ fontFamily: 'var(--font-family)', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      {resumeTitleValue}
                    </Typography>
                  </Tooltip>
                  <Tooltip title="Rename resume">
                    <IconButton size="small" onClick={() => setIsTitleEditing(true)} sx={{ color: T.textSecondary, p: 0.375, flexShrink: 0, '&:hover': { color: T.primary, bgcolor: T.primarySoft } }}>
                      <DriveFileRenameOutlineRoundedIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>

            {jobDescription?.trim() ? (
              <Box sx={{ p: 1.5, bgcolor: 'var(--light-blue-bg)', borderRadius: 1.5, mb: 3, border: '1px solid rgba(51, 94, 222, 0.12)' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.25 }}>
                  <CheckCircleRoundedIcon sx={{ color: 'var(--primary)', fontSize: 20, mt: '2px', flexShrink: 0 }} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" color="var(--text-muted)" sx={{ fontFamily: 'var(--font-family)', display: 'block', lineHeight: 1.3 }}>
                      Resume tailored to job
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'var(--font-family)',
                        fontWeight: 600,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.4,
                      }}
                    >
                      {jobRole || 'Software Engineer'}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => { setJdDialogMode('add'); setShowJdUploadDialog(true); }}
                    sx={{ fontFamily: 'var(--font-family)', textTransform: 'none', flex: 1, fontSize: '0.75rem', py: 0.5 }}
                  >
                    Edit JD
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={tailoring ? <CircularProgress size={12} sx={{ color: 'white' }} /> : <AutoFixHighRoundedIcon sx={{ fontSize: '14px !important' }} />}
                    onClick={handleTailorMore}
                    disabled={tailoring || !jobDescription?.trim()}
                    sx={{ fontFamily: 'var(--font-family)', textTransform: 'none', bgcolor: 'var(--primary)', flex: 2, fontSize: '0.75rem', py: 0.5 }}
                  >
                    {tailoring ? 'Tailoring…' : 'Tailor More ✨'}
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box
                onClick={() => { setJdDialogMode('add'); setShowJdUploadDialog(true); }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.75,
                  mb: 3,
                  borderRadius: 2,
                  border: `1.5px dashed rgba(51, 94, 222, 0.35)`,
                  bgcolor: T.primarySoft,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  '&:hover': {
                    borderColor: 'rgba(51, 94, 222, 0.55)',
                    bgcolor: 'rgba(51, 94, 222, 0.12)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 16px rgba(51, 94, 222, 0.12)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    flexShrink: 0,
                    bgcolor: T.surface,
                    border: `1px solid ${T.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AutoAwesomeRoundedIcon sx={{ color: T.primary, fontSize: 20 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontFamily: 'var(--font-family)', fontWeight: 700, fontSize: '0.875rem', color: T.textPrimary, lineHeight: 1.3 }}>
                    Tailor to a Job
                  </Typography>
                  <Typography sx={{ fontFamily: 'var(--font-family)', fontSize: '0.775rem', color: T.textSecondary, lineHeight: 1.4 }}>
                    Add a JD — AI rewrites your resume to maximize keyword match
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.25, py: 0.625, borderRadius: 1, bgcolor: T.primary, flexShrink: 0 }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'white', fontFamily: 'var(--font-family)', whiteSpace: 'nowrap' }}>Add JD</Typography>
                  <ChevronRightRoundedIcon sx={{ color: 'white', fontSize: 14 }} />
                </Box>
              </Box>
            )}
            <ContentSectionsEditor
              profile={profile}
              setProfile={setProfile}
              designConfig={designConfig}
              handleDesignChange={handleDesignChange}
              scheduleProfilePatch={scheduleProfilePatch}
              selectedResumeId={selectedResumeId}
            />
          </Box>
        )}
        {activeTab === 'design' && (
          <CustomizationPanel
            designConfig={designConfig}
            onDesignChange={handleDesignChange}
            templates={templates}
            onSectionsOrderChange={handleSectionsOrderChange}
            customSections={profile.customSections || []}
          />
        )}
      </Box>
      {!extensionBannerDismissed && (
        <Box sx={{ px: 2, py: 2, borderTop: `1px solid ${T.border}`, bgcolor: T.surface, flexShrink: 0 }}>
          <Button
            size="small"
            onClick={handleOpenExtensionStore}
            sx={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'none', fontFamily: 'var(--font-family)', minWidth: 0, '&:hover': { color: 'var(--text-secondary)', bgcolor: 'transparent' } }}
          >
            Install Chrome Extension
          </Button>
        </Box>
      )}
    </Box>
  );
}
