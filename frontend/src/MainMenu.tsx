import React from 'react';
import { MultiLevelMenu, MenuItem } from '@react-admin/ra-navigation';
//import { makeStyles } from '@material-ui/core/styles';
//import BookIcon from '@material-ui/icons/Book';

// const useStyles = makeStyles(() => ({
//   menu: {
//     width: '200px',
//   },
//   icons: {
//     paddingRight: '15px',
//   },
//   chevron: {
//     padding: '0 15px',
//   },
// }));

const MainMenu = () => {
  //const classes = useStyles();
  return (
    <MultiLevelMenu>
      <MenuItem name={'Nomos'}>
        <MenuItem name={'Taxon Names'}>
          {/*<BookIcon className={classes.icons} />*/}
        </MenuItem>
        <MenuItem name="Publications" />
        <MenuItem name="Citations" />
        <MenuItem name="Authors" />
        <MenuItem name="Informal Groups" />
        <MenuItem name="Hierarchies" />
      </MenuItem>
      <MenuItem name="Admin">
        <MenuItem name="Kingdoms"></MenuItem>
        <MenuItem name="Taxon Ranks"> </MenuItem>
        <MenuItem name="Classification Systems"> </MenuItem>
        <MenuItem name="Users"> </MenuItem>
      </MenuItem>
    </MultiLevelMenu>
  );
};

export default MainMenu;
