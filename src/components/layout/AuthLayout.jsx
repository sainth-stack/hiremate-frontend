import { Outlet } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import profileImg from '../../assets/profile.png';
import logoImg from '../../assets/logo.png';

export default function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
      }}
    >
      {/* Left panel - marketing */}
      <Box
        sx={{
          flex: { md: '0 0 50%' },
          background: 'linear-gradient(160deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)',
          py: 4,
          px: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            component="img"
            src={logoImg}
            alt="OpsBrain"
            sx={{ height: 40, objectFit: 'contain' }}
          />
          <Box>
          </Box>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#1e40af',
              lineHeight: 1.2,
              mb: 1,
            }}
          >
            Apply to jobs in 1-click.
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#1e40af',
              lineHeight: 1.2,
              mb: 1,
            }}
          >
            Power your entire job search,
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#1e40af',
              lineHeight: 1.2,
              mb: 2,
            }}
          >
            with our recruiter-approved AI.
          </Typography>
          <Typography sx={{ color: '#1e40af', fontSize: '0.9375rem', mb: 1, opacity: 0.95 }}>
            Browse handpicked jobs from the best companies
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex' }}>
              {[1, 2, 3, 4].map((i) => (
                <Box
                  key={i}
                  component="img"
                  src={profileImg}
                  alt="Profile"
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #dbeafe',
                    ml: i > 1 ? -1.2 : 0,
                  }}
                />
              ))}
            </Box>
            <Typography sx={{ color: '#1e40af', fontSize: '0.875rem', opacity: 0.95 }}>
              Trusted by 1,000,000+ job seekers.
            </Typography>
          </Box>
        </Box>
        {/* <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 1.5,
          }}
        >
          {companyLogos.map((name) => (
            <Box
              key={name}
              sx={{
                bgcolor: '#fff',
                borderRadius: 2,
                py: 1.5,
                px: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#475569',
                boxShadow: '0 1px 2px rgba(29, 78, 216, 0.06)',
              }}
            >
              {name}
            </Box>
          ))}
        </Box> */}
      </Box>

      {/* Right panel - form */}
      <Box
        sx={{
          flex: { md: '0 0 50%' },
          bgcolor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          px: { xs: 2, sm: 4 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
