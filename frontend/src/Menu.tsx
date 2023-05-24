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
import GroupWorkIcon from '@material-ui/icons/GroupWork';
import LinkIcon from '@material-ui/icons/Link';
import { WithPermissions } from '@react-admin/ra-rbac';
const Menu = () => {
  return (
    <MultiLevelMenu initialOpen>
      <MenuItem
        name="Dashboard"
        label="Dashboard"
        icon={<DashboardIcon />}
        to="/"
      />
      <MenuItem name="Nomos" label="Nomos">
        <WithPermissions resource="taxon_names" action="list">
          <MenuItem
            name="Taxon Names"
            label="Taxon Names"
            icon={<BookIcon />}
            to="/taxon_names"
          />
        </WithPermissions>
        <WithPermissions resource="publications" action="list">
          <MenuItem
            name="Publications"
            label="Publications"
            to="/publications"
            icon={<SubjectIcon />}
          />
        </WithPermissions>
        <WithPermissions resource="authors" action="list">
          <MenuItem
            name="Authors"
            label="Authors"
            icon={<PeopleIcon />}
            to="/authors"
          />
        </WithPermissions>
      </MenuItem>
      <MenuItem name="Admin" label="Admin">
        <WithPermissions resource="citations" action="list">
          <MenuItem
            name="Citations"
            label="Citations"
            icon={<MenuBookIcon />}
            to="/citations"
          />
        </WithPermissions>
        <WithPermissions action="list" resource="classification_systems">
          <MenuItem
            name="Classification Systems"
            label="Classification Types"
            icon={<FiberManualRecordOutlinedIcon />}
            to="/classification_systems"
          />
        </WithPermissions>
        <WithPermissions action="list" resource="hierarchies">
          <MenuItem
            name="Hierarchies"
            label="Hierarchies"
            to="/hierarchies"
            icon={<ChangeHistoryIcon />}
          />
        </WithPermissions>
        <WithPermissions action="list" resource="informal_groups">
          <MenuItem
            name="Informal Groups"
            label="Informal Groups"
            to="/informal_groups"
            icon={<LinkIcon />}
          />
        </WithPermissions>
        <WithPermissions action="list" resource="kingdoms">
          <MenuItem
            name="Kingdoms"
            label="Kingdoms"
            icon={<FiberManualRecordIcon />}
            to="/kingdoms"
          />
        </WithPermissions>
        <WithPermissions action="list" resource="cross_references">
          <MenuItem
            name="Related Names"
            label="Related Names"
            icon={<CompareArrowsIcon />}
            to="/cross_references"
          />
        </WithPermissions>
        <WithPermissions action="list" resource="taxon_ranks">
          <MenuItem
            name="Taxon Ranks"
            label="Taxon Ranks"
            to="/taxon_ranks"
            icon={<GroupWorkIcon />}
          />
        </WithPermissions>
        <WithPermissions action="list" resource="users">
          <MenuItem
            name="Users"
            label="Users"
            icon={<PeopleIcon />}
            to="/users"
          />
        </WithPermissions>
        <WithPermissions action="list" resource="vernaculars">
          <MenuItem
            name="Vernacular Names"
            label="Vernacular Names"
            to="/vernaculars"
            icon={<CallSplitIcon />}
          />
        </WithPermissions>
      </MenuItem>
    </MultiLevelMenu>
  );
};

export default Menu;
