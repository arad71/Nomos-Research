import * as React from 'react';
import { Menu as RaMenu, usePermissions } from 'react-admin';
import BookIcon from '@mui/icons-material/Book';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
// eslint-disable-next-line max-len
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

const Menu = () => {
  const { isLoading } = usePermissions();
  const roles = (localStorage.getItem('scopes') || '')
    .split(',')
    .map((role) => role.trim())
    .filter(Boolean);
  const hasRole = (role: string) => roles.includes(role);
  if (isLoading) return null;

  return (
    <RaMenu>
      <RaMenu.Item
        to="/"
        primaryText="Dashboard"
        leftIcon={<DashboardIcon />}
      />

      <RaMenu.Item
        to="/taxon_names"
        primaryText="Taxon Names"
        leftIcon={<BookIcon />}
      />
      <RaMenu.Item
        to="/publications"
        primaryText="Publications"
        leftIcon={<SubjectIcon />}
      />
      <RaMenu.Item
        to="/authors"
        primaryText="Authors"
        leftIcon={<PeopleIcon />}
      />
      <RaMenu.Item
        to="/taxon_names_code"
        primaryText="Conservation Status (S&C)"
        leftIcon={<TrafficIcon />}
      />
      <RaMenu.Item
        to="/citations"
        primaryText="Citations"
        leftIcon={<MenuBookIcon />}
      />
      <RaMenu.Item
        to="/classification_systems"
        primaryText="Classification Types"
        leftIcon={<FiberManualRecordOutlinedIcon />}
      />
      <RaMenu.Item
        to="/hierarchies"
        primaryText="Hierarchies"
        leftIcon={<ChangeHistoryIcon />}
      />
      <RaMenu.Item
        to="/informal_groups"
        primaryText="Informal Groups"
        leftIcon={<LinkIcon />}
      />
      <RaMenu.Item
        to="/conscode_taxons"
        primaryText="Cons code - Taxonomy"
        leftIcon={<ReportIcon />}
      />
      <RaMenu.Item
        to="/conservation_codes"
        primaryText="Conservation codes"
        leftIcon={<ReportProblemIcon />}
      />
      <RaMenu.Item
        to="/kingdoms"
        primaryText="Kingdoms"
        leftIcon={<FiberManualRecordIcon />}
      />
      <RaMenu.Item
        to="/cross_references"
        primaryText="Related Names"
        leftIcon={<CompareArrowsIcon />}
      />
      <RaMenu.Item
        to="/taxon_ranks"
        primaryText="Taxon Ranks"
        leftIcon={<GroupWorkIcon />}
      />
      {hasRole('SUPER_ADMIN') || hasRole('APPLICATION_SUPPORT') ? (
        <RaMenu.Item
          to="/users"
          primaryText="Users"
          leftIcon={<PeopleIcon />}
        />
      ) : null}
      <RaMenu.Item
        to="/vernaculars"
        primaryText="Vernacular Names"
        leftIcon={<CallSplitIcon />}
      />
    </RaMenu>
  );
};

export default Menu;
