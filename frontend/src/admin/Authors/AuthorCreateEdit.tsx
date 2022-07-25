import {
  required,
  SimpleForm,
  TextInput,
  SaveButton,
  DeleteButton,
  Toolbar,
} from 'react-admin';
import { WithPermissions } from '@react-admin/ra-rbac';
import React, { FC } from 'react';
import { Box, Typography } from '@material-ui/core';
import { GlobalTheme } from '../../GlobalTheme';
import { makeStyles } from '@material-ui/core';
import EditToolbar from '../shared/EditToolbar';

const useStyles = makeStyles((theme) => ({
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '3fr 3fr 1fr 3fr',
    width: '70%',
    gridColumnGap: '1.5em',
  },
  orcRow: {
    gridColumnStart: '1',
    gridColumnEnd: '3',
    marginBottom: '20%',
  },
}));

export const AuthorCreateEdit: FC = (props) => {
  const globalClasses = GlobalTheme();
  const classes = useStyles();
  return (
    <SimpleForm
      {...props}
      toolbar={<EditToolbar resource="authors" />}
      warnWhenUnsavedChanges
    >
      <Box>
        <Typography variant="h5" className={globalClasses.bold} gutterBottom>
          Author
        </Typography>
      </Box>
      <Box className={classes.mainGrid}>
        <Box>
          <TextInput source="surname" fullWidth />
        </Box>
        <Box>
          <TextInput source="first_names" fullWidth />
        </Box>
        <Box>
          <TextInput source="initials" fullWidth />
        </Box>
        <Box>
          <TextInput source="abbreviation" fullWidth validate={[required()]} />
        </Box>
        <Box className={classes.orcRow}>
          <TextInput source="orc_id" label="ORC ID" fullWidth />
        </Box>
      </Box>
    </SimpleForm>
  );
};
