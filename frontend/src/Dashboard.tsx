import * as React from 'react';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import SouthEastIcon from '@mui/icons-material/SouthEast';
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { usePermissions } from 'react-admin';
import CardWithIcon from './CardWithIcon';
import { dashboardActions, getStoredRoles, hasAnyRole } from './adminShell';

const dashboardStats = [
  {
    title: 'Core register',
    value: 'Taxon names',
    description: 'Manage scientific names, hierarchy, and related references.',
    icon: <AutoStoriesOutlinedIcon />,
  },
  {
    title: 'Reference library',
    value: 'Publications',
    description: 'Keep publications, authors, and citations consistent.',
    icon: <DescriptionOutlinedIcon />,
  },
  {
    title: 'Status mapping',
    value: 'Conservation',
    description: 'Track codes and their relationships to taxonomy.',
    icon: <HubOutlinedIcon />,
  },
  {
    title: 'Access control',
    value: 'Users',
    description: 'Role-based administration for Nomos operators.',
    icon: <ManageAccountsOutlinedIcon />,
  },
];

const Dashboard = () => {
  const { isLoading } = usePermissions();
  const roles = getStoredRoles();

  if (isLoading) {
    return null;
  }

  const visibleActions = dashboardActions.filter((action) =>
    hasAnyRole(roles, action.roles)
  );

  return (
    <Container
      maxWidth={false}
      sx={{ py: { xs: 2, md: 3 }, px: { xs: 0, md: 1 } }}
    >
      <Stack spacing={3}>
        <Paper
          elevation={0}
          sx={{
            overflow: 'hidden',
            borderRadius: '28px',
            border: '1px solid',
            borderColor: 'divider',
            background:
              'radial-gradient(circle at top left, rgba(255,255,255,0.24), transparent 35%), linear-gradient(135deg, #111827 0%, #1f2937 55%, #374151 100%)',
            color: 'common.white',
            p: { xs: 3, md: 4 },
          }}
        >
          <Stack spacing={2.5}>
            <Chip
              label="Shadcn-style admin shell"
              size="small"
              sx={{
                alignSelf: 'flex-start',
                color: 'common.white',
                bgcolor: 'rgba(255,255,255,0.12)',
                borderRadius: '999px',
              }}
            />
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                Welcome to Nomos
              </Typography>
              <Typography
                variant="body1"
                sx={{ maxWidth: 760, color: 'rgba(255,255,255,0.76)' }}
              >
                A cleaner operations view for taxonomy management, publication
                maintenance, and role-based administration.
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                href="/#/taxon_names"
                variant="contained"
                endIcon={<SouthEastIcon />}
                sx={{
                  bgcolor: 'common.white',
                  color: '#111827',
                  '&:hover': { bgcolor: '#f3f4f6' },
                }}
              >
                Open register
              </Button>
              <Button
                href="/#/publications"
                variant="outlined"
                sx={{
                  borderColor: 'rgba(255,255,255,0.24)',
                  color: 'common.white',
                }}
              >
                Browse publications
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Grid container spacing={2}>
          {dashboardStats.map((stat) => (
            <Grid key={stat.title} item xs={12} sm={6} xl={3}>
              <Paper
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: '22px',
                  border: '1px solid',
                  borderColor: 'divider',
                  p: 2.5,
                }}
              >
                <Stack spacing={1.5}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '14px',
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: '#f4f4f5',
                      color: '#18181b',
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography variant="overline" color="text.secondary">
                    {stat.title}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.description}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Quick actions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Shortcuts are filtered by your current Nomos role.
          </Typography>
          <Grid container spacing={2}>
            {visibleActions.map((action) => (
              <Grid key={action.to} item xs={12} md={6} xl={4}>
                <CardWithIcon
                  icon={<SouthEastIcon fontSize="large" />}
                  to={action.to}
                  title={action.title}
                  subtitle={action.description}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Stack>
    </Container>
  );
};

export default Dashboard;
