import { SimpleForm, TextInput } from 'react-admin';
import React, { FC } from 'react';
import { GlobalTheme } from '../../GlobalTheme';
import { Box, Typography, makeStyles } from '@material-ui/core';

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
    <SimpleForm {...props} warnWhenUnsavedChanges>
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
