import { SimpleForm, TextInput } from 'react-admin';
import React, { FC } from 'react';
import { GlobalTheme } from '../../GlobalTheme';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import EditToolbar from '../shared/EditToolbar';

const useStyles = makeStyles((theme) => ({
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    width: '50%',
    gridColumnGap: '1.5em',
  },
}));

export const KingdomCreateEdit: FC = (props) => {
  const globalClasses = GlobalTheme();
  const classes = useStyles();
  return (
    <SimpleForm
      {...props}
      toolbar={<EditToolbar resource="kingdoms" />}
      warnWhenUnsavedChanges
    >
      <Box>
        <Typography variant="h5" className={globalClasses.bold} gutterBottom>
          Kingdom
        </Typography>
      </Box>
      <Box className={classes.mainGrid}>
        <TextInput source="kingdom_name" />
        <TextInput multiline source="kingdom_desc" />
      </Box>
    </SimpleForm>
  );
};
