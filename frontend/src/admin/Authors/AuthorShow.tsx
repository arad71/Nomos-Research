import React, { FC } from 'react';
import { TextField, Labeled } from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';
import Aside from '../shared/Aside';
import { Box, Typography } from '@material-ui/core';
import { GlobalTheme } from '../../GlobalTheme';
import { Show } from '@react-admin/ra-rbac';

const useStyles = makeStyles((theme) => ({
  showPad: {
    padding: '8px 16px',
  },
}));

export const AuthorShow: FC = (props) => {
  const classes = useStyles();
  const globalClasses = GlobalTheme();
  return (
    <Show aside={<Aside />} {...props}>
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
          <Labeled label="ORCID ID">
            <TextField source="orc_id" />
          </Labeled>
        </Box>
      </Box>
    </Show>
  );
};
