import React, { FC } from 'react';
import { Labeled, TextField } from 'react-admin';
import { Show } from '@react-admin/ra-rbac';
import Aside from '../shared/Aside';
import { KingdomName } from './KingdomName';
import { GlobalTheme } from '../../GlobalTheme';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  showPad: {
    padding: '8px 16px',
  },
}));

export const KingdomShow: FC = (props) => {
  const classes = useStyles();
  const globalClasses = GlobalTheme();
  return (
    <Show aside={<Aside />} {...props} title={<KingdomName />}>
      <Box className={classes.showPad}>
        <Typography variant="h5" className={globalClasses.bold} gutterBottom>
          Kingdom
        </Typography>
        <Box className={globalClasses.formRow}>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="Kingdom Name">
              <TextField source="kingdom_name" />
            </Labeled>
          </Box>
        </Box>
        <Box className={globalClasses.formRow}>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="Kingdom Description">
              <TextField source="kingdom_desc" />
            </Labeled>
          </Box>
        </Box>
      </Box>
    </Show>
  );
};
