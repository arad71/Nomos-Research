import type { ReactElement } from 'react';
import BookIcon from '@mui/icons-material/Book';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import FiberManualRecordOutlinedIcon from '@mui/icons-material/FiberManualRecordOutlined';
import PeopleIcon from '@mui/icons-material/People';
import SubjectIcon from '@mui/icons-material/Subject';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ChangeHistoryIcon from '@mui/icons-material/ChangeHistory';
import TrafficIcon from '@mui/icons-material/Traffic';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import LinkIcon from '@mui/icons-material/Link';
import ReportIcon from '@mui/icons-material/Report';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';

export interface AdminNavItem {
  to: string;
  label: string;
  icon: ReactElement;
  roles?: string[];
  resource?: string;
  action?: string;
}

export interface AdminNavSection {
  label: string;
  items: AdminNavItem[];
}

export const getStoredRoles = (): string[] =>
  (localStorage.getItem('scopes') || '')
    .split(',')
    .map((role) => role.trim())
    .filter(Boolean);

export const hasAnyRole = (roles: string[], allowedRoles?: string[]) =>
  !allowedRoles || allowedRoles.some((role) => roles.includes(role));

export const adminNavSections: AdminNavSection[] = [
  {
    label: 'Overview',
    items: [
      {
        to: '/',
        label: 'Dashboard',
        icon: <DashboardIcon fontSize="small" />,
      },
    ],
  },
  {
    label: 'Taxonomy',
    items: [
      {
        to: '/taxon_names',
        label: 'Taxon Names',
        icon: <BookIcon fontSize="small" />,
        resource: 'taxon_names',
        action: 'list',
      },
      {
        to: '/vernaculars',
        label: 'Vernacular Names',
        icon: <CallSplitIcon fontSize="small" />,
        resource: 'vernaculars',
        action: 'list',
      },
      {
        to: '/hierarchies',
        label: 'Hierarchies',
        icon: <ChangeHistoryIcon fontSize="small" />,
        resource: 'hierarchies',
        action: 'list',
      },
      {
        to: '/cross_references',
        label: 'Related Names',
        icon: <CompareArrowsIcon fontSize="small" />,
        resource: 'cross_references',
        action: 'list',
      },
      {
        to: '/taxon_ranks',
        label: 'Taxon Ranks',
        icon: <GroupWorkIcon fontSize="small" />,
        resource: 'taxon_ranks',
        action: 'list',
      },
      {
        to: '/kingdoms',
        label: 'Kingdoms',
        icon: <FiberManualRecordIcon fontSize="small" />,
        resource: 'kingdoms',
        action: 'list',
      },
      {
        to: '/classification_systems',
        label: 'Classification Types',
        icon: <FiberManualRecordOutlinedIcon fontSize="small" />,
        resource: 'classification_systems',
        action: 'list',
      },
      {
        to: '/informal_groups',
        label: 'Informal Groups',
        icon: <LinkIcon fontSize="small" />,
        resource: 'informal_groups',
        action: 'list',
      },
    ],
  },
  {
    label: 'References',
    items: [
      {
        to: '/publications',
        label: 'Publications',
        icon: <SubjectIcon fontSize="small" />,
        resource: 'publications',
        action: 'list',
      },
      {
        to: '/authors',
        label: 'Authors',
        icon: <PeopleIcon fontSize="small" />,
        resource: 'authors',
        action: 'list',
      },
      {
        to: '/citations',
        label: 'Citations',
        icon: <MenuBookIcon fontSize="small" />,
        resource: 'citations',
        action: 'list',
      },
    ],
  },
  {
    label: 'Status',
    items: [
      {
        to: '/taxon_names_code',
        label: 'Conservation Status (S&C)',
        icon: <TrafficIcon fontSize="small" />,
        resource: 'taxon_names',
        action: 'list',
      },
      {
        to: '/conservation_codes',
        label: 'Conservation Codes',
        icon: <ReportProblemIcon fontSize="small" />,
        resource: 'conservation_codes',
        action: 'list',
      },
      {
        to: '/conscode_taxons',
        label: 'Cons Code - Taxonomy',
        icon: <ReportIcon fontSize="small" />,
        resource: 'conscode_taxons',
        action: 'list',
      },
    ],
  },
  {
    label: 'Administration',
    items: [
      {
        to: '/users',
        label: 'Users',
        icon: <ShieldOutlinedIcon fontSize="small" />,
        roles: ['SUPER_ADMIN', 'APPLICATION_SUPPORT'],
        resource: 'users',
        action: 'list',
      },
    ],
  },
];

export interface DashboardAction {
  title: string;
  description: string;
  to: string;
  roles?: string[];
  resource?: string;
  action?: string;
}

export const dashboardActions: DashboardAction[] = [
  {
    title: 'Review taxon names',
    description: 'Browse and maintain the core register.',
    to: '/taxon_names',
    roles: ['SUPER_ADMIN', 'APPLICATION_SUPPORT', 'MANAGER', 'OFFICER', 'READER'],
    resource: 'taxon_names',
    action: 'list',
  },
  {
    title: 'Create a taxon name',
    description: 'Add a new scientific name record.',
    to: '/taxon_names/create',
    roles: ['SUPER_ADMIN', 'APPLICATION_SUPPORT', 'MANAGER', 'OFFICER'],
    resource: 'taxon_names',
    action: 'create',
  },
  {
    title: 'Create a publication',
    description: 'Register a publication before linking citations.',
    to: '/publications/create',
    roles: ['SUPER_ADMIN', 'APPLICATION_SUPPORT', 'MANAGER'],
    resource: 'publications',
    action: 'create',
  },
  {
    title: 'Create an author',
    description: 'Add a new author identity to reuse across names.',
    to: '/authors/create',
    roles: ['SUPER_ADMIN', 'APPLICATION_SUPPORT', 'MANAGER', 'OFFICER'],
    resource: 'authors',
    action: 'create',
  },
  {
    title: 'Assign conservation status',
    description: 'Link conservation data to a taxon name.',
    to: '/conscode_taxons/create',
    roles: ['SUPER_ADMIN', 'APPLICATION_SUPPORT', 'MANAGER', 'OFFICER'],
    resource: 'conscode_taxons',
    action: 'create',
  },
  {
    title: 'Manage users',
    description: 'Invite or update administrative access.',
    to: '/users/create',
    roles: ['SUPER_ADMIN', 'APPLICATION_SUPPORT'],
    resource: 'users',
    action: 'create',
  },
];
