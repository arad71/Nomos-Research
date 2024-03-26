import * as React from 'react';
import { MultiLevelMenu, MenuItem } from '@react-admin/ra-navigation';
import BookIcon from '@material-ui/icons/Book';
import DashboardIcon from '@material-ui/icons/Dashboard';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
// eslint-disable-next-line max-len
import FiberManualRecordOutlinedIcon from '@material-ui/icons/FiberManualRecordOutlined';
import PeopleIcon from '@material-ui/icons/People';
import SubjectIcon from '@material-ui/icons/Subject';
import CompareArrowsIcon from '@material-ui/icons/CompareArrows';
import CallSplitIcon from '@material-ui/icons/CallSplit';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import ChangeHistoryIcon from '@material-ui/icons/ChangeHistory';
import TrafficIcon from '@material-ui/icons/Traffic';
import ReportProblemIcon from '@material-ui/icons/ReportProblem';
import WebIcon from '@material-ui/icons/Web';
import SettingsIcon from '@material-ui/icons/Settings';
import GroupWorkIcon from '@material-ui/icons/GroupWork';
import LinkIcon from '@material-ui/icons/Link';
import ReportIcon from '@material-ui/icons/Report';
import { usePermissions } from 'react-admin';
const Menu = () => {
  const { loaded, permissions } = usePermissions();
  return loaded ? (
    <MultiLevelMenu initialOpen>
      <MenuItem
        name="Dashboard"
        label="Dashboard"
        icon={<DashboardIcon />}
        style={{
          fontWeight: '500',
        }}
        to="/"
      />
      <MenuItem
        name="Nomos"
        label="Nomos"
        style={{
          fontWeight: '500',
          borderTop: '1px solid #999',
          borderBottom: '1px solid #ccc',
        }}
        icon={<WebIcon />}
      >
        {permissions?.roles !== undefined ? (
          <MenuItem
            name="Taxon Names"
            label="Taxon Names"
            icon={<BookIcon />}
            to="/taxon_names"
          />
        ) : (
          ''
        )}
        {permissions?.roles !== undefined ? (
          <MenuItem
            name="Publications"
            label="Publications"
            to="/publications"
            icon={<SubjectIcon />}
          />
        ) : (
          ''
        )}
        {permissions?.roles !== undefined ? (
          <MenuItem
            name="Authors"
            label="Authors"
            icon={<PeopleIcon />}
            to="/authors"
          />
        ) : (
          ''
        )}
        {permissions?.roles !== undefined ? (
          <MenuItem
            name="Taxon Names Code"
            label="Conservation Status (S&C)"
            icon={<TrafficIcon />}
            to="/taxon_names_code"
          />
        ) : (
          ''
        )}
      </MenuItem>
      <MenuItem
        name="Admin"
        label="Admin"
        style={{
          fontWeight: '500',
          borderTop: '1px solid #999',
          borderBottom: '1px solid #ccc',
        }}
        icon={<SettingsIcon />}
      >
        {permissions?.roles !== undefined ? (
          <MenuItem
            name="Citations"
            label="Citations"
            icon={<MenuBookIcon />}
            to="/citations"
          />
        ) : (
          ''
        )}
        {permissions?.roles !== undefined ? (
          <MenuItem
            name="Classification Systems"
            label="Classification Types"
            icon={<FiberManualRecordOutlinedIcon />}
            to="/classification_systems"
          />
        ) : (
          ''
        )}
        {permissions?.roles !== undefined ? (
          <MenuItem
            name="Hierarchies"
            label="Hierarchies"
            to="/hierarchies"
            icon={<ChangeHistoryIcon />}
          />
        ) : (
          ''
        )}
        {permissions?.roles !== undefined ? (
          <MenuItem
            name="Informal Groups"
            label="Informal Groups"
            to="/informal_groups"
            icon={<LinkIcon />}
          />
        ) : (
          ''
        )}
        {permissions?.roles !== undefined ? (
          <MenuItem
            name="Cons code taxon"
            label="Cons code - Taxonomy"
            to="/conscode_taxons"
            icon={<ReportIcon />}
          />
        ) : (
          ''
        )}
        {permissions?.roles !== undefined ? (
          <MenuItem
            name="Conservation codes"
            label="Conservation codes"
            to="/conservation_codes"
            icon={<ReportProblemIcon />}
          />
        ) : (
          ''
        )}
        {permissions?.roles !== undefined ? (
          <MenuItem
            name="Kingdoms"
            label="Kingdoms"
            icon={<FiberManualRecordIcon />}
            to="/kingdoms"
          />
        ) : (
          ''
        )}
        {permissions?.roles !== undefined ? (
          <MenuItem
            name="Related Names"
            label="Related Names"
            icon={<CompareArrowsIcon />}
            to="/cross_references"
          />
        ) : (
          ''
        )}
        {permissions?.roles !== undefined ? (
          <MenuItem
            name="Taxon Ranks"
            label="Taxon Ranks"
            to="/taxon_ranks"
            icon={<GroupWorkIcon />}
          />
        ) : (
          ''
        )}
        {permissions?.roles.includes('SUPER_ADMIN') ||
        permissions?.roles.includes('APPLICATION_SUPPORT') ? (
          <MenuItem
            name="Users"
            label="Users"
            icon={<PeopleIcon />}
            to="/users"
          />
        ) : (
          ''
        )}
        {permissions?.roles !== undefined ? (
          <MenuItem
            name="Vernacular Names"
            label="Vernacular Names"
            to="/vernaculars"
            icon={<CallSplitIcon />}
          />
        ) : (
          ''
        )}
      </MenuItem>
    </MultiLevelMenu>
  ) : (
    ''
  );
};

export default Menu;
