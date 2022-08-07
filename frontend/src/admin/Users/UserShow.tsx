import React, { FC } from 'react';
import {
  BooleanField,
  ChipField,
  ReferenceArrayField,
  SingleFieldList,
  TextField,
  Labeled,
} from 'react-admin';
import { Show } from '@react-admin/ra-rbac';
import Aside from '../shared/Aside';
import { Box, Typography } from '@material-ui/core';
import { GlobalTheme } from '../../GlobalTheme';
import { makeStyles } from '@material-ui/core';
import { FullName } from './FullName';

const useStyles = makeStyles((theme) => ({
  showPad: {
    padding: '20px 16px 8px 16px',
  },
}));

export const UserShow: FC = (props) => {
  const globalClasses = GlobalTheme();
  const classes = useStyles();
  return (
    <Show aside={<Aside />} {...props} title={<FullName />}>
      <Box className={classes.showPad}>
        <Typography variant="h5" className={globalClasses.bold} gutterBottom>
          User information
        </Typography>
        <Box className={globalClasses.formRow}>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="First names">
              <TextField source="first_name" />
            </Labeled>
          </Box>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="Last name">
              <TextField source="last_name" />
            </Labeled>
          </Box>
        </Box>
        <Box className={globalClasses.formRow}>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="Email">
              <TextField source="email" />
            </Labeled>
          </Box>
        </Box>
        <Box className={globalClasses.sectionMargin}>
          <Typography variant="h5" className={globalClasses.bold} gutterBottom>
            Access
          </Typography>
          <Box className={globalClasses.formRow}>
            <Box className={globalClasses.fieldMargin}>
              <Labeled label="Roles">
                <ReferenceArrayField
                  label="User Roles"
                  reference="roles"
                  source="role_ids"
                >
                  <SingleFieldList>
                    <ChipField source="name" />
                  </SingleFieldList>
                </ReferenceArrayField>
              </Labeled>
            </Box>
          </Box>
        </Box>
      </Box>
    </Show>
  );
};
