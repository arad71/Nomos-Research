import * as React from 'react';
import { MultiLevelMenu, MenuItem } from '@react-admin/ra-navigation';
//import { makeStyles } from '@material-ui/core/styles';
import BookIcon from '@material-ui/icons/Book';
import DashboardIcon from '@material-ui/icons/Dashboard';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import FiberManualRecordOutlinedIcon from '@material-ui/icons/FiberManualRecordOutlined';
import PeopleIcon from '@material-ui/icons/People';
import SubjectIcon from '@material-ui/icons/Subject';
import ChangeHistoryIcon from '@material-ui/icons/ChangeHistory';
//
// const useStyles = makeStyles(() => ({
//    menu: {
//      paddingLeft: '200px',
//   },
//
//  }));

const Menu = () => {
  //const classes = useStyles();
  return (
    <MultiLevelMenu initialOpen>
      <MenuItem name="Dashboard" label="Dashboard" icon={<DashboardIcon />} to="/" />
      <MenuItem name="Nomos" label="Nomos">
        <MenuItem name="Taxon Names" label="Taxon Names" icon={<BookIcon />} to="/taxon_names" />
        <MenuItem name="Publications" label="Publications" to="/publications" icon={<SubjectIcon />} />
        <MenuItem name="Citations" label="Citations" to="/citations" />
        <MenuItem name="Authors" label="Authors" icon={<PeopleIcon />} to="/authors"/>
        <MenuItem name="Informal Groups" label="Informal Groups" to="/informal_groups"/>
        <MenuItem name="Hierarchies" label="Hierarchies" to="/hierarchies" icon={<ChangeHistoryIcon />} />
      </MenuItem>
      <MenuItem name="Admin" label="Admin">
        <MenuItem name="Kingdoms" label="Kingdoms" icon={<FiberManualRecordIcon />} to="/kingdoms"/>
        <MenuItem name="Taxon Ranks" label="Taxon Ranks" to="/taxon_ranks"/>
        <MenuItem
          name="Classification Systems"
          label="Classification Systems"
          icon={<FiberManualRecordOutlinedIcon/>}
          to="/classification_systems"
        />
        <MenuItem name="Users" label="Users" icon={<PeopleIcon />} to="/users" />
      </MenuItem>
    </MultiLevelMenu>
  );
};

export default Menu;
