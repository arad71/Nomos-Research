import { SimpleForm, TextInput } from 'react-admin';
import React, { FC } from 'react';
import { GlobalTheme } from '../../GlobalTheme';
import { Box, Typography } from '@mui/material';
import makeStyles from 'lib/makeStyles';
import EditToolbar from '../shared/EditToolbar';

const useStyles = makeStyles((theme: any) => ({
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    width: '100%',
    maxWidth: '880px',
    gridColumnGap: '1.5em',
    rowGap: '0.75em',
  },
}));

export const KingdomCreateEdit: FC = (props) => {
  const globalClasses = GlobalTheme();
  const classes = useStyles();
  return (
    <SimpleForm
      {...props}
      toolbar={<EditToolbar resource="kingdoms" />}
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
