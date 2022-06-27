import React, { FC } from 'react';
import { Labeled, TextField, BooleanField, SelectField } from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';
import { Show } from '@react-admin/ra-rbac';
import { Box, Typography } from '@material-ui/core';
import Aside from '../shared/Aside';
import ClassificationType from './ClassificationType';
import { GlobalTheme } from '../../GlobalTheme';
import { ClassificationDescription } from './ClassDesc';

const useStyles = makeStyles((theme) => ({
  showPad: {
    padding: '8px 16px',
  },
}));

export const ClassificationSystemShow: FC = (props) => {
  const classes = useStyles();
  const globalClasses = GlobalTheme();
  return (
    <Show aside={<Aside />} {...props} title={<ClassificationDescription />}>
      <Box className={classes.showPad}>
        <Typography variant="h5" className={globalClasses.bold} gutterBottom>
          Classification system
        </Typography>
        <Box className={globalClasses.formRow}>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="Classification description">
              <TextField source="class_desc" />
            </Labeled>
          </Box>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="Classification type">
              <SelectField source="class_type" choices={ClassificationType} />
            </Labeled>
          </Box>
        </Box>
        <Box className={globalClasses.formRow}>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="Preferred">
              <BooleanField source="preferred" />
            </Labeled>
          </Box>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="Sort order">
              <TextField source="sort_order" />
            </Labeled>
          </Box>
        </Box>
      </Box>
    </Show>
  );
};
