import React, { FC } from 'react';
import { TextField, Labeled } from 'react-admin';
import makeStyles from '@mui/styles/makeStyles';
import Aside from '../shared/Aside';
import { Box, Typography } from '@mui/material';
import { GlobalTheme } from '../../GlobalTheme';
import { Show } from 'react-admin';
import { DisplayName } from './DisplayName';

const useStyles = makeStyles((theme: any) => ({
  showPad: {
    padding: '8px 16px',
  },
}));

export const AuthorShow: FC = (props) => {
  const classes = useStyles();
  const globalClasses = GlobalTheme();
  return (
    <Show aside={<Aside />} {...props} title={<DisplayName />}>
      <Box className={classes.showPad}>
        <Typography variant="h5" className={globalClasses.bold} gutterBottom>
          Author
        </Typography>
        <Box className={globalClasses.formRow}>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="First names(s)">
              <TextField source="first_names" />
            </Labeled>
          </Box>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="Surname">
              <TextField source="surname" />
            </Labeled>
          </Box>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="Initials">
              <TextField source="initials" />
            </Labeled>
          </Box>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="Abbreviation">
              <TextField source="abbreviation" />
            </Labeled>
          </Box>
        </Box>
        <Box className={globalClasses.fieldMargin}>
          <Labeled label="ORC ID">
            <TextField source="orc_id" />
          </Labeled>
        </Box>
      </Box>
    </Show>
  );
};
