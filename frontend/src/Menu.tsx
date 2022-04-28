import * as React from 'react';
import { MultiLevelMenu, MenuItem } from '@react-admin/ra-navigation';
import BookIcon from '@material-ui/icons/Book';
import DashboardIcon from '@material-ui/icons/Dashboard';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
// eslint-disable-next-line max-len
import FiberManualRecordOutlinedIcon from '@material-ui/icons/FiberManualRecordOutlined';
import PeopleIcon from '@material-ui/icons/People';
import SubjectIcon from '@material-ui/icons/Subject';
import ChangeHistoryIcon from '@material-ui/icons/ChangeHistory';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import GroupWorkIcon from '@material-ui/icons/GroupWork';
import LinkIcon from '@material-ui/icons/Link';

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
        <MenuItem
          name="Taxon Names"
          label="Taxon Names"
          icon={<BookIcon />}
          to="/taxon_names"
        />
        <MenuItem
          name="Publications"
          label="Publications"
          to="/publications"
          icon={<SubjectIcon />}
        />
        <MenuItem
          name="Citations"
          label="Citations"
          to="/citations"
          icon={<SupervisedUserCircleIcon />}
        />
        <MenuItem
          name="Authors"
          label="Authors"
          icon={<PeopleIcon />}
          to="/authors"
        />
        <MenuItem
          name="Informal Groups"
          label="Informal Groups"
          to="/informal_groups"
          icon={<LinkIcon />}
        />
        <MenuItem
          name="Hierarchies"
          label="Hierarchies"
          to="/hierarchies"
          icon={<ChangeHistoryIcon />}
        />
      </MenuItem>
      <MenuItem name="Admin" label="Admin">
        <MenuItem
          name="Kingdoms"
          label="Kingdoms"
          icon={<FiberManualRecordIcon />}
          to="/kingdoms"
        />
        <MenuItem
          name="Taxon Ranks"
          label="Taxon Ranks"
          to="/taxon_ranks"
          icon={<GroupWorkIcon />}
        />
        <MenuItem
          name="Classification Systems"
          label="Classification Types"
          icon={<FiberManualRecordOutlinedIcon />}
          to="/classification_systems"
        />
        <MenuItem
          name="Users"
          label="Users"
          icon={<PeopleIcon />}
          to="/users"
        />
      </MenuItem>
    </MultiLevelMenu>
  );
};

export default Menu;
